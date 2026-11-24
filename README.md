# Public Test PTT

Public Test is a browser-based push-to-talk beta. GitHub Pages hosts the web client; a small Node.js WebSocket service handles channel membership, signaling, and one-speaker-at-a-time floor control. Audio travels directly between browsers using WebRTC.

## Deploy the signaling service

1. Sign in to Render and choose **New → Blueprint**.
2. Connect the GitHub repository `vibhvesh/public-test-ptt`.
3. Render reads `render.yaml` and proposes the `public-test-ptt-signal` web service.
4. Create the service and wait for its health check to pass at `https://public-test-ptt-signal.onrender.com/health`.

The frontend is configured to connect to `wss://public-test-ptt-signal.onrender.com`. If Render assigns a different hostname, update `SIGNAL_URL` in `index.html` to the matching `wss://...` hostname.

## Test

1. Open the GitHub Pages website on two phones using HTTPS.
2. Phone A creates a channel and copies the invite link.
3. Phone B opens the invite link.
4. Both users allow microphone access.
5. Hold the green button to request the talk floor; release to stop.

## Current beta limits

- Up to 8 users per channel.
- One talker at a time; other members listen.
- WebRTC audio is peer-to-peer mesh, not server-mixed.
- Public STUN servers are configured. Some mobile networks/firewalls require a TURN relay (for example, coturn) before audio can connect reliably.
- Render's free service may sleep when idle, so the first connection after inactivity can take a little time.
- This is a test application, not a hardened or encrypted operational system for emergency/defense use. Do not use it for sensitive communications.

## Health check

`GET /health` returns JSON with service status and active room count.
