class Game {

    actors = [];

    inventory = {};
    
    verb = 'Walk to';
    
    command = 'Walk to';   // Current constructed command, either full or partial
    
    thing = '';

    score = 0;

    itemsLeft = 0;

    // TODO: Decide whether we need this, or whether everything will be in emojis.
    itemIcons = {
        'tulip'         : '🌷',
        'rose'          : '🌹',
        'bouquet'       : '💐',
        'lipstick'      : '💄',
        'ticket'        : '🎟',
        'coconut'       : '🥥',
        'peanut'        : '🥜',
        'mask'          : '👹',
        'water pistol'  : '🔫',
        'candy'         : '🍬',
        'amulet'        : '🧿',
        'cheese'        : '🧀',
        'bank card'     : '💳',
        'cash'          : '💵',
        'map'           : '🗺',
        'compass'       : '🧭',
        'waste basket'  : '🗑',
        'explosive'     : '🧨',
        'test tube'     : '🧪',
        'axe'           : '🪓',
        'pill'          : '💊',
        'syringe'       : '💉',
        'blood'         : '🩸',
        'briefcase'     : '💼', 
        'bricks'        : '🧱',
        'barrier'       : '🚧',
        'paperclip'      : '📎',
        'envelope'       : '✉',
        'letter'         : '📄',
        'bellhop'       : '🛎',
        'broom'          : '🧹',
        'crystal ball'  : '🔮',
    };

    /**
     * The rooms map is essentially the game map.
     */
    rooms = [
        // Room type, room width, left crossing, left path, centre crossing, right path, right crossing
        // room 9 = special room for country side, but used in multiple places.
        // Room types:
        //  bit 0: 1 = has wall, 0 = no wall
        //  bit 1: 1 = tree row, 0 = no tree row
        //  bit 2: 1 = smaller trees, 0 = normal trees (if bit 1 is set)
        //  bit 3: 1 = big trees at bottom of screen, 0 = no big trees
        // Negative value for room applies to left/right path only. Negative means down, Position means up.

        // Main street north.
        [7, 4800,  5, 3, 2, 3, 6],

        // Main street south.
        [3, 4800, 9, 11, 1, 11, 10],

        // House row
        [7, 4800,  0, 1, 4, 1, 0],

        // Park, school, farm
        [2, 6720,  8, -5, 3, -6, 0, 7],

        // Church
        [7, 2880,  11, 0, 10, 4, 1],

        // Petrol station
        [7, 2880,  1, 4, 9, 0, 11], 

        // Castle gates
        [3, 960,   0, -4, 4, -4, 0, , 4],

        // Woods
        [10, 1440, 0, 0, 0, 0, 4],

        // Main street south east
        [3, 2880, 11, 0, 6, 11, 2],

        // Main street south west
        [3, 2880, 2, 11, 5, 0, 11], 
    ];

    actors = {
        'clown'          : '🤡',
        'guard'          : '💂',
        'scientist'      : '👩‍🔬',
        'farmer'         : '👨‍🌾',
        'hotel clerk'    : '🤵',
        'bride'          : '👰',
        'vampire'        : '🧛',
        'wizard'         : '🧙',
        'office worker'  : '👨‍💼',
        'family'         : '👨‍👩‍👧‍👦',
        'doctor'         : '👩‍⚕️',
        'builder'        : '👷',
        'factory worker' : '👨‍🏭',
        'bank teller'    : '👩‍💼',
        'judge'          : '👩‍⚖️',
        'cashier'        : '🧕',
        'salesperson'    : '🙎‍♂️',
        'self service'   : '🖥',
    };

    props = [
        // Room#, type, name, content, width, height, x, y, radius overide, element reference
        // Other potential settings (no currently used): zindex, colour
        // types: 
        // 
        // bit 0-1:  00 = actor, 01 = item, 10 = prop, 11 = ?
        // bit 2:    0 = shadow, 1 = no shadow
        // bit 3:    0 = observe objs, 1 = ignore objs
        // bit 4-5:  00 = normal, 01 = light, 10 = dark, 11 = ?
        // bit 6:
        // bit 7:

        // Room 1 - Main street north
        [ 1,  14, 'office',            '🏢', 400, 400,   280,  700 ],
        [ 1,   2, 'tree',              '🌴', 300, 300,   50,   825, 30 ],
        [ 1,   2, 'tree',              '🌴', 300, 300,   810,  825, 30 ],
        [ 1,   2, 'tree',              '🌴', 300, 300,   1770, 825, 30 ],
        [ 1,   2, 'tree',              '🌴', 300, 300,   2730, 825, 30 ],
        [ 1,   2, 'tree',              '🌴', 300, 300,   3690, 825, 30 ],
        [ 1,   2, 'ambulance',         '🚑', 200, 200,   1500, 950 ],
        [ 1,  14, 'hospital',          '🏥', 400, 400,   1240, 700 ],
        [ 1,   2, 'police_car',        '🚓', 200, 200,   2000, 950 ],
        [ 1,   2, 'police_car',        '🚓', 200, 200,   2600, 950 ],
        [ 1,  14, 'courthouse',        '🏛',  400, 400,   2200, 700 ],
        [ 1,  14, 'bank',              '🏦', 400, 400,   3160, 700 ],
        [ 1,   2, 'lorry',             '🚛', 200, 200,   4040, 950 ],
        [ 1,   2, 'lorry',             '🚚', 200, 200,   4460, 950 ],
        [ 1,  14, 'building_site',     '🏗',  400, 400,   4120, 700 ],

        // Room 2 - Main street south
        [ 2,  2, 'tree',               '🌴', 300, 300,   50,    825, 30 ],
        [ 2,  2, 'tree',               '🌴', 300, 300,   810,   825, 30 ],
        [ 2,  2, 'tree',               '🌴', 300, 300,   1770,  825, 30 ],
        [ 2,  2, 'tree',               '🌴', 300, 300,   2730,  825, 30 ],
        [ 2,  2, 'tree',               '🌴', 300, 300,   3690,  825, 30 ],
        [ 2, 14, 'department_store',   '🏬', 400, 400,   280,   700 ],
        [ 2, 14, 'store',              '🏪', 400, 400,   1240,  700 ],
        [ 2, 14, 'post_office',        '🏤', 400, 400,   2200,  700 ],
        [ 2, 14, 'hotel',              '🏨', 400, 400,   3160,  700 ],
        [ 2, 14, 'house',              '🏠', 400, 400,   4120,  700 ],

        // Room 3 - House row
        [ 3, 14, 'house',              '🏠', 400, 400,   330, 700 ],
        [ 3,  2, 'tree',               '🌲', 300, 300,   80, 825 ],
        [ 3,  2, 'tree',               '🌳', 300, 300,   810, 650 ],
        [ 3,  2, 'tree',               '🌳', 300, 300,   1770, 650 ],
        [ 3,  2, 'tree',               '🌳', 300, 300,   2730, 650 ],
        [ 3,  2, 'tree',               '🌲', 300, 300,   3690, 650 ],
        [ 3,  2, 'car',                '🚙', 200, 200,   800, 950 ],
        [ 3, 14, 'house',              '🏡', 400, 400,   1240, 700 ],
        [ 3,  2, 'car',                '🚗', 200, 200,   2000, 950 ],
        [ 3,  2, 'minivan',            '🚐', 200, 200,   3000, 950 ],
        [ 3, 14, 'house',              '🏠', 400, 400,   2200, 700 ],
        [ 3, 14, 'house',              '🏡', 400, 400,   3160, 700 ],
        [ 3,  2, 'scooter',            '🛵', 150, 150,   4460, 950 ],
        [ 3, 14, 'house',              '🏠', 400, 400,   4120, 700 ],

        // Room 4 - Park, school, farm
        [ 4,  14, 'woods',              null, 300, 300,   -50, 650 ],
        [ 4,   2, 'tree',              '🌲', 300, 300,   -150, 650 ],
        [ 4,   2, 'tree',              '🌲', 300, 300,   350, 600 ],
        [ 4,  66, 'tree',              '🌲', 300, 300,   150, 550 ],
        [ 4, 130, 'elephant',          '🐘', 200, 200,   875, 600 ],
        [ 4,  14, 'circus',            '🎪', 400, 400,   1240, 650 ],
        [ 4,   2, 'fountain',          '⛲', 200, 200,   2300, 550 ],
        [ 4,  14, 'mountain',          '⛰',  350, 350,   3160, 350, , 99 ],
        [ 4,  14, 'castle_path',       null,  300, 300,   3160, 700, , 100 ],
        [ 4,   2, 'bus',               '🚌', 250, 250,   4900, 950 ],
        [ 4,   2, 'bus_stop',          '🚏',  50, 200,    4800, 825 ],
        [ 4,   2, 'bicyle',            '🚲', 100, 100,   4450, 600 ],
        [ 4,   2, 'bicyle',            '🚲', 100, 100,   4500, 650 ],
        [ 4,   2, 'goal_net',          '🥅', 100, 100,   4200, 500 ],
        [ 4,   2, 'moai_statue',       '🗿',  100, 200,   3500, 650 ],
        [ 4, 130, 'moai_statue',       '🗿',  100, 200,   3025, 650 ],
        [ 4,  14, 'school',            '🏫', 400, 400,   5080, 700 ],
        [ 4,   2, 'tractor',           '🚜', 200, 200,   5900, 950 ],
        [ 4,  14, 'barn',              '🏚',  400, 400,   6100, 540 ],
        [ 4,   2, 'cow',               '🐄', 100, 100,   5800, 500 ],
        [ 4,   2, 'cow',               '🐄', 100, 100,   6500, 500 ],
        [ 4,   2, 'sheep',             '🐏', 100, 100,   6000, 620 ],
        [ 4,   2, 'sheep',             '🐑', 100, 100,   6350, 620 ],
        [ 4,   2, 'sheep',             '🐑', 100, 100,   5600, 560 ],

        // Room 5 - Church
        [ 5,   2, 'tree',              '🌴', 300, 300,   50,   825, 30 ],
        [ 5,   2, 'tree',              '🌴', 300, 300,   810,  825, 30 ],
        [ 5,   2, 'tree',              '🌴', 300, 300,   1770, 825, 30 ],
        [ 5,   2, 'tree',              '🌴', 300, 300,   2730, 825, 30 ],
        [ 5,  14, 'church',            '⛪', 350, 350,   1240, 700 ],
        [ 5,   2, 'car',               '🚙', 200, 200,   2100, 950 ],
        [ 5,  14, 'courthouse',        '🏠', 400, 400,   2200, 700 ],

        // Room 6 - Petrol station
        [ 6,   2, 'pump',              '⛽', 120, 120,   150,  825 ],
        [ 6,   2, 'pump',              '⛽', 120, 120,   620,  825 ],
        [ 6,   2, 'pump',              '⛽', 120, 120,   1090, 825 ],
        [ 6,  14, 'factory',           '🏭', 350, 350,   350,  600, , 499 ],
        [ 6,  14, 'factory',           '🏭', 350, 350,   800,  600, , 499 ],
        [ 6,   6, 'oil_drum',          '🛢', 100, 100,   600,  680 ],
        [ 6,   6, 'oil_drum',          '🛢', 100, 100,   710,  680 ],
        [ 6,   6, 'oil_drum',          '🛢', 100, 100,   820,  680 ],
        [ 6,   6, 'oil_drum',          '🛢', 100, 100,   930,  680 ],
        [ 6,   2, 'car',               '🚙', 200, 200,  350,   950 ],
        [ 6,  14, 'derelict_house',    '🏚', 400, 400,   1240,  700 ],

        // Room 7 - Castle gates
        [ 7,  14, 'castle',            '🏰', 600, 600,   180,  620 ],
        [ 7,   2, 'tree',              '🌲', 300, 300,   -150, 650 ],
        [ 7,   2, 'tree',              '🌲', 300, 300,   810,  650 ],

        // Room 8 - Woods
        [ 8,   6, 'coffin',            '⚰', 100, 100,   180,  660 ],
        [ 8,   2, 'tree',              '🌲', 300, 300,   -150, 650 ],
        [ 8,   2, 'tree',              '🌲', 300, 300,   350,  650 ],
        [ 8,  66, 'tree',              '🌲', 300, 300,   250,  550 ],
        [ 8,   2, 'tree',              '🌲', 350, 350,   -150, 850 ],
        [ 8,   2, 'tree',              '🌳', 400, 400,   800,  600 ],
        [ 8,   2, 'door',              '🚪', 100, 200,   1250, 500 ],

        // Room 9 - Main street south east
        [ 9,   2, 'tree',              '🌴', 300, 300,   50,   825, 30 ],
        [ 9,   2, 'tree',              '🌴', 300, 300,   810,  825, 30 ],
        [ 9,   2, 'tree',              '🌴', 300, 300,   1770, 825, 30 ],
        [ 9,  14, 'house',             '🏠', 400, 400,   1240, 700 ],
        [ 9,  14, 'house',             '🏡', 400, 400,   2200, 700 ],

        // Room 10 - Main street south west
        [ 10,  2, 'tree',              '🌴', 300, 300,   50,   825, 30 ],
        [ 10,  2, 'tree',              '🌴', 300, 300,   810,  825, 30 ],
        [ 10,  2, 'tree',              '🌴', 300, 300,   1770, 825, 30 ],
        [ 10, 14, 'house',             '🏡', 400, 400,   280,  700 ],
        [ 10, 14, 'derelict_house',    '🏚',  400, 400,   1240, 700 ],

        // Room 11 - Countryside
        // No items. Ego just walks back into the previous room, as there is nothing in that direction.

        // Room 0 - All rooms
        [ 0,  14, 'wall',               null, 6720,  114, 0,    620, , 500 ],
        [ 0,  14, 'road',               null, 6720,  50,  0,    985, , 100 ],
        [ 0,  14, 'left_path',          null, 200,   305, null, 866, , 501 ],
        [ 0,  14, 'right_path',         null, 200,   305, null, 866, , 501 ],
        [ 0,  14, 'cloud',              '☁', 200,    50, 50,   130 ],
        [ 0,  14, 'cloud',              '☁', 200,    50, 450,  130 ],

    ];

    flags = {};

    _gameOver = true;

    inputEnabled = false;

    /**
     * Constructor for Game.
     */
    constructor() {
        this.screen = document.getElementById('screen');
        this.wrap = document.getElementById('wrap');
        this.overlay = document.getElementById('overlay');
        this.scoreEl = document.getElementById('score');
        this.items = document.getElementById('itemlist');
        this.sentence = document.getElementById('sentence');
        this.commands = document.getElementById('commands');
        this.msg = document.getElementById('msg');
        this.defineCustomElements();
        this.userInput = new UserInput(this, screen);
        this.logic = new Logic(this);
        this.sound = new Sound();
        this.emojiMap = new Map();
        this.unicodeVersion = this.detectEmojiVersion();
        console.log('UNICODE VERSION: ' + this.unicodeVersion);
        this.start();
    }

    /**
     * Detects what Emoji Unicode version is available by default.
     */
    detectEmojiVersion() {
        // These chars are from different Unicode version, starting at 6.
        return [...'🐄🙂🧀🥕🧛🧪🪓🛖'].reduce((a, c) =>  a + (Util.renderEmoji(c, 50, 50)[2]? 1 : 0), 5);
    }

    /**
     * Defines the custom HTML elements that we use in the game.
     */
    defineCustomElements() {
        customElements.define('x-sprite', Sprite);
        customElements.define('x-ego', Ego);
        customElements.define('x-shadow', class Shadow extends HTMLElement {});
        customElements.define('x-wall', class Shadow extends HTMLElement {});
    }

    /**
     * Starts the game.
     */
    start() {
        this.resizeScreen();
        window.onresize = e => this.resizeScreen(e);

        this.userInput.enableInput();

        // Register click event listeners for item list arrow buttons.
        document.getElementById("up").onclick = e => this.scrollInv(1);
        document.getElementById("down").onclick = e => this.scrollInv(-1);

        this.commands.querySelectorAll('*').forEach(verb => {
            verb.onclick = e => this.command = this.verb = e.target.dataset.name;
        });

        // The sound generation might be a bit time consuming on slower machines.
        // TODO: Fix how sound is initialised.
        setTimeout(() => this.sound.init(), 1);

        // Initalise the mouse cursor.
        // TODO: Build the hour glass emoji for wait moments.
        let cursorImgUrl = Util.renderEmoji('➕', 20, 20)[0].toDataURL();
        document.body.style.cursor = `url(${cursorImgUrl}) 10 10, auto`;

        this.gameOver();
    }

    /**
     * @param {string} msg The message to display, optional.
     */
    gameOver(msg) {
        this.fadeOut(this.wrap);
        if (msg) {
          this.msg.innerHTML = msg;
        }
        window.onclick = e => {
            this.fadeOut(this.msg);
            setTimeout(() => this.msg.style.display = 'none', 200);
            setTimeout(() => {
                this.sound.play('music');
                this.init();
                this.loop();
            }, 500);
        }
    }

    /**
     * Initialised the parts of the game that need initialising on both
     * the initial start and then subsequent restarts. 
     */
    init() {
        this._gameOver = false;
        this.inputEnabled = true;
        
        window.onclick = null;

        this.screen.onclick = e => this.processCommand(e);
  
        // For restarts, we'll need to remove the objects from the screen.
        if (this.objs) {
            this.obj.forEach(obj => obj.remove());
        }
        
        // Set the room back to the start, and clear the object map.
        this.objs = [];
        this.room = 7;//6;//1; //4; //7; //6;//1; // 4; //6; //1;

        this.getItem('bank card');

        // Create Ego (the main character) and add it to the screen.
        this.ego = document.createElement('x-ego');
        this.ego.init(this, 50, 150);
        this.ego.setPosition(350, 0, 750);
        this.ego.nesw = 1;
        this.ego.id = 'me';
        this.screen.appendChild(this.ego);
  
        // Enter the starting room.
        this.newRoom();
        
        // Fade in the whole screen at the start.
        this.fadeIn(this.wrap);
    }

    /**
     * Adds a Sprite to the game.
     * 
     * @param {Sprite} obj The Sprite to add to the game.
     */
    add(obj) {
        this.screen.appendChild(obj);
        this.objs.push(obj);
    }

    /**
     * Removes a Sprite from the game.
     * 
     * @param {Sprite} obj  The Sprite to remove from the game.
     */
    remove(obj) {
        // Remove the Sprite from the screen.
        try {
            this.screen.removeChild(obj);
        } catch (e) {
            // Ignore. We don't care if it has already been removed.
        }

        // Remove the Sprite from our list of managed objects.
        this.objs = this.objs.filter(o => o !== obj);
    }

    /**
     * Scales the screen div to fit the whole screen.
     * 
     * @param {UIEvent} e The resize event.
     */
    resizeScreen(e) {
        this.scaleX = window.innerWidth / this.wrap.offsetWidth;
        this.scaleY = window.innerHeight / this.wrap.offsetHeight;
        this.wrap.style.setProperty('--scale-x', this.scaleX);
        this.wrap.style.setProperty('--scale-y', this.scaleY);
    }

    /**
     * This is the main game loop, in theory executed on every animation frame.
     *
     * @param {number} now Time. The delta of this value is used to calculate the movements of Sprites.
     */
    loop(now) {
        // Immediately request another invocation on the next.
        requestAnimationFrame(now => this.loop(now));

        // Calculates the time since the last invocation of the game loop.
        this.updateDelta(now);

        // Update all objects on the screen.
        this.updateObjects();

        // Update sentence.
        let newSentence = (this._gameOver? 'Game Over' : this.command + ' ' + this.thing);
        if (newSentence != this.lastSentence) {
            this.sentence.innerHTML = this.lastSentence = newSentence;
        }

        // Adjust screen left to account for scrolling.
        if (this.ego.isVisible()) {
            let newScreenLeft = this.ego.x - (960 / 2);
            if (newScreenLeft < 0) newScreenLeft = 0;
            if (newScreenLeft > (this.roomData[1] - 960)) newScreenLeft = (this.roomData[1] - 960);

            if (newScreenLeft != this.screenLeft) {
                this.screenLeft = newScreenLeft;
                this.screen.style.setProperty('--screen-left', `-${this.screenLeft}px`);
            }
        }

        //this.userInput.processUserInput(this.ego);

        // If after updating all objects, the room that Ego says it is in is different
        // than what it was previously in, then we trigger entry in to the new room.
        if (this.ego.edge) {
            this.edge = this.ego.edge;
            if (this.room == this.ego.room) {
                // No room change.
                this.ego.say("I didn't find much in that direction.", 200);
            } else {
                this.room = this.ego.room;
                this.fadeOut(this.wrap);
                setTimeout(() => this.newRoom(), 200);
            }
            this.ego.edge = 0;
        }

        // Update cursor and overlay based on user input state.
        this.overlay.style.display = (this.inputEnabled? 'none' : 'block');
        //this.wrap.style.cursor = (this.inputEnabled? 'crosshair' : 'wait');
    }

    /**
     * Updates the delta, which is the difference between the last time and now. Both values
     * are provided by the requestAnimationFrame call to the game loop. The last time is the
     * value from the previous frame, and now is the value for the current frame. The difference
     * between them is the delta, which is the time between the two frames.
     * 
     * @param {number} now The current time provided in the invocation of the game loop.
     */
    updateDelta(now) {
        if (now) {
            this.delta = now - (this.lastTime ? this.lastTime : (now - 16));
            this.stepFactor = this.delta * 0.06;
            this.lastTime = now;
        }
    }

    /**
     * The main method invoked on every animation frame when the game is unpaused. It 
     * interates through all of the Sprites and invokes their update method. The update
     * method will invoke the move method if the calculated position has changed. This
     * method then tests if the Sprite is touching another Sprite. If it is, it invokes
     * the hit method on both Sprites. 
     */
    updateObjects() {
        let objsLen = this.objs.length;

        // Iterate over all of the Sprites in the current room, invoking update on each on.
        for (let i=-1, a1=this.ego; i < objsLen; a1 = this.objs[++i]) {
            if (a1) {
                a1.update();

                // Check if the Sprite is touching another Sprite.
                for (let j = i + 1; j < objsLen; j++) {
                    let a2 = this.objs[j];
                    if (a2 && a1.touching(a2)) {
                        // If it is touching, then invoke hit on both Sprites. They might take 
                        // different actions in response to the hit.
                        a1.hit(a2);
                        a2.hit(a1);
                    }
                }

                // Clears the Sprite's moved flag, which is only of use to the hit method.
                a1.moved = false;
            }
        }
    }

    /**
     * Adds the given points to the current score.
     * 
     * @param {number} points The number of points to increment the score by.
     */
    addToScore(points) {
        this.score += points;
        this.scoreEl.innerHTML = '' + this.score + ' of 135';
    }
      
    /**
     * Processes the current user interaction.
     * 
     * @param {MouseEvent} e The mouse event that trigger the command to process.
     */
    processCommand(e) {
        if (this.inputEnabled && !this._gameOver) {
          this.command = this.logic.process(this.verb, this.command, this.thing, e);
          if (this.command == this.verb) {
            this.command = this.verb = 'Walk to';
          }
        }
        if (e) e.stopPropagation();
    }

    /**
     * Invoked when Ego is entering a room.  
     */
    newRoom() {
        console.time('newRoom');

        // Remove the previous room's Objs from the screen.
        this.objs.forEach(obj => obj.remove());
        this.objs = [];

        this.roomData = this.rooms[this.room - 1];

        // Adjust the screen width for the new room.
        this.screen.style.setProperty('--screen-width', `${this.roomData[1]}px`);

        // Add props
        console.time("addProps");
        this.props.forEach(prop => {
            // If prop is in the current room, or in room 0 (i.e. all rooms)...
            if ((prop[0] == this.room) || (prop[0] == 0)) this.addPropToRoom(prop);
        });
        console.timeEnd("addProps");

        // Add tree row, if required.
        // TODO: Do we need to create the Sprite every time?
        if (this.roomData[0] & 2) {
            console.time('buildTrees');
            let treeSize = this.roomData[0] & 4? 100 : 200;
            for (let x=0; x < this.roomData[1]; x += treeSize) {
                this.addPropToRoom([ 0, 0x42, 'trees', '🌲', treeSize, treeSize, x, 400 ]);
            }
            for (let x=-treeSize/2; x < this.roomData[1]; x += treeSize) {
                this.addPropToRoom([ 0, 2, 'trees', '🌲', treeSize, treeSize, x, 450 ]);
            }
            console.timeEnd('buildTrees');
        }
        if (this.roomData[0] & 8) {
            for (let x=0; x < this.roomData[1]; x += 300) {
                this.addPropToRoom([ 0, 0x42, 'trees', '🌲', 300, 300, x, 1100 ]);
            }
            for (let x=-150; x < this.roomData[1]; x += 300) {
                this.addPropToRoom([ 0, 2, 'trees', '🌲', 300, 300, x, 1150 ]);
            }
        }

        // Add event listeners for objects in the room.
        [...this.screen.children].forEach(obj => this.addObjEventListeners(obj));

        // TODO: Remove this, as it isn't really required for this game.
        // It is possible that ego has walked into the position of another object when
        // entering the room, so we scan to find a new position.
        //let i=0, n=0, s=1, {edge, x, z} = this.ego, bo;
        //while (edge == 3 && (bo = this.objs.find(o => this.ego.touching(o)))) {
        //    this.ego.setPosition(x + i, 0, z);
        //    i+=(s*=-1)*n++;
        //}
        if (this.edge == 3) {
            let e = this.ego;
            let bo = this.objs.find(o => e.touching(o));
            if (bo) {
                // Ego is touching a car...
                // TODO: We could make this a death scenario, e.g. car just started moving.
                // Move Ego to either the left or right, depending on which is closer.
                e.setPosition(e.cx < bo.cx? bo.x - e.width - 20 : bo.x + bo.width + 20, 0, e.z);
                // Adjust the destination to match the new X position.
                e.dests[0].x = e.x;
            }
        }

        this.fadeIn(this.wrap);
        this.ego.show();
        this.fadeIn(this.ego);

        console.timeEnd('newRoom');
    }

    /**
     * Adds the given prop to the current room screen.
     * 
     * @param {Array} prop 
     */
    addPropToRoom(prop) {
        console.time('addProp_'+prop[2]);

        // Room type, room width, left crossing, left path, centre crossing, right path, right crossing

        // We only add the wall if the room type says there is one.
        if (((prop[2] == 'wall') && !(this.roomData[0] & 0x01)) || 
            ((prop[2] == 'left_path') && !this.roomData[3]) || 
            ((prop[2] == 'right_path') && !this.roomData[5])) {
            return;
        }

        // We cache the obj when it isn't in the dom rather than recreate. It might remember it's state.
        let obj = prop[10];

        // Room#, type, name, content, width, height, x, y, element reference
        // bit 0-1:  00 = actor, 01 = item, 10 = prop, 11 = ?
        // bit 2:    0  = shadow, 1 = no shadow
        // bit 3:    0  = observe objs, 1 = ignore objs
        // TODO: Need a block shift, to baseline and up. 
        // TODO: Need a smaller blocker, e.g. for trees.
        // bit 5-6:  00 = normal, 01 = light, 10 = dark
        // bit 7:    0 = normal, 1 = horizontal flip.

        if (!obj) {
            obj = new Sprite();
            obj.init(this, prop[4], prop[5], prop[3], !(prop[1] & 4), (prop[1] & 128));

            // If this is not a unique object, then we set a class.
            obj.classList.add(obj.dataset.name = prop[2]);

            obj.propData = prop;

            if (prop[6] !== null) {
                obj.setPosition(prop[6], 0, prop[7]);
            }

            if (prop[1] & 32) {
                obj.classList.add('light');
            }
            if (prop[1] & 64) {
                obj.classList.add('dark');
            }
            if (prop[1] & 8) {
                // Ignore objs
                obj.ignore = true;
            }
            if (prop[8]) {
                obj.radius = prop[8];
            }
            if (prop[9]) {
                obj.style.zIndex = prop[9];
            }

            prop[10] = obj;
        }

        // For the paths, update down class for if path is going down (instead of up).
        if (prop[2].includes('path')) {
            obj.classList.remove('down');
            if (this.roomData[3] < 0) {
                obj.classList.add('down');
            }
        }

        this.add(obj);

        console.timeEnd('addProp_'+prop[2]);
    }

    /**
     * Adds the necessarily event listens to the given element to allow it to be 
     * interacted with as an object in the current room.
     * 
     * @param {HTMLElement} elem The HTMLElement to add the object event listeners to.
     */
    addObjEventListeners(elem) {
        // It is important that we don't use addEventListener in this case. We need to overwrite
        // the event handler on entering each room.
        //elem.onmouseenter = e => this.objMouseEnter(e);
        elem.onmouseleave = e => this.objMouseLeave(e);
        elem.onclick = e => this.objClicked(e);
        elem.onmousemove = e => this.objMouseMove(e);
    }

    // /**
    //  * Handles a mouse enter event.
    //  * 
    //  * @param {MouseEvent} e 
    //  */
    // objMouseEnter(e) {
    //     //this.thing = e.target.dataset.name? e.target.dataset.name.replace('_',' ') : '';
    // }

    /**
     * Handles a mouse leave event.
     * 
     * @param {MouseEvent} e 
     */
    objMouseLeave(e) {
        this.thing = '';
    }

    /**
     * Handles a mouse click event.
     * 
     * @param {MouseEvent} e 
     */
    objClicked(e) {
        // TODO: Remove. Mouse move now tracks the "thing"
        //let target = e.currentTarget;
        //this.thing = target.dataset.name? target.dataset.name.replace('_',' ') : '';
        this.processCommand(e);
    }
    
    // TODO: Experimenting with testing pixels for transparency.
    objMouseMove(e) {
        let target = e.currentTarget;
        //let name = target.dataset.name? target.dataset.name : target.id;
        if (target.canvas) {
            let rect = target.getBoundingClientRect(); 
            let x = ~~((e.clientX - rect.left) / this.scaleX);
            let y = ~~((e.clientY - rect.top) / this.scaleY);
            let { width, height } = target;
            let ctx = target.canvas.getContext('2d');
            let imgData = ctx.getImageData(0, 0, width, height);

            // Pixel is transparent, so get sprite underneath.
            if (!imgData.data[(y * (width << 2)) + (x << 2) +3]) {
                let elements = document.elementsFromPoint(e.clientX, e.clientY).filter(s => s instanceof Sprite);
                target = elements[1]? elements[1] : null;
            }
        }
        this.thing = target? (target.dataset.name? target.dataset.name : target.id).replace('_',' ') : '';
    }

    /**
     * Adds the given item to the inventory.
     * 
     * @param {string} name The name of the item to add to the inventory.
     */
    getItem(name) {
        let item = document.createElement('span');
        item.innerHTML = this.itemIcons[name];
        item.dataset.name = name;
        this.items.appendChild(item);

        this.addObjEventListeners(item);

        this.inventory[name] = item;
    }

    /**
     * Checks if the given item is in the inventory.
     * 
     * @param {string} name The name of the item to check is in the inventory.
     */
    hasItem(name) {
        return this.inventory.hasOwnProperty(name);
    }

    /**
     * Removes the given item from the inventory.
     * 
     * @param {string} name The name of the item to drop.
     */
    dropItem(name) {
        let item = this.inventory[name];
        this.items.removeChild(item);
        delete this.inventory[name];
    }

    /**
     * Handles scrolling of the inventory list.
     * 
     * @param {number} dir The direction to scroll the inventory.
     */
    scrollInv(dir) {
        let newLeft = this.itemsLeft + (77 * dir);
        let invCount = this.items.children.length;
        if ((newLeft <= 0) && (newLeft >= -((invCount - 6) * 77))) {
            this.itemsLeft = newLeft;
            this.items.style.left = this.itemsLeft + 'px';
        }
    }

    /**
     * Fades in the given DOM Element.
     * 
     * @param {HTMLElement} elem The DOM Element to fade in.
     */
    fadeIn(elem) {
        // Remove any previous transition.
        elem.style.transition = 'opacity 0.5s';
        elem.style.opacity = 1.0;
        // This is so that other css styles can set transitions on the element
        // while we're not fading in.
        setTimeout(() => elem.style.removeProperty('transition'), 700);
    }

    /**
     * Fades out the given DOM Element.
     * 
     * @param {HTMLElement} elem The DOM Element to fade out.
     */
    fadeOut(elem) {
        elem.style.transition = 'opacity 0.5s';
        elem.style.opacity = 0.0;
    }
}