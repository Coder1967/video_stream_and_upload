const multer = require("multer")
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "videos"))
    },
    filename: function (req, file, cb) {
        const originalname = path.parse(file.originalname).name; 
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const newFilename = `${originalname}-${timestamp}${extension}`;
    cb(null, newFilename);
    },
});
const upload = multer({ storage: storage,
	limits: {
		fileSize: 1024 * 1024 * 200
	}
})
module.exports = upload
