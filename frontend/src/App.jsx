import { useRef } from "react";
import "./App.css";
import VideoPlayer from "./VideoPlayer";
import videojs from "video.js";

function App() {
  const playerRef = useRef(null);
  const videoLink =
    "http://localhost:8000/uploads/courses/c0ede243-5701-4240-a384-3ec0b619e66d/index.m3u8";

  const VideoPlayerOptions = {
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: videoLink,
        type: "application/x-mpegURL",
      },
    ],
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example
    player.on("waiting", () => {
      videojs.log("Player is waiting...");
    });

    player.on("dispose", () => {
      videojs.log("Player will dispose");
    });
  };

  return (
    <>
      <div>
        <h1>Video Player</h1>
      </div>
      <VideoPlayer options={VideoPlayerOptions} onReady={handlePlayerReady} />
    </>
  );
}

export default App;
