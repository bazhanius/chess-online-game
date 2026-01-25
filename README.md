# Chess Online Game

[Play now!](https://bazhanius.github.io/chess-online-game/) (the frontend is hosted on GitHub Pages, the backend is hosted on [render.com](https://render.com))

![img](https://repository-images.githubusercontent.com/1123324247/ae3c3b36-2bb4-41b0-bd0b-5bb878f6730d)

### About

 - Play vs other player, vs computer
 - Spectator mode to watch others play
 - Settings: language (russian, english, simplified chinese)
 - Settings: five difficulty levels of computer (Stockfish engine)
 - Stats Section — store wins, draws and loses in Local Storage

### Run and build

CLI:

`npm run dev` — for debugging (by default `localhost:3000`)

`npm run build` — to build static client (w/o SSR) in `/out` folder

Docker:

`docker compose up`

### Main dependencies

- https://github.com/lichess-org/chessground/
- https://github.com/lichess-org/stockfish.js
- https://github.com/jhlywa/chess.js
- https://github.com/vercel/next.js
- https://github.com/mui/material-ui
- https://github.com/iamkun/dayjs/

### License

GPL 3.0 or higher because of some used libs.
