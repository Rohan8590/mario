score = 0;
let config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        width:  800,
        height: 600,
            },
    
    backgroundColor: 0xffff11,
    
    //adding physics engine
    physics: {
        default: "arcade",
        arcade: {
        gravity: {
         y: 1000,   
        },
            debug:false,
      },
    },
    
    scene: {
    preload: preload,
    create: create,
    update: update,
         }
};

let game = new Phaser.Game(config);

let player_config = {
    player_speed: 150,
    player_jumpspeed: -700,
}

function preload(){
    //ground
    this.load.image("ground", "Images/ground.jpg");  
    //sky
    this.load.image("sky", "Images/sky.jpg");
    //apple
    this.load.image("apple","Images/apple.png")
    //player sprite map/spritesheet
    this.load.spritesheet("player","Images/player.png",{frameWidth: 32, frameHeight: 55});
    //ray
    this.load.image("ray","Images/ray.png");
}

function create(){
    W = game.config.width;
    H = game.config.height;
    
    //adding ground
    let ground = this.add.tileSprite(0,H-68,W,68,"ground");
    ground.setOrigin(0,0);
    ground.depth = 1;
    
    //adding sky
    let sky = this.add.sprite(0,0,"sky");
    sky.setOrigin(0,0);
    sky.displayWidth = W;
    sky.displayHeight = H;
    
    //adding player
    this.player = this.physics.add.sprite(100,100,"player",6);
    this.player.depth = 2;
    //player can't leave world area
    this.player.setCollideWorldBounds(true);
    
    //adding apple
    let fruits = this.physics.add.group({
        key: "apple",
        repeat: 8,
        setScale: {x:0.1,y:0.1},
        setXY: {x:20,y:0,stepX:100},
    });
    
    //adding platform
    let platforms = this.physics.add.staticGroup();
    platforms.create(230,150,"ground").setScale(4,0.8).refreshBody();
    platforms.create(500,320,"ground").setScale(4,0.8).refreshBody();
    platforms.create(200,400,"ground").setScale(4,0.8).refreshBody();
    //add ground to platforms
    platforms.add(ground);
    
    //setting bouncing effect
    //bounce on player
    this.player.setBounce(0.3);
    //bounce on apples
    fruits.children.iterate(function(f){
        f.setBounce(Phaser.Math.FloatBetween(0.3,0.6));
    });
    
    //player movement animation
    this.anims.create({
        key: "left",
        frames: this.anims.generateFrameNumbers("player",{start:0,end:5}),
        frameRate: 10,
        repeat: -1,
    });
    this.anims.create({
        key: "center",
        frames: this.anims.generateFrameNumbers("player",{start:6,end:6}),
        frameRate: 10,
    })
      this.anims.create({
        key: "right",
        frames: this.anims.generateFrameNumbers("player",{start:7,end:13}),
        frameRate: 10,
        repeat: -1,
    });
    
    //physics to ground(true for static body, or write the two lines below to make it static)
    this.physics.add.existing(ground,true);
    //ground.body.allowGravity = false;
    //ground.body.immovable = true;
    
    //detect collisions
    this.physics.add.collider(this.player,platforms);
    //this.physics.add.collider(fruits,ground); (As ground is now a part of platforms)
    this.physics.add.collider(fruits,platforms);
    
    //overlap between apple and player
    this.physics.add.overlap(fruits,this.player,eatFruit,null,this);
    
     //score
   current_score = this.add.text(10,10,"Score: " + score);
    
    //keyboard event listerner
    this.cursor = this.input.keyboard.createCursorKeys();
    
    //creating cameras
    this.cameras.main.setBounds(0,0,W,H);
    this.physics.world.setBounds(0,0,W,H);
    
    this.cameras.main.startFollow(this.player,true,true);
    this.cameras.main.setZoom(1.5);
    
    //rays effect
    let rays = [];
    
    for(let i=-10;i<=10;i++){
        let ray = this.add.sprite(W/2,H-68,"ray");
        ray.displayHeight = 1.5*H;
        ray.setOrigin(0.5,1);
        ray.alpha = 0.2;
        ray.angle = i*20;
        ray.depth = 0;
        rays.push(ray);
    }
    
    //tween for rays
    this.tweens.add({
        targets: rays,
        props:{
            angle: {
                value: "+=20",
            },
        },
        duration: 8000,
        repeat: -1,
    });
}

function update(){
    if(this.cursor.left.isDown){
        this.player.setVelocityX(-player_config.player_speed);
        this.player.anims.play("left",true);
    }
    else if(this.cursor.right.isDown){
        this.player.setVelocityX(player_config.player_speed);
        this.player.anims.play("right",true);
    }
    else{
        this.player.setVelocityX(0);
        this.player.anims.play("center",true);
    }
    
    //add jumping and jump only if player is on ground
    if(this.cursor.up.isDown && this.player.body.touching.down){
        this.player.setVelocityY(player_config.player_jumpspeed);
    }
    
   
}

function eatFruit(player,fruit){
    current_score.destroy();
    fruit.disableBody(true,true);
    score++;
    current_score = this.add.text(10,10,"Score: " + score);
    console.log(score);
}