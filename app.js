const app = require("express")()
const fs = require("fs")
const upload = require("./storage")

app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/index.html")
});

app.get("/video", (req, res)=>{
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
    }
    const videoPath = "video.mp4";
    const videoSize = fs.statSync("video.mp4").size;
    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1)
    const contentLength = end- start + 1;

    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4"
    };
    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, {start, end});
    videoStream.pipe(res);
})

app.post('/upload-video', upload.single('myVideo'), (req, res) => {
    console.log(`Video uploaded: ${req.file.filename}`)
    res.status(200).send("sucessfully uploaded")
})

app.listen(5000, ()=>{
    console.log("server running on port 5000")
})