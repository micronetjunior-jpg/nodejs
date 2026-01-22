import express from "express";
import mediasoup from "mediasoup";

const app = express();
app.use(express.json());

let worker;
let router;

(async () => {
  worker = await mediasoup.createWorker({
    rtcMinPort: 40000,
    rtcMaxPort: 40100,
  });

  router = await worker.createRouter({
    mediaCodecs: [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
      },
    ],
  });

  console.log("✅ mediasoup listo");
})();

app.post("/webrtc/answer", async (req, res) => {
  const { sdp } = req.body;

  const transport = await router.createWebRtcTransport({
    listenIps: [{ ip: "0.0.0.0", announcedIp: process.env.PUBLIC_IP }],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
  });

  // mediasoup genera SDP válido
  await transport.setRemoteSdp(sdp);
  const answer = await transport.getLocalSdp();

  res.json({ sdp: answer });
});

app.listen(3000, () =>
  console.log("🚀 mediasoup escuchando en :3000")
);