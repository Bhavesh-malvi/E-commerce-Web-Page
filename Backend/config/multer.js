import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";
import fs from "fs";
import path from "path";



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), 'uploads');
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1])
  }
});

// Keep these for potential direct route usage if needed, or legacy compatibility
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "users",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" }
    ]
  }
});

const bannerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "banners",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  }
});

const productBannerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "product-banners",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  }
});


const upload = multer({
  storage: cloudinaryStorage, // Switch to Cloudinary
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

const bannerUpload = multer({
  storage: bannerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});

const productBannerUpload = multer({
  storage: productBannerStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 
  }
});

export { bannerUpload, productBannerUpload };
export default upload;

