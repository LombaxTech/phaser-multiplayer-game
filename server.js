const express = require("express");
const app = express();
const server = require("http").Server(app);
const socket = require("socket.io");
const { start } = require("repl");
const io = socket.listen(server);

let players = {};

let coin = {
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 700) + 50,
};

let scores = {
    blue: 0,
    red: 0,
};

app.use(express.static(`${__dirname}/public`));

app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

io.on("connection", (socket) => {
    console.log("user has connected");
    console.log({ socketId: socket.id });

    players[socket.id] = {
        rotation: 0,
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 700) + 50,
        playerId: socket.id,
        team: Math.floor(2 * Math.random()) == 0 ? "red" : "blue",
    };

    socket.emit("currentPlayers", players);
    socket.broadcast.emit("newPlayer", players[socket.id]);

    socket.emit("coinLocation", coin);
    socket.emit("scoreUpdate", scores);

    socket.on("playerMovement", (movementData) => {
        // console.log(movementData);
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].rotation = movementData.rotation;

        socket.broadcast.emit("playerMoved", players[socket.id]);
    });

    socket.on("coinCollected", () => {
        if (players[socket.id].team === "blue") {
            scores.blue += 10;
        } else if (players[socket.id].team === "red") {
            scores.red += 10;
        }

        coin.x = Math.floor(Math.random() * 700) + 50;
        coin.y = Math.floor(Math.random() * 700) + 50;

        io.emit("coinLocation", coin);
        io.emit("scoreUpdate", scores);
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("disconnect", socket.id);
        // socket.broadcast.emit("disconnect", "user has disconnected!");
    });
});

server.listen(3000, () => console.log(`listening on port 3000`));
