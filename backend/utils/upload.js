const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store files in memory (no disk needed — works on Render free tier)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 4 }, // 5MB per file, max 4 files
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// Upload a single buffer to Cloudinary, return secure URL
function uploadToCloudinary(buffer, folder = "myequipo/machines") {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ width: 1200, height: 900, crop: "limit", quality: "auto" }] },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

// Upload multiple files and return array of URLs
async function uploadMultipleToCloudinary(files) {
  if (!files || files.length === 0) return [];
  const urls = await Promise.all(files.map((f) => uploadToCloudinary(f.buffer)));
  return urls;
}

module.exports = { upload, uploadToCloudinary, uploadMultipleToCloudinary };