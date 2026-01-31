import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";



const storage = new CloudinaryStorage({

  cloudinary,

  params: {

    folder: "users",

    allowed_formats: ["jpg", "jpeg", "png", "webp"],

    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" }
    ]

  }

});


const upload = multer({

  storage,

  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }

});

export default upload;
