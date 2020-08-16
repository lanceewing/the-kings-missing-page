class Ego extends Actor {

    /**
     * Constructor for Ego.
     */
    constructor() {
        super();
    }

    /**
     * 
     * @param {number} edge 
     */
    hitEdge(edge) {
        if (edge) {
            // Stop moving.
            this.destX = this.destZ = -1;
            this.heading = null;
            this.cell = 0;

            // Now check if there is a room on this edge.
            if (edge < 6) {
                let edgeData = this.game.rooms[this.room - 1][edge + 1];
                if (edgeData) {
                    this.game.inputEnabled = false;

                    // Hide ego before we reposition him to the new entry point.
                    this.hide();

                    // Set the new room for ego.
                    this.room = Math.abs(edgeData);

                    // Get room data for new room, so we can calculate right side entry position.
                    let newRoomWidth = this.game.rooms[this.room - 1][1];
                    let newRoomDown = (this.game.rooms[this.room - 1][3] < 0);
                    let pathStartY = (newRoomDown? 980 : 500);
                    let pathStartAddX = (newRoomDown? 0 : 200);

                    // 1 = left crossing
                    // 2 = left path
                    // 3 = centre crossing
                    // 4 = right path
                    // 5 = right crossing

                    // Work out the new position for ego.
                    switch (edge) {
                        case 1: // From the left edge of screen, i.e. left crossing
                            this.setPosition(newRoomWidth, this.y, this.z);
                            this.setDirection(Sprite.LEFT);
                            this.moveTo(newRoomWidth - 70, 740, () => this.game.inputEnabled = true);
                            break;

                        case 2: // Left foot path, i.e. hitting horizon up the left side.
                            this.setPosition(newRoomWidth - pathStartAddX, this.y, pathStartY);
                            this.setDirection(newRoomDown? Sprite.IN : Sprite.OUT);
                            this.moveTo(newRoomWidth - 70, 740, () => this.game.inputEnabled = true);
                            break;

                        case 3: // From the bottom edge of screen, i.e. centre crossing
                            this.setPosition(this.x, this.y, 355);
                            this.setDirection(Sprite.OUT);
                            break;

                        case 4: // Right foot path, i.e. hitting horizon up the right side.
                            this.setPosition(pathStartAddX, this.y, pathStartY);
                            this.setDirection(Sprite.OUT);
                            this.moveTo(70, 740, () => this.game.inputEnabled = true);
                            break;

                        case 5: // From the right edge of screen, i.e. right crossing.
                            this.setPosition(-50, this.y, this.z);
                            this.setDirection(Sprite.RIGHT);
                            this.moveTo(70, 740, () => this.game.inputEnabled = true);
                            break;
                    }
                    
                    // Previously positions are not applicable when room changes.
                    this.positions = [];

                    this.step = 1;

                    // Store the edge that ego entered the new room.
                    this.edge = edge;
                }
            }
        }
    }

    /**
     * 
     */
    processUserInput() {
        let direction = 0;
        let userInput = this.game.userInput;

        if (this.game.inputEnabled) {
            // Check if the direction keys are pressed and adjust Ego's direction accordingly.
            if (userInput.left() && !userInput.right()) {
                direction |= Sprite.LEFT;
            }
            if (userInput.right() && !userInput.left()) {
                direction |= Sprite.RIGHT;
            }
            if (userInput.up() && !userInput.down()) {
                direction |= Sprite.IN;
            }
            if (userInput.down() && !userInput.up()) {
                direction |= Sprite.OUT;
            }

            if (direction) {
                this.cell = ((this.cell + 1) % 30);
            }

            // Update Ego's direction to what was calculated above. The move method will use this 
            // when moving Ego. The direction is converted into a heading within setDirection.
            this.setDirection(direction);
        }
    }
}