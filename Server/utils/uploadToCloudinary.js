import { v2 as Cloudinary } from "cloudinary";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const upload_stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(upload_stream);
  });
}
export default uploadToCloudinary;
