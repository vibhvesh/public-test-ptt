# Public Test PTT

Browser-only push-to-talk experiment hosted on GitHub Pages.

## Architecture

- GitHub Pages hosts the application.
- Shiftr.io MQTT over secure WebSockets carries room discovery and WebRTC signalling.
- WebRTC carries audio directly between browsers.
- No Render service, VPS, Python server, or separate application backend is required.

## Test

1. Open the GitHub Pages website on two phones using HTTPS.
2. Phone A enters a channel name and selects **Create channel**.
3. Phone A selects **Copy invite link** and shares it with Phone B.
4. Phone B opens the invite link.
5. Both users grant microphone permission.
6. Hold the green button to request the talk floor; release to stop.

## Broker

The demo currently uses Shiftr.io's shared public test broker:
`wss://public:public@public.cloud.shiftr.io`

This is for experiments only. MQTT topics and signalling on a public broker are not private and can be observed or spoofed. Do not use it for confidential, emergency, defence, or operational communications. Before a real deployment, create a private Shiftr.io instance and configure its own credentials; never commit private tokens into this public repository.

## Important limitations

- WebRTC audio is peer-to-peer; Shiftr.io does not carry the voice stream.
- STUN servers are configured. Some mobile networks may need a TURN relay for reliable audio.
- The simple MQTT-based talk-floor coordination is experimental and is not a secure or authoritative floor controller.
- The Shiftr.io Basic/free plan has usage limits and is not a guaranteed always-on service.
