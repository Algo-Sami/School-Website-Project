const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { dbHelpers } = require('./db');
const {
  COOKIE_NAME,
  generateToken,
  requireAdminApi,
  comparePassword,
} = require('./auth');

// Storage base directory
const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads', 'gallery');
if (!fs.existsSync(UPLOADS_ROOT)) {
  fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
}

// Slug/ID generator
function generateEventId(title) {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const rand = Math.random().toString(36).substring(2, 7);
  return `${baseSlug || 'event'}-${Date.now().toString(36)}-${rand}`;
}

// Multer storage engine that routes files into uploads/gallery/:eventId/images or uploads/gallery/:eventId/videos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const eventId = req.params.id || req.body.eventId || req._tempEventId || 'temp';
    const isVideo = file.mimetype.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.originalname);
    const subFolder = isVideo ? 'videos' : 'images';
    const targetDir = path.join(UPLOADS_ROOT, eventId, subFolder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext)
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '_')
      .substring(0, 40);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  },
});

// File filter validation
const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

const ALLOWED_VIDEO_EXTS = ['.mp4', '.webm', '.mov', '.mkv'];
const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

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
    fileSize: 100 * 1024 * 1024, // 100MB overall max
    files: 50, // max 50 files per batch
  },
});

// Middleware to assign a temporary event ID before multer processes files on create
function prepareCreateEvent(req, res, next) {
  const title = (req.body && req.body.title) ? req.body.title : 'event';
  req._tempEventId = generateEventId(title);
  next();
}

/* ═══════════════════════════════════════════════════════════
   PUBLIC API ROUTES
═══════════════════════════════════════════════════════════ */

// GET /api/events — Public list of events
router.get('/events', (req, res) => {
  try {
    const events = dbHelpers.getAllEvents();
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
router.get('/events/:id', (req, res) => {
  try {
    const event = dbHelpers.getEventById(req.params.id);
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
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = dbHelpers.findUserByUsername(username.trim());
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
router.get('/admin/stats', requireAdminApi, (req, res) => {
  try {
    const stats = dbHelpers.getStats();
    res.json({ success: true, stats });
  } catch (err) {
    console.error('[Admin API] Error getting stats:', err);
    res.status(500).json({ error: 'Failed to retrieve stats.' });
  }
});

// GET /api/admin/events — List all events for admin
router.get('/admin/events', requireAdminApi, (req, res) => {
  try {
    const events = dbHelpers.getAllEvents();
    res.json({ success: true, events });
  } catch (err) {
    console.error('[Admin API] Error getting events:', err);
    res.status(500).json({ error: 'Failed to retrieve events.' });
  }
});

// GET /api/admin/events/:id — Single event with all media
router.get('/admin/events/:id', requireAdminApi, (req, res) => {
  try {
    const event = dbHelpers.getEventById(req.params.id);
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
        return res.status(400).json({ error: 'File exceeds maximum upload size limit (100MB).' });
      }
      return res.status(400).json({ error: err.message || 'File upload failed.' });
    }
    next();
  });
}, (req, res) => {
  try {
    const { title, event_date, description } = req.body || {};

    if (!title || !title.trim()) {
      // Clean up uploaded files if title validation failed
      if (req.files && req.files.length > 0) {
        req.files.forEach(f => {
          if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
        });
      }
      return res.status(400).json({ error: 'Event Name (title) is required.' });
    }

    if (!event_date || !event_date.trim()) {
      if (req.files && req.files.length > 0) {
        req.files.forEach(f => {
          if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
        });
      }
      return res.status(400).json({ error: 'Event Date is required.' });
    }

    const eventId = generateEventId(title);

    // If files were uploaded during this request, rename/move them if needed or use generated eventId
    // Let's create the event record
    dbHelpers.createEvent({
      id: eventId,
      title: title.trim(),
      event_date: event_date.trim(),
      description: description ? description.trim() : '',
    });

    // Save uploaded media files
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const isVideo = file.mimetype.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.originalname);
        const mediaType = isVideo ? 'video' : 'image';
        const subFolder = isVideo ? 'videos' : 'images';
        
        // Target permanent folder
        const finalFolder = path.join(UPLOADS_ROOT, eventId, subFolder);
        if (!fs.existsSync(finalFolder)) {
          fs.mkdirSync(finalFolder, { recursive: true });
        }
        
        const finalFilePath = path.join(finalFolder, path.basename(file.path));
        if (file.path !== finalFilePath) {
          fs.renameSync(file.path, finalFilePath);
        }

        const mediaId = 'm-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
        const fileUrl = `/uploads/gallery/${eventId}/${subFolder}/${path.basename(finalFilePath)}`;
        const storagePath = path.relative(path.join(__dirname, '..'), finalFilePath).replace(/\\/g, '/');

        dbHelpers.addMedia({
          id: mediaId,
          event_id: eventId,
          media_type: mediaType,
          file_url: fileUrl,
          storage_path: storagePath,
          file_name: file.originalname,
          file_size: file.size,
        });
      });
    }

    const createdEvent = dbHelpers.getEventById(eventId);
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
        return res.status(400).json({ error: 'File exceeds maximum upload size limit (100MB).' });
      }
      return res.status(400).json({ error: err.message || 'File upload failed.' });
    }
    next();
  });
}, (req, res) => {
  try {
    const eventId = req.params.id;
    const event = dbHelpers.getEventById(eventId);
    if (!event) {
      // Clean up uploaded files
      if (req.files && req.files.length > 0) {
        req.files.forEach(f => {
          if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
        });
      }
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files were provided for upload.' });
    }

    const addedMedia = [];
    req.files.forEach(file => {
      const isVideo = file.mimetype.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.originalname);
      const mediaType = isVideo ? 'video' : 'image';
      const subFolder = isVideo ? 'videos' : 'images';

      const finalFolder = path.join(UPLOADS_ROOT, eventId, subFolder);
      if (!fs.existsSync(finalFolder)) {
        fs.mkdirSync(finalFolder, { recursive: true });
      }

      const finalFilePath = path.join(finalFolder, path.basename(file.path));
      if (file.path !== finalFilePath) {
        fs.renameSync(file.path, finalFilePath);
      }

      const mediaId = 'm-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
      const fileUrl = `/uploads/gallery/${eventId}/${subFolder}/${path.basename(finalFilePath)}`;
      const storagePath = path.relative(path.join(__dirname, '..'), finalFilePath).replace(/\\/g, '/');

      const record = dbHelpers.addMedia({
        id: mediaId,
        event_id: eventId,
        media_type: mediaType,
        file_url: fileUrl,
        storage_path: storagePath,
        file_name: file.originalname,
        file_size: file.size,
      });

      addedMedia.push(record);
    });

    const updatedEvent = dbHelpers.getEventById(eventId);
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
router.delete('/admin/media/:id', requireAdminApi, (req, res) => {
  try {
    const mediaId = req.params.id;
    const media = dbHelpers.getMediaById(mediaId);
    if (!media) {
      return res.status(404).json({ error: 'Media file not found.' });
    }

    // Delete record from DB
    dbHelpers.deleteMedia(mediaId);

    // Delete physical file from storage
    if (media.storage_path) {
      const fullPath = path.join(__dirname, '..', media.storage_path);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (err) {
          console.warn('[Storage] Warning: Failed to unlink file:', fullPath, err.message);
        }
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

// DELETE /api/admin/events/:id — Delete entire event, all media records, and physical files
router.delete('/admin/events/:id', requireAdminApi, (req, res) => {
  try {
    const eventId = req.params.id;
    const event = dbHelpers.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Delete from DB (returns associated media)
    const result = dbHelpers.deleteEvent(eventId);

    // Delete all media files on disk
    if (result.media && result.media.length > 0) {
      result.media.forEach(m => {
        if (m.storage_path) {
          const fullPath = path.join(__dirname, '..', m.storage_path);
          if (fs.existsSync(fullPath)) {
            try {
              fs.unlinkSync(fullPath);
            } catch (err) {
              console.warn('[Storage] Warning: could not delete file:', fullPath);
            }
          }
        }
      });
    }

    // Delete event directory recursively
    const eventDir = path.join(UPLOADS_ROOT, eventId);
    if (fs.existsSync(eventDir)) {
      try {
        fs.rmSync(eventDir, { recursive: true, force: true });
      } catch (err) {
        console.warn('[Storage] Warning: could not remove event folder:', eventDir);
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
