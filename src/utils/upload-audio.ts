import multer from "multer";

export const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
  destination: function (req, file, cb) {
    cb(null, `${__dirname}/audios`);
  },
});
