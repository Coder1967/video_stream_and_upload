const app = require("express")();
const fs = require("fs");
const path = require("path")
const upload = require("./storage");
const cors = require('cors');
const ejs = require("ejs");
const getMimeType = require("./formatHandler")
app.set('view engine', 'ejs');
app.set('views', __dirname);
app.use(cors())

app.get("/:videoName", (req, res)=>{
  fs.access(`videos/${req.params.videoName}`, fs.constants.F_OK, (err) => {
  if (err) {
    return res.status(404).send("<h1>Video does not exist</h2>")
  }
  if (null) return res.status(400).send("unrecognized mimetype");
  videoName = req.params.videoName
  res.render('index', { videoName});
});
});


app.get("/video/:videoName", (req, res)=>{
    const range = req.headers.range;
    const mimeType = getMimeType(req.params.videoName)
    const videoName = req.params.videoName
    if (!range) {
        res.status(400).send("Requires Range header");
    }
    const videoPath = "./videos/"+videoName;
    const videoSize = fs.statSync(videoPath).size;
    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1)
    const contentLength = end- start + 1;

    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": mimeType
    };
    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, {start, end});
    videoStream.pipe(res);
})


app.post('/upload-video', upload.single('myVideo'), (req, res) => {
    fs.appendFile("videoContent.txt", req.file.filename + ",", (err) => {
  if (err) throw err;
  console.log('Data appended to file!');
});
    res.status(200).send("sucessfully uploaded")
})


app.get("/existing/videos", (req, res)=>{
  fs.stat(path.join(__dirname, "videoContent.txt"), (err, stats) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send("Something went wrong")
    } else {
      if (stats.size === 0) {
        return res.status(400).send("No videos available")
      } else {
        res.status(200).sendFile(path.join(__dirname, "videoContent.txt"))
      }
    }
  });
})


app.listen(5000, ()=>{
    console.log("server running on port 5000")
})
