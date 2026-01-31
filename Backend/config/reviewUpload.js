import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";



const storage = new CloudinaryStorage({

  cloudinary,

  params: {

    folder: "reviews",

    resource_type: "auto", // image + video

    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "mp4",
      "mov",
      "webm"
    ]

  }

});



const upload = multer({

  storage,

  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB (videos)
  }

});

export default upload;
