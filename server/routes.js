const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { supabase, dbHelpers } = require('./db');
const {
  COOKIE_NAME,
  generateToken,
  requireAdminApi,
  comparePassword,
} = require('./auth');

const STORAGE_BUCKET = 'gallery';

// Slug/ID generator
function generateEventId(title) {
  const baseSlug = (title || 'event')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const rand = Math.random().toString(36).substring(2, 7);
  return `${baseSlug || 'event'}-${Date.now().toString(36)}-${rand}`;
}

// Multer memory storage (buffers in RAM for upload to Supabase Storage)
const storage = multer.memoryStorage();

// File filter validation
const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

const ALLOWED_VIDEO_EXTS = ['.mp4', '.webm', '.mov', '.mkv'];
const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  const isAllowedImage = ALLOWED_IMAGE_EXTS.includes(ext) || ALLOWED_IMAGE_MIMES.includes(mime);
  const isAllowedVideo = ALLOWED_VIDEO_EXTS.includes(ext) || ALLOWED_VIDEO_MIMES.includes(mime);

  if (isAllowedImage || isAllowedVideo) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.originalname}. Supported formats are JPG, PNG, WEBP, MP4, WEBM, MOV, MKV.`));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max per file (Supabase Free tier limit)
    files: 50, // max 50 files per batch
  },
});

// Helper function to upload a buffer directly to Supabase Storage
async function uploadToSupabaseStorage(file, eventId) {
  const isVideo = (file.mimetype || '').startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.originalname);
  const mediaType = isVideo ? 'video' : 'image';
  const subFolder = isVideo ? 'videos' : 'images';

  const ext = path.extname(file.originalname).toLowerCase() || (isVideo ? '.mp4' : '.jpg');
  const cleanName = path.basename(file.originalname, ext)
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '_')
    .substring(0, 40);
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
  const fileName = `${cleanName}-${uniqueSuffix}${ext}`;
  const storagePath = `${eventId}/${subFolder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype || (isVideo ? 'video/mp4' : 'image/jpeg'),
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload ${file.originalname}: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  const fileUrl = publicUrlData ? publicUrlData.publicUrl : '';

  return {
    mediaType,
    fileUrl,
    storagePath,
    fileName: file.originalname,
    fileSize: file.size,
  };
}

/* ═══════════════════════════════════════════════════════════
   PUBLIC API ROUTES
═══════════════════════════════════════════════════════════ */

// GET /api/events — Public list of events
router.get('/events', async (req, res) => {
  try {
    const events = await dbHelpers.getAllEvents();
    res.json({
      success: true,
      events: events.map(e => ({
        id: e.id,
        name: e.title,
        title: e.title,
        date: e.event_date,
        year: e.event_date ? e.event_date.substring(0, 4) : '',
        category: 'events',
        description: e.description || '',
        coverImage: e.coverImage || '',
        coverAlt: e.title + ' Cover Image',
        photoCount: e.photoCount || 0,
        videoCount: e.videoCount || 0,
        createdAt: e.created_at,
      })),
    });
  } catch (err) {
    console.error('[API] Error fetching public events:', err);
    res.status(500).json({ error: 'Failed to load gallery events.' });
  }
});

// GET /api/events/:id — Public event detail with media
router.get('/events/:id', async (req, res) => {
  try {
    const event = await dbHelpers.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Gallery event not found.' });
    }
    res.json({
      success: true,
      event: {
        id: event.id,
        name: event.title,
        title: event.title,
        date: event.event_date,
        year: event.event_date ? event.event_date.substring(0, 4) : '',
        category: 'events',
        description: event.description || '',
        coverImage: event.coverImage || '',
        coverAlt: event.title + ' Cover Image',
        photoCount: event.photoCount || 0,
        videoCount: event.videoCount || 0,
        photos: event.photos || [],
        videos: event.videos || [],
        createdAt: event.created_at,
      },
    });
  } catch (err) {
    console.error('[API] Error fetching event details:', err);
    res.status(500).json({ error: 'Failed to load event details.' });
  }
});

/* ═══════════════════════════════════════════════════════════
   ADMIN AUTHENTICATION ROUTES
═══════════════════════════════════════════════════════════ */

// POST /api/admin/login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = await dbHelpers.findUserByUsername(username.trim());
    if (!user || !comparePassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = generateToken(user);

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    res.json({
      success: true,
      message: 'Login successful.',
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (err) {
    console.error('[Admin API] Login error:', err);
    res.status(500).json({ error: 'Login process error: ' + (err.message || 'Server error') });
  }
});

// POST /api/admin/logout
router.post('/admin/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json({ success: true, message: 'Logged out successfully.' });
});

// GET /api/admin/me
router.get('/admin/me', requireAdminApi, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      createdAt: req.user.created_at,
    },
  });
});

/* ═══════════════════════════════════════════════════════════
   PROTECTED ADMIN MANAGEMENT ROUTES
═══════════════════════════════════════════════════════════ */

// GET /api/admin/stats — Dashboard summary
router.get('/admin/stats', requireAdminApi, async (req, res) => {
  try {
    const stats = await dbHelpers.getStats();
    res.json({ success: true, stats });
  } catch (err) {
    console.error('[Admin API] Error getting stats:', err);
    res.status(500).json({ error: 'Failed to retrieve stats.' });
  }
});

// GET /api/admin/events — List all events for admin
router.get('/admin/events', requireAdminApi, async (req, res) => {
  try {
    const events = await dbHelpers.getAllEvents();
    res.json({ success: true, events });
  } catch (err) {
    console.error('[Admin API] Error getting events:', err);
    res.status(500).json({ error: 'Failed to retrieve events.' });
  }
});

// GET /api/admin/events/:id — Single event with all media
router.get('/admin/events/:id', requireAdminApi, async (req, res) => {
  try {
    const event = await dbHelpers.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    res.json({ success: true, event });
  } catch (err) {
    console.error('[Admin API] Error getting event:', err);
    res.status(500).json({ error: 'Failed to retrieve event.' });
  }
});

// POST /api/admin/events — Create new event with optional media files
router.post('/admin/events', requireAdminApi, (req, res, next) => {
  upload.array('media', 50)(req, res, function (err) {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File exceeds maximum upload size limit (50MB).' });
      }
      return res.status(400).json({ error: err.message || 'File upload failed.' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { title, event_date, description } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Event Name (title) is required.' });
    }

    if (!event_date || !event_date.trim()) {
      return res.status(400).json({ error: 'Event Date is required.' });
    }

    const eventId = generateEventId(title);

    // Create event in database
    await dbHelpers.createEvent({
      id: eventId,
      title: title.trim(),
      event_date: event_date.trim(),
      description: description ? description.trim() : '',
    });

    // Upload media files to Supabase Storage if present
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const uploaded = await uploadToSupabaseStorage(file, eventId);
          const mediaId = 'm-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);

          await dbHelpers.addMedia({
            id: mediaId,
            event_id: eventId,
            media_type: uploaded.mediaType,
            file_url: uploaded.fileUrl,
            storage_path: uploaded.storagePath,
            file_name: uploaded.fileName,
            file_size: uploaded.fileSize,
          });
        } catch (uploadErr) {
          console.error('[Storage Error]', uploadErr);
        }
      }
    }

    const createdEvent = await dbHelpers.getEventById(eventId);
    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      event: createdEvent,
    });
  } catch (err) {
    console.error('[Admin API] Error creating event:', err);
    res.status(500).json({ error: 'Failed to create event. ' + (err.message || '') });
  }
});

// POST /api/admin/events/:id/media — Upload additional photos or videos to an existing event
router.post('/admin/events/:id/media', requireAdminApi, (req, res, next) => {
  upload.array('media', 50)(req, res, function (err) {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File exceeds maximum upload size limit (50MB).' });
      }
      return res.status(400).json({ error: err.message || 'File upload failed.' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await dbHelpers.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files were provided for upload.' });
    }

    const addedMedia = [];
    for (const file of req.files) {
      const uploaded = await uploadToSupabaseStorage(file, eventId);
      const mediaId = 'm-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);

      const record = await dbHelpers.addMedia({
        id: mediaId,
        event_id: eventId,
        media_type: uploaded.mediaType,
        file_url: uploaded.fileUrl,
        storage_path: uploaded.storagePath,
        file_name: uploaded.fileName,
        file_size: uploaded.fileSize,
      });

      addedMedia.push(record);
    }

    const updatedEvent = await dbHelpers.getEventById(eventId);
    res.json({
      success: true,
      message: `Uploaded ${addedMedia.length} media file(s) successfully.`,
      addedCount: addedMedia.length,
      event: updatedEvent,
    });
  } catch (err) {
    console.error('[Admin API] Error uploading media:', err);
    res.status(500).json({ error: 'Failed to upload media. ' + (err.message || '') });
  }
});

// DELETE /api/admin/media/:id — Delete a single photo or video
router.delete('/admin/media/:id', requireAdminApi, async (req, res) => {
  try {
    const mediaId = req.params.id;
    const media = await dbHelpers.getMediaById(mediaId);
    if (!media) {
      return res.status(404).json({ error: 'Media file not found.' });
    }

    // Delete record from DB
    await dbHelpers.deleteMedia(mediaId);

    // Delete file from Supabase Storage
    if (media.storage_path) {
      try {
        await supabase.storage.from(STORAGE_BUCKET).remove([media.storage_path]);
      } catch (storageErr) {
        console.warn('[Storage] Warning: Failed to remove file from storage:', media.storage_path, storageErr.message);
      }
    }

    res.json({
      success: true,
      message: 'Media deleted successfully.',
      deletedMediaId: mediaId,
    });
  } catch (err) {
    console.error('[Admin API] Error deleting media:', err);
    res.status(500).json({ error: 'Failed to delete media.' });
  }
});

// DELETE /api/admin/events/:id — Delete entire event, all media records, and storage files
router.delete('/admin/events/:id', requireAdminApi, async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await dbHelpers.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Delete from DB (returns associated media)
    const result = await dbHelpers.deleteEvent(eventId);

    // Delete all media files from Supabase Storage
    if (result.media && result.media.length > 0) {
      const storagePaths = result.media
        .map(m => m.storage_path)
        .filter(Boolean);

      if (storagePaths.length > 0) {
        try {
          await supabase.storage.from(STORAGE_BUCKET).remove(storagePaths);
        } catch (storageErr) {
          console.warn('[Storage] Warning: could not remove files from storage:', storageErr.message);
        }
      }
    }

    res.json({
      success: true,
      message: 'Event and all associated media deleted successfully.',
      deletedEventId: eventId,
    });
  } catch (err) {
    console.error('[Admin API] Error deleting event:', err);
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});

module.exports = router;
