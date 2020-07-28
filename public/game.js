// console.log("game is working");
// const socket = io();

// socket.on("newPlayer", (newPlayer) => console.log(newPlayer));
// socket.on("disconnect", (e) => console.log(e));

const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 600,
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            gravity: { y: 0 },
        },
    },
    scene: {
        preload,
        create,
        update,
    },
};

let game = new Phaser.Game(config);

function preload() {
    this.load.image("ship", "./assets/spaceshooter/PNG/playerShip1_blue.png");
}

function create() {
    // console.log("Start of the Game.");

    let self = this;

    this.otherPlayers = this.physics.add.group();

    // console.log(this.otherPlayers.getChildren());

    this.socket = io();

    this.socket.on("currentPlayers", (players) => {
        // let currentPlayer = players[this.socket.id];
        // console.log(currentPlayer);
        // addShip(this, currentPlayer);

        Object.keys(players).forEach((id) => {
            if (id === this.socket.id) {
                addShip(this, players[id]);
            } else {
                addOtherPlayer(self, players[id]);
            }
        });
    });

    this.socket.on("newPlayer", (player) => {
        addOtherPlayer(this, player);
    });

    this.socket.on("disconnect", (playerId) => {
        console.log("disconnect");
        // console.log(this.otherPlayers.getChildren());
        this.otherPlayers.getChildren().forEach((player) => {
            if (player.playerId === playerId) {
                player.destroy();
                // console.log("match");
            }
        });
    });
}

function update() {}

function addShip(self, player) {
    self.ship = self.physics.add.image(player.x, player.y, "ship");
    self.ship.setOrigin(0, 0);
    self.ship.setDisplaySize(53, 40);
    if (player.team === "blue") {
        self.ship.setTint(0x0000ff);
    } else {
        self.ship.setTint(0xff0000);
    }
    self.ship.setDrag(100);
    self.ship.setAngularDrag(100);
    self.ship.setMaxVelocity(200);
}

function addOtherPlayer(self, player) {
    const otherPlayer = self.add
        .sprite(player.x, player.y, "ship")
        .setOrigin(0, 0)
        .setDisplaySize(60, 50);
    if (player.team === "blue") {
        otherPlayer.setTint(0x0000ff);
    } else {
        otherPlayer.setTint(0xff0000);
    }
    otherPlayer.playerId = player.playerId;
    self.otherPlayers.add(otherPlayer);
}
