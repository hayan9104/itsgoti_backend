const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Check file type - allow images and videos
const fileFilter = (req, file, cb) => {
  // Image types
  const imageTypes = /jpeg|jpg|png|gif|webp|svg/;
  // Video types
  const videoTypes = /mp4|webm|ogg|mov|avi/;
  // Combined allowed types for extension check
  const allowedExtTypes = /jpeg|jpg|png|gif|webp|svg|mp4|webm|ogg|mov|avi/;
  // Allowed mimetypes
  const allowedMimeTypes = /image\/(jpeg|jpg|png|gif|webp|svg\+xml)|video\/(mp4|webm|ogg|quicktime|x-msvideo)/;

  const extname = allowedExtTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedMimeTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit (for videos)
  fileFilter: fileFilter,
});

module.exports = upload;
