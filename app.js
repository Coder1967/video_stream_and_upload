const express = require("express")
const app = express();
const cors = require('cors');
const ejs = require("ejs");
const router = require("./route")
app.set('view engine', 'ejs');
app.set('views', __dirname);
app.use(cors())
app.use(express.json({ limit: '15mb' }))
app.use(router)



app.listen(5000, ()=>{
    console.log("server running on port 5000")
})
