// Multiplayer Platformer using Socket.io
// All the variables
let game = {
  players: {}
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
function create() {
  // Player group
  game.otherPlayers = this.physics.add.group();

  // Adds a new player to server
  socket.on("currentPlayers", function(players) {
    Object.keys(players).forEach(id => {
      if (players[id].playerId === socket.id) {
        game.addNewPlayer(self, players[id]);
      } else {
        game.addOtherPlayers(self, players[id]);
      }
    });
  });
  socket.on("newPlayer", function(playerInfo) {
    game.addOtherPlayers(self, playerInfo);
  });
  socket.on("disconnect", function (playerId) {
    game.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });
  socket.on("playerMoved", function(playerInfo) {
    game.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });
  game.addNewPlayer = (self, playerInfo) => {
    game.player = this.physics.add.sprite(playerInfo.x, playerInfo.y, "playerJump");
    game.player.setCollideWorldBounds(true);
  }
  game.addOtherPlayers = (self, playerInfo) => {
    const otherPlayer = this.physics.add.sprite(playerInfo.x, playerInfo.y, "playerJump");
    otherPlayer.playerId = playerInfo.playerId;
    otherPlayer.setCollideWorldBounds(true);
    game.otherPlayers.add(otherPlayer);
  }

  // Input
  game.cursors = this.input.keyboard.createCursorKeys();

  // Create player sprite
  // game.player = this.physics.add.sprite(100, 100, "playerJump");
  Client.askNewPlayer();

  // Bounds

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
    if (keyPress(Phaser.Input.Keyboard.KeyCodes.UP) && game.jumpsMade % 2 === 0 && !game.player.body.blocked.down && game.abilities.doubleJumps) {
      // Jump
      game.player.setVelocityY(-800);
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
