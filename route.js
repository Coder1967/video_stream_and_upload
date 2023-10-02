const fs = require("fs");
const path = require("path")
const router = require("express").Router()
const queue = require("./helpers/transcribe_video")
const util = require('util');
const getMimeType = require("./helpers/formatHandler")
const writeFileAsync = util.promisify(fs.writeFile);
const readFileAsync = util.promisify(fs.readFile);
const deserializeChunks = require("./helpers/deserialize_base64")
const appendFileAsync = util.promisify(fs.appendFile)


router.get("/:videoName", (req, res)=>{
  fs.access(`videos/${req.params.videoName}`, fs.constants.F_OK, (err) => {
  if (err) return res.status(404).send("<h1>Video does not exist</h2>")
  videoName = req.params.videoName
  let byteSize = fs.statSync(`./videos/${videoName}`).size;
  let mbSize = byteSize / (1024 * 1024)

  if (mbSize < 15) {
    return res.status(200).sendFile(path.join(__dirname, "videos", videoName))
  }
  res.render('index', { videoName});
});
});


router.get("/video/:videoName", (req, res)=>{
    const range = req.headers.range;
    const mimeType = getMimeType(req.params.videoName)
    const videoName = req.params.videoName
    if (!range) {
        res.status(400).send("Requires Range header");
    }
    const videoPath = "./videos/"+videoName;
    const videoSize = fs.statSync(videoPath).size;
    const CHUNK_SIZE = 5 ** 6;
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


router.post('/uploadVideo/:videoName', async(req, res) => {
  try{
    let videoName = req.params.videoName;
    const data = await readFileAsync("videoContent.txt", 'utf8')
    let dataArray = data.split(",")
    if (!dataArray.includes(videoName)){
      return res.status(404).send("referenced file does not exist")
  };
    let chunks;
    const uploadStatus = req.headers['x-upload-status']; //custom header to communicate file upload state with frontend
    let videoBuffer = req.body.blob; // This contains the array of bytes of the uploaded file
    if (uploadStatus === "complete") {
      let videoPath = path.join(__dirname, "videos", videoName)
      await queue.add({"videoName": videoPath})
      return res.status(200).send("video upload completed");
    }
    videoBuffer = deserializeChunks(videoBuffer)
    if (Array.isArray(videoBuffer))
    {
      chunks = Buffer.concat(videoBuffer);
    }else {
      chunks = videoBuffer;
  }
  
    fs.appendFile(`./videos/${videoName}`, chunks, (err) => {
      if (err) return res.status(500).send(err.message);
      return res.status(200).send("successfully appended");
    });
  } catch(err){
  console.log(err.message)
  res.status(500).send("Something went wrong")
}
});


router.get("/all/videos", (req, res)=>{
  fs.stat(path.join(__dirname, "videoContent.txt"), (err, stats) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send("Something went wrong")
    } else {
      if (stats.size === 0) {
        return res.status(400).send("No videos available")
      } else {
          readFileAsync("videoContent.txt", 'utf8')
            .then(data => {
              let dataArray = data.split(",")
              const currentUrl = `${req.protocol}://${req.get('host')}`;
              urlArray =  dataArray.map((element)=>{
                return currentUrl + '/' + element
              })
              return res.status(200).send(urlArray.slice(0, -1))
              })
              .catch(err => {
                console.error('Error reading the file:', err);
                return res.status(500).send("Couldn't fetch links")
              });
            }
    }
  });
})


router.post("/create/videoFile", async (req, res)=>{
    try {
        const fileName = `video${Date.now()}.webm`
        await writeFileAsync("./videos/" + fileName, '');
        await appendFileAsync("videoContent.txt", fileName + ",")
        return res.status(200).json({"message": "sucessfully created video", fileName})
      } catch (error) {
        res.status(500).end(error.message)
      }
})


router.get("/transcripts/:videoName", (req, res)=>{
  try {
    const fileInfo = path.parse(req.params.videoName);
    const fileName = fileInfo.name + ".txt";
    res.sendFile(path.join(__dirname, "transcripts", fileName))
  } catch(error){
    res.status(404).send(error.message)
  }
}
);

module.exports = router