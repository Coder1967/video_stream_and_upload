const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const FormData = require("form-data");
const axios = require("axios")
const fs = require('fs');
const util = require('util');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const writeFileAsync = util.promisify(fs.writeFile);
const unlinkAsync = util.promisify(fs.unlink)
ffmpeg.setFfmpegPath(ffmpegPath);
const api_key = process.env.API_KEY

async function transcribeAudio(audioFilePath) {
  const fileNameWithExtension = path.basename(audioFilePath);    
  const fileInfo = path.parse(fileNameWithExtension);
  const fileNameWithoutExtension = fileInfo.name;
  const outputFile = fileNameWithoutExtension + ".txt";
  const  filePath = path.join(__dirname, audioFilePath)
  const model = "whisper-1"
  const formData = new FormData();
  formData.append("model", model);
  formData.append("file", fs.createReadStream(filePath))
  axios.post("https://api.openai.com/v1/audio/transcriptions", formData, {
            headers: {
                        Authorization: `Bearer ${api_key}`,
                        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`
                }
      }).then(async (response)=>{
        await writeFileAsync(`./transcripts/${outputFile}`, response.data.text);
        console.log("finishing transcription")
        await unlinkAsync(filePath)
      }).catch(error =>{
        console.log(error.message)})        
}


async function convert(inputVideo){
    const regex = /video\d+\.(mp4|webm)/;
    const fileNameWithExtension = inputVideo.match(regex)[0]
    const fileNameWithoutExtension = fileNameWithExtension.replace(/\.[^.]+$/, '');
    const outputAudio = fileNameWithoutExtension + ".wav";
    const command = ffmpeg(inputVideo)
      .noVideo()
      .outputOptions([
                '-f wav',            // Force output format to WAV
                '-acodec pcm_s16le', // Set audio codec
                '-ar 16000',         // Set audio frequency
                '-ac 1'              // Set audio channels to mono
                  ])
      .output(path.join(__dirname,outputAudio));

      command.on('end', () => {
              console.log(`Audio extracted and saved as ${outputAudio}`);
              transcribeAudio(outputAudio)
              
        });

      command.on('error', (err) => {
                console.error(`Error extracting audio: ${err.message}`);
      });

      command.run();
}
module.exports = convert