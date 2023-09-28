const multer = require("multer")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname)
    },
    filename: function (req, file, cb) {
        cb(null, "video.mp4");
    },
});
const upload = multer({ storage: storage })
module.exports = upload