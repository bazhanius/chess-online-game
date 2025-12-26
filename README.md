# LAN Chess

### About

The game was designed for use in a LAN (Wi-Fi on trains web-portal) with the features of the on-board infotainment system in mind.

- Auth was before entering game and each user has unique IP (Captive portal)
- Backend was mentioned to be behind web-server (nginx takes all network and security job)
- Client-side chess engine for playing against computer (Stockfish)
- Client-side history and statistics (no user-data storing in DB in long term)
- Localization in three languages: Russian, English and Simplified Chinese

But it can be adapted for other needs and features.

Code itself is a monorepo for frontend (next.js, material ui, stockfish wasm/js, socket.io, lichess chessground) 
and backend (node.js, express.js).

### Getting started

You could start frontend and backend separately in CLI or Docker. 
See README files in each folder respectively.

Or start both at once in Docker from root after changing `.env` for your needs:

`docker compose up`

### License

GPL 3.0 or higher because of some used libs.