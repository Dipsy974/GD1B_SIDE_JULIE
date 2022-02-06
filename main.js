var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    input:{gamepad:true},
    scene: { preload: preload, create: create, update: update },
};

new Phaser.Game(config);

function preload() {
    //Preload des différents éléments graphiques.
    //Décors
    this.load.image('s1_sk', 'assets/s1_sky.png');
    this.load.image('s2_sk', 'assets/s2_sky.png');
    this.load.image('s3_sk', 'assets/s3_sky.png');
    this.load.image('s1_bg', 'assets/s1_background.png');
    this.load.image('s2_bg', 'assets/s2_background.png');
    this.load.image('s3_bg', 'assets/s3_background.png');
    this.load.image('s1_ground', 'assets/s1_ground.png');
    this.load.image('s2_ground_1', 'assets/s2_ground_1.png');
    this.load.image('s2_ground_2', 'assets/s2_ground_2.png');
    this.load.image('s3_ground_1', 'assets/s3_ground_1.png');
    this.load.image('s3_ground_2', 'assets/s3_ground_2.png');
    this.load.image('s1_fg', 'assets/s1_foreground.png');
    this.load.image('s2_fg', 'assets/s2_foreground.png');
    this.load.image('s3_fg', 'assets/s3_foreground.png');
    this.load.image('s2_ice', 'assets/s2_ice.png');
    this.load.image('s3_ice', 'assets/s3_ice.png');
    this.load.image('snow', 'assets/snow.png');
    //Plateformes
    this.load.image('sml_platform', 'assets/small_platform.png');
    this.load.image('mdm_platform', 'assets/medium_platform.png');
    this.load.image('mdm_platform_2', 'assets/medium_platform.png');
    this.load.image('big_platform', 'assets/big_platform.png');
    //UI Vie
    this.load.image('ui_full_hp', 'assets/ui_full_hp.png');
    this.load.image('ui_two_hp', 'assets/ui_two_hp.png');
    this.load.image('ui_one_hp', 'assets/ui_one_hp.png');
    //Personnages, objets
    this.load.image('power_up', 'assets/powerup.png');
    this.load.image('enemy', 'assets/enemy.png');
    this.load.image('ice_trap', 'assets/trap.png');
    this.load.spritesheet('fox', 'assets/chara_idle_spritesheet.png',
        { frameWidth: 69, frameHeight: 69 });
    this.load.spritesheet('fox_run', 'assets/chara_run_spritesheet.png',
        { frameWidth: 69, frameHeight: 69 });
}


//Variables manette
var controller; 
var isConnected = false; 

//Variables du jeu
var ground;
var player;
var cursors;
var hp = 3; //Vie joueur
var enemies;
var isFRight = true; //Si le personnage regarde vers la droite
var isOnIce = false; //Si le personnage est sur la glaçe
var isOnSnow = false; //Si le personnage est dans la neige 
var invincible = false; 
var compteur = 120; //Compteur frame invulnérabilité 
var jumpCount = 0; 
var consecutiveJumps = 1; //Nombre de jumps supplémentaires
var powerUnlocked = false; //Possibilité d'utiliser le pouvoir
var isAttacking = false; 
var victory = false;  


//Classe pour comportement de l'ennemi 
var FlyingEnemy = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Sprite,

    initialize:

    function FlyingEnemy (scene, x, y, width, height, speed)
    {
        Phaser.Physics.Arcade.Sprite.call(this, scene, x, y, 'enemy');

        //  This is the path the sprite will follow
        this.path = new Phaser.Curves.Ellipse(x, y, width, height);
        this.pathIndex = 0;
        this.pathSpeed = speed;
        this.pathVector = new Phaser.Math.Vector2();

        this.path.getPoint(0, this.pathVector);

        this.setPosition(this.pathVector.x, this.pathVector.y);
        this.setScale(0.3); 
    },

    preUpdate: function (time, delta)
    {
        this.anims.update(time, delta);

        this.path.getPoint(this.pathIndex, this.pathVector);

        this.setPosition(this.pathVector.x, this.pathVector.y);

        this.pathIndex = Phaser.Math.Wrap(this.pathIndex + this.pathSpeed, 0, 1);
    }

});


//Création de tous les élements de jeu. 
function create() {
    //Mise en place du background
    sky = this.add.image(0, 0, 's1_sk').setOrigin(0,0);
    sky.setScrollFactor(0.7, 1); 
    sky1 = this.add.image(1900, 0, 's2_sk').setOrigin(0,0);
    sky1.setScrollFactor(0.7, 1); 
    sky2 = this.add.image(3800, 0, 's3_sk').setOrigin(0,0);
    sky2.setScrollFactor(0.7, 1); 
    bg = this.add.image(0, 0, 's1_bg').setOrigin(0,0);
    bg.setScrollFactor(0.98, 1); 
    bg1 = this.add.image(1900, 0, 's2_bg').setOrigin(0,0);
    bg1.setScrollFactor(0.98, 1); 
    bg2 = this.add.image(3830, 0, 's3_bg').setOrigin(0,0);
    bg2.setScrollFactor(0.98, 1); 

    //Mise en place des plateformes de glaçe
    ice = this.physics.add.staticGroup();
    ice.create(450 + 225 + 1920, 1080-44, 's2_ice').setSize(852, 76, 20, 0);
    ice.create(382 + 3940 + 191, 1080-44, 's3_ice').setSize(852, 76, 20, 0);

    //Initialisation des tas de neige
    snow = this.physics.add.staticGroup();
    
    //Divers textes écrits dans le niveau 
    this.add.text(430, 800, 'Appuyez sur ▲ pour sauter.', { fontFamily: 'CustomFont' ,backgroundColor:'rgba(0,0,0,0.4)' }).setScale(1.2);
    this.add.text(1200, 800, 'Dans les airs, ▲ pour un double saut.', { fontFamily: 'CustomFont',backgroundColor:'rgba(0,0,0,0.4)'  }).setScale(1.2);
    this.add.text(1480, 500, 'Sautez vers les parois pours les escalader.', { fontFamily: 'CustomFont',backgroundColor:'rgba(0,0,0,0.4)'  }).setScale(1.2);
    this.add.text(1480, 500, 'Sautez vers les parois pours les escalader.', { fontFamily: 'CustomFont',backgroundColor:'rgba(0,0,0,0.4)'  }).setScale(1.2);
    

    //Mise en place des pièges de glaçe
    traps = this.physics.add.staticGroup();
    traps.create(4980 + 81, 1080-57, 'ice_trap').setSize(162, 70, 1, 0);

    //Mise en place du sol principal et des différentes plateformes
    ground = this.physics.add.staticGroup();
    ground.create(960, 1080-56, 's1_ground').setSize(1920, 92, 20, 0);
    ground.create(225 + 1920, 1080-56, 's2_ground_1').setSize(450, 92, 20, 0);
    ground.create(560 + 2740, 1080-56, 's2_ground_2').setSize(1120, 92, 20, 0);
    ground.create(191 + 3840, 1080-56, 's3_ground_1').setSize(382, 92, 20, 0);
    ground.create(302 + 5160, 1080-56, 's3_ground_2').setSize(604, 92, 20, 0);

    ground.create(670 + 96,970, 'sml_platform').setSize(183,102,1,0);
    ground.create(660 + 96 + 304 - 40 , 950, 'mdm_platform').setSize(264,151,1,0);
    ground.create(1660, 950, 'mdm_platform_2').setSize(264,151,1,0);
    ground.create(1660 + 274 + 130 , 950 - 100, 'big_platform').setSize(480,370,1,0);
    ground.create(3300, 950, 'mdm_platform_2').setSize(264,151,1,0);

    
    //Initialisation de la caméra et des limites de jeu
    this.cameras.main.setBounds(0, 0, 1920*3, 1080);
    this.physics.world.setBounds(0, 0, 1920*3, 1080);
    

    
    //Mise en place du joueur et de sa physique
    player = this.physics.add.sprite(400, 1080-112-69, 'fox');
    player.setBounce(0);
    player.setCollideWorldBounds(true);
    player.body.setSize(59, 63, 0, 0);
    player.body.gravity.y = 300;

    //Mise en place de la caméra qui le joueur nouvellement créé
    this.cameras.main.startFollow(player);
    

    //Mise en place d'un tas de neige (après la mise en place de joueur pour qu'il apparaisse derrière)
    snow.create(660 + 96 + 540, 1080-100, 'snow');

    //Mise en place du Premier Plan
    this.add.image(0, 420, 's1_fg').setOrigin(0,0);
    this.add.image(1700, 560, 's2_fg').setOrigin(0,0);
    this.add.image(3540, 320, 's3_fg').setOrigin(0,0);

   
    //Mise en place des collisions avec l'environnement
    this.physics.add.collider(player, ground, onGround, null, this);
    this.physics.add.collider(player, ice, onIce, null, this);
    this.physics.add.overlap(player, snow, onSnow, null, this);

    //Mise en place des différentes animations du joueur
    this.anims.create({
        key: 'run_left',
        frames: this.anims.generateFrameNumbers('fox_run', { start: 8, end: 16 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'idle_right',
        frames: this.anims.generateFrameNumbers('fox', { start: 0, end: 15 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'idle_left',
        frames: this.anims.generateFrameNumbers('fox', { start: 16, end: 32 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'run_right',
        frames: this.anims.generateFrameNumbers('fox_run', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
    });


    //Inputs clavier
    cursors = this.input.keyboard.createCursorKeys();

    //Mise en place de la "classe" PowerUp et collisions/overlaps
    powerUps = this.physics.add.group();
    this.physics.add.collider(powerUps, ground);
    this.physics.add.overlap(player, powerUps, getPowerUp, null, this);

    //Création du seul Powerup
    powerUp = powerUps.create(3300, 1080-112-150, 'power_up').setSize(60, 60, 1, 0);
   

    //Mise en place de la "classe" Enemies
    var enemies = this.physics.add.group({ allowGravity: false });

    //Création de deux ennemis, avec le comportement défini
    enemies.add(new FlyingEnemy(this, 2900, 1080-150-69, 50, 150, -0.003), true);
    enemies.add(new FlyingEnemy(this, 3600, 1080-150-69, 50, 150, -0.003), true);
  
    //Différentes Collisions
    this.physics.add.collider(enemies, ground);
    this.physics.add.collider(player, traps, hitTrap, null, this);
    this.physics.add.collider(player, enemies, hitEnemy, null, this);


    //Mise en place de l'UI au premier plan 
    ui_hp = this.add.image(20, 20, "ui_full_hp").setOrigin(0,0).setScale(0.6);
    ui_hp.setScrollFactor(0); //Permet à l'UI d'être static sur la page

}


function update() {


    const isJumpJustDown = Phaser.Input.Keyboard.JustDown(cursors.up); //Variable qui retourne True si la touche Haut a été appuyée
    
    // DEPLACEMENTS JOUEURS
    if (cursors.left.isDown) { //Touche gauche
        isFRight = false; 
        if(isOnSnow){   //Velocité différente si le personnages est sur la neige
            player.setVelocityX(-100);
        }else{
            player.setVelocityX(-260); 
        }
        
        player.anims.play('run_left', true); //Animation course gauche
      
    }
    else if (cursors.right.isDown) { //Touche droite
        isFRight = true;
        if(isOnSnow){   //Velocité différente si le personnages est sur la neige
            player.setVelocityX(100);
        }else{
            player.setVelocityX(260); 
        }
        
        player.anims.play('run_right', true); //Animation course droite
    
    }
    else { // Si ni gauche ni droite sont appuyés

        if(isFRight){ //Garde en mémoire si le joueur s'est arrêté en regardant vers la droite ou pas
            player.anims.play('idle_right', true); 
            if(isOnIce){    //Comportement si le joueur est sur la glace
                player.body.velocity.x -= 1;    //Vélocité qui descend pour effet de glissement 
                if(player.body.velocity.x <0){   
                    player.setVelocityX(0);   //Il s'arrête quand la vélocité atteint 0 
                }   
            }else{
                player.setVelocityX(0);     // Arrêt complet du joueur si pas sur la glace
            }
            
        }
        else{
            player.anims.play('idle_left', true);
            if(isOnIce){    //Comportement si le joueur est sur la glace
                player.body.velocity.x += 1; //Vélocité qui descend pour effet de glissement
                if(player.body.velocity.x >0){
                    player.setVelocityX(0); //Il s'arrête quand la vélocité atteint 0 
                }   
            }else{
                player.setVelocityX(0);   // Arrêt complet du joueur si pas sur la glace
            }
            
        }
        
    }
    //  SAUT 
    if (isJumpJustDown && (player.body.touching.down||jumpCount < consecutiveJumps)) {
        player.setVelocityY(-200); 
        jumpCount++; //Incrémente le nombre de saut (pour le double saut)
    }
    if(isJumpJustDown && player.body.touching.left){  //Wall jump, saute si le personnage est contre un mur
        player.setVelocityX(200); 
        player.setVelocityY(-200);
    }
    if(isJumpJustDown && player.body.touching.right){
        player.setVelocityX(200); 
        player.setVelocityY(-200);
    }

    if( player.body.touching.down){  //Réinitialise le nombre de sauts disponibles quand le joueur touche le sol
        jumpCount = 0; 
    }

    if(powerUnlocked){  //Condition d'avoir récupéré le Power up
        if(!player.body.touching.down && cursors.down.isDown){  //Attaque vers le bas dans les airs et état "isAttacking" du personnage
            isAttacking = true; 
            player.setVelocityY(500); 
        
        }else{
            isAttacking = false; // Etat isNotAttacking si la touche du bas n'est pas appuyée dans les airs
        }
    }

    //CONTROLES MANETTE
    this.input.gamepad.once('connected', function (pad) {
            controller = this.pad1; 
            isConnected = true; 
        });

    if(isConnected){
        if (controller.leftStick.x < 0) { 
            isFRight = false; 
            player.setVelocityX(-260);
            player.anims.play('run_left', true);
          
        }
        else if (controller.leftStick.x > 0) { 
            isFRight = true;
            player.setVelocityX(260);
            player.anims.play('run_right', true);
        
        }
        else {
            if(isFRight){
                player.anims.play('idle_right', true); 
                if(isOnIce){
                    player.body.velocity.x -= 1; 
                    if(player.body.velocity.x <0){   
                        player.setVelocityX(0);   
                    }   
                }else{
                    player.setVelocityX(0);
                }    
            }
            else{
                player.anims.play('idle_left', true);
                if(isOnIce){
                    player.body.velocity.x += 1; 
                    if(player.body.velocity.x >0){
                        player.setVelocityX(0);
                    }   
                }else{
                    player.setVelocityX(0);   
                }   
            }
            
        }
        if (controller.A && (player.body.touching.down || jumpCount < consecutiveJumps)) {
            //si touche haut appuyée ET que le perso touche le sol
            player.setVelocityY(-200); //alors vitesse verticale négative
            jumpCount++;
            //(on saute)
        }
    }

    if(invincible){
        compteur-- ;
    if(compteur == 0){
            compteur = 120;
            player.setTint(0xffffff);
            invincible = false ;
        }
    }


    //UPDATE UI EN FONCTION DE LA VIE
    if(hp == 3){
        ui_hp.setTexture("ui_full_hp");
    }
    if(hp == 2){
        ui_hp.setTexture("ui_two_hp");
    }
    if(hp == 1){
        ui_hp.setTexture("ui_one_hp");
    }
    if(hp < 1){
        die(); 
    }

    //UPDATE VICTOIRE
    if(player.x >5300 && !victory){
        this.add.text(5000, 500, 'Félicitations !', { fontFamily: 'CustomFont',backgroundColor:'rgba(0,0,0,0.4)'  }).setScale(1.2);
        victory = true; 
    }

        
}

//FONCTIONS

//Fonction pour pouvoir utiliser le pouvoir, et affichage du texte explicatif
function getPowerUp(player, powerUp) {
    this.add.text(3100, 600, 'Dans les airs, appuyez sur ▼ pour une attaque plongeante.', { fontFamily: 'CustomFont',backgroundColor:'rgba(0,0,0,0.4)'  }).setScale(1.2);
    powerUp.disableBody(true, true); 
    powerUnlocked = true; 
}

//Fonction pour "tuer" le personnage
function hitTrap(player, trap) {
    player.setTint(0xff0000);
    die(); 
}

//Fonction de rencontre avec un ennemi - tue l'ennemi si le pouvoir utilisé, prend des dégâts sinon
function hitEnemy(player, enemy) {
    if(isAttacking){
        enemy.destroy();
    }else{
        if(!invincible){

            invincible = true;
            hp -= 1;
            player.setTint(0xff0000);
            this.cameras.main.shake(200, 0.01);
        }
    }     
}


//Fonction de restart si le joueur meurt
function die(){
    player.scene.scene.restart();
    hp = 3; 
    invincible = false; 
}

//Fonctions pour déterminer sur quels terrains est le joueur
function onGround() {
    isOnIce = false;
    isOnSnow = false;
}

function onIce() {
    isOnIce = true;
    isOnSnow = false; 
}

function onSnow(){  
    isOnSnow = true; 
    isOnIce = false; 
}



