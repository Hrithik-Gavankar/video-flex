import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { exec } from "child_process"; //watchout for this import
import { stderr, stdout } from "process";

const app = express();

//multer middleware
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, "./uploads");
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname));
  },
});

//multer configuration
const upload = multer({storage: storage})

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true
}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); //watch it setHeader vs header
    res.header(
      "Access-Control-Allow-Headers", 
      "Orgin", "X-Requested-With", "Content-Type", "Accept"
    ); 
    next();
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));


app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.post("/upload", upload.single("file"), (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const lessonId = uuidv4();
    const videoPath = req.file.path;
    const outputPath = `./uploads/courses/${lessonId}`;
    const hlsPath = `${outputPath}/index.m3u8`;
    console.log("hlsPath here -->>>>", hlsPath);

    if(!fs.existsSync(outputPath)){
      fs.mkdirSync(outputPath, {recursive: true});
    }
    
    //ffmpeg command study this codec command
    const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

    //no queue for now because of POC, not to be used in production
    exec(ffmpegCommand, (error, stdout, stderr) => {
      if(error){
        console.log(`error: ${error.message}`);
        return res.status(500).json({ 
          error: "Video conversion failed", 
          details: error.message 
        });
      }
      if(stderr){
        console.log(`stderr: ${stderr}`);
        // Note: stderr in FFmpeg often contains warnings, not necessarily errors
        // Only return error if it's actually a critical error
        if (stderr.includes('Error') || stderr.includes('failed')) {
          return res.status(500).json({ 
            error: "Video conversion failed", 
            details: stderr 
          });
        }
      }
      console.log(`stdout: ${stdout}`);

      const videoUrl = `http://localhost:8000/uploads/courses/${lessonId}/index.m3u8`;

      res.json({ 
        message: "Video converted to HLS format successfully", 
        videoUrl: videoUrl,
        lessonId: lessonId
      });
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ 
      error: "Internal server error", 
      details: err.message 
    });
  }
});

app.listen(8000, () => {
  console.log("App is running on port 8000");
});
