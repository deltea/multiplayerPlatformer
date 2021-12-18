// Multiplayer Platformer using socket.io
// All the variables
let game = {
  players: {},
  socket: {}
};

// Preload: Load all the assets
function preload() {
  // Load image of player
  this.load.image("playerJump", "assets/images/playerJump.png");

  // Load walking animation
  // Ninja Frog
  this.load.spritesheet("ninjaFrogWalk", "assets/images/walk.png", {
    // Proportions
    frameWidth: 32,
    frameHeight: 32
  });
}

// Create: Create all the sprites and colliders
const {Server} = require("socket.io");
const io = new Server(server);
function create() {
  game.socket = io();
  // Player group
  game.otherPlayers = this.physics.add.group();

  // Adds a new player to server
  game.socket.on("currentPlayers", function(players) {
    Object.keys(players).forEach(id => {
      if (players[id].id === game.socket.id) {
        game.addNewPlayer(players[id]);
      } else {
        game.addOtherPlayers(players[id]);
      }
    });
  });
  game.socket.on("newPlayer", function(playerInfo) {
    game.addOtherPlayers(playerInfo);
  });
  game.socket.on("removePlayer", function(playerId) {
    game.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (playerId === otherPlayer.id) {
        otherPlayer.destroy();
        delete players[game.socket.id]
      }
    });
  });
  game.socket.on("playerMoved", function(playerInfo) {
    game.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (playerInfo.id === otherPlayer.id) {
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });
  game.addNewPlayer = (playerInfo) => {
    game.player = this.physics.add.sprite(playerInfo.x, playerInfo.y, "playerJump").setScale(2);
    game.player.setCollideWorldBounds(true);
  }
  game.addOtherPlayers = (playerInfo) => {
    console.log(playerInfo);
    const otherPlayer = this.physics.add.sprite(playerInfo.x, playerInfo.y, "playerJump").setScale(2);
    otherPlayer.id = playerInfo.id;
    game.otherPlayers.add(otherPlayer);
    otherPlayer.setCollideWorldBounds(true);
  }

  // Input
  game.cursors = this.input.keyboard.createCursorKeys();

  // Animations
  // Walk
  this.anims.create({
    // Animation key
    key: "walk",

    // Frames
    frames: this.anims.generateFrameNumbers("ninjaFrogWalk", {
      start: 0,
      end: 11
    }),

    // Options
    frameRate: 15,
    repeat: -1
  });
}

// Update: Update movement and animation
function update() {
  // Controls
  if (game.player) {
    // Right
    if (game.cursors.right.isDown) {
      // Move right
      game.player.setVelocityX(200);

      // Walk animation
      game.player.anims.play("walk", true);

      // Flip image
      game.player.flipX = false;

      // Dir var
      game.player.dir = "R";

      // Left
    } else if (game.cursors.left.isDown) {
      // Move left
      game.player.setVelocityX(-200);

      // Walk animation
      game.player.anims.play("walk", true);

      // Flip image
      game.player.flipX = true;

      // Dir var
      game.player.dir = "L";

      // None
    } else {
      // Don't move
      game.player.setVelocityX(0);

      // Stop anims
      game.player.setTexture("playerJump");
    }

    // Key function
    const keyPress = (key) => {
      if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(key))) {
        return true;
      } else {
        return false;
      }
    };

    // Jump
    if (game.cursors.up.isDown && game.player.body.blocked.down) {
      // Jump
      game.player.setVelocityY(-800);
    }
    if (game.player.oldPosition && (game.player.x !== game.player.oldPosition.x || game.player.y !== game.player.oldPosition.y)) {
      game.socket.emit("playerMovement", {
        x: game.player.x,
        y: game.player.y
      });
    }
    game.player.oldPosition = {
      x: game.player.x,
      y: game.player.y
    }
  }
}

// Phaser config
const config = {
  // Type
  type: Phaser.AUTO,

  // Scaling
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH,
    mode: Phaser.Scale.RESIZE,
  },

  // Rendering options
  render: {
    pixelArt: true
  },

  // Color of sky
  backgroundColor: 0xd0f4f7,

  // Physics
  physics: {
    // Default
    default: "arcade",

    // Arcade
    arcade: {
      // Gravity
      gravity: {
        y: 1500
      },

      // Options
      enableBody: true,
      // debug: true
    }
  },

  // Scenes
  scene: {
    preload,
    create,
    update
  }
};

// Phaser game
const phaserGame = new Phaser.Game(config);
