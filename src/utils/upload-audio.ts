import multer from "multer";

const getAbsolutePath = () => {
  const prevDirname = __dirname.split("/");
  return prevDirname.slice(0, prevDirname.length - 2).join("/");
};

export const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
  destination: function (req, file, cb) {
    cb(null, `${__dirname}/../../audios`);
  },
});
