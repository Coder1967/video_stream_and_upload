const Bull = require('bull')
const convertAudio = require("./utils")
const queue = new Bull('video transcribing',{
    redis: {
        port: process.env.PORT,
        host: process.env.HOST,
        password: process.env.PASSWORD
      }
}
);

queue.process(async (job, done) => {
    convertAudio(job.data.videoName)
    done()
});

module.exports = queue;