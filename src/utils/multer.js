import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "uploads/documents/";
    if (req.body.type === "profile_image") {
      uploadPath = "uploads/profiles/";
    } else if (req.body.type === "product_image") {
      uploadPath = "uploads/products/";
    }
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

export default upload;
