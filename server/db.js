const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('[DB] Warning: SUPABASE_URL or SUPABASE_SERVICE_KEY is missing from environment variables.');
}

// Service-role client — full DB access, server-side only
const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_SERVICE_KEY || 'placeholder',
  {
    auth: { persistSession: false },
  }
);

// ---------------------------------------------------------------------------
// Seed default admin user if the table is empty
// ---------------------------------------------------------------------------
async function seedDefaultAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return;
  try {
    const { count, error } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('[DB] Error checking admin_users count:', error.message);
      return;
    }

    if (count === 0) {
      const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
      const defaultPassword = process.env.ADMIN_PASSWORD || 'AimpsAdmin2026!';
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(defaultPassword, salt);
      const id = 'admin-' + Date.now();

      const { error: insertError } = await supabase.from('admin_users').insert({
        id,
        username: defaultUsername,
        password_hash: hash,
      });

      if (insertError) {
        console.error('[DB] Failed to seed admin user:', insertError.message);
      } else {
        console.log(`[DB] Default admin user '${defaultUsername}' initialized.`);
      }
    }
  } catch (err) {
    console.error('[DB] Seed error:', err.message);
  }
}

// Run seed on startup (non-blocking)
seedDefaultAdmin().catch(console.error);

// ---------------------------------------------------------------------------
// Database helper functions (all async)
// ---------------------------------------------------------------------------
const dbHelpers = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  async findUserByUsername(username) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },

  async findUserById(id) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, username, created_at')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },

  // ── Stats ─────────────────────────────────────────────────────────────────
  async getStats() {
    const [eventsRes, photosRes, videosRes] = await Promise.all([
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('event_media').select('*', { count: 'exact', head: true }).eq('media_type', 'image'),
      supabase.from('event_media').select('*', { count: 'exact', head: true }).eq('media_type', 'video'),
    ]);
    return {
      totalEvents: eventsRes.count ?? 0,
      totalPhotos: photosRes.count ?? 0,
      totalVideos: videosRes.count ?? 0,
    };
  },

  // ── Events ────────────────────────────────────────────────────────────────
  async getAllEvents() {
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        *,
        event_media ( id, media_type, file_url, created_at )
      `)
      .order('event_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (events || []).map((e) => {
      const media = e.event_media || [];
      const images = media.filter((m) => m.media_type === 'image');
      return {
        ...e,
        photoCount: images.length,
        videoCount: media.filter((m) => m.media_type === 'video').length,
        coverImage: images.length > 0 ? images[0].file_url : '',
        event_media: undefined,
      };
    });
  },

  async getEventById(id) {
    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        event_media ( * )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!event) return null;

    const media = (event.event_media || []).sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    const photos = media
      .filter((m) => m.media_type === 'image')
      .map((m) => ({
        id: m.id,
        src: m.file_url,
        alt: event.title + ' photo',
        fileName: m.file_name,
        fileSize: m.file_size,
        storagePath: m.storage_path,
        createdAt: m.created_at,
      }));

    const videos = media
      .filter((m) => m.media_type === 'video')
      .map((m) => ({
        id: m.id,
        fileUrl: m.file_url,
        title: m.file_name || event.title + ' Video',
        fileName: m.file_name,
        fileSize: m.file_size,
        storagePath: m.storage_path,
        createdAt: m.created_at,
      }));

    const images = media.filter((m) => m.media_type === 'image');

    return {
      ...event,
      photoCount: photos.length,
      videoCount: videos.length,
      coverImage: images.length > 0 ? images[0].file_url : '',
      photos,
      videos,
      event_media: undefined,
    };
  },

  async createEvent({ id, title, event_date, description }) {
    const now = new Date().toISOString();
    const { error } = await supabase.from('events').insert({
      id,
      title,
      event_date,
      description: description || '',
      created_at: now,
      updated_at: now,
    });
    if (error) throw new Error(error.message);
    return this.getEventById(id);
  },

  async updateEvent(id, { title, event_date, description }) {
    const { error } = await supabase
      .from('events')
      .update({
        title,
        event_date,
        description: description || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw new Error(error.message);
    return this.getEventById(id);
  },

  async deleteEvent(id) {
    // Fetch media first (for storage cleanup)
    const { data: media } = await supabase
      .from('event_media')
      .select('*')
      .eq('event_id', id);

    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw new Error(error.message);

    return { success: true, media: media || [] };
  },

  // ── Media ─────────────────────────────────────────────────────────────────
  async addMedia({ id, event_id, media_type, file_url, storage_path, file_name, file_size }) {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('event_media')
      .insert({
        id,
        event_id,
        media_type,
        file_url,
        storage_path,
        file_name: file_name || '',
        file_size: file_size || 0,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getMediaById(id) {
    const { data, error } = await supabase
      .from('event_media')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteMedia(id) {
    const media = await this.getMediaById(id);
    if (!media) return null;
    const { error } = await supabase.from('event_media').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return media;
  },
};

module.exports = { supabase, dbHelpers };
