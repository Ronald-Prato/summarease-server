import multer from "multer";

export const storage = multer.diskStorage({
  filename: function (_, file, cb) {
    cb(null, file.originalname);
  },
  destination: function (_, __, cb) {
    cb(null, `${__dirname}/../../audios`);
  },
});
