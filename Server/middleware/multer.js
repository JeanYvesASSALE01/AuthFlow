import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (!file) {
      const error = new Error("Fichier manquant");
      error.status = 400;
      return cb(error);
    }

    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png"
    ) {
      return cb(null, true);
    }

    const error = new Error("Format de fichier non supporté");
    error.status = 400;
    return cb(error);
  },
});

export default upload;
