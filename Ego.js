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
            if (edge < 8) {
                let edgeData = this.game.rooms[this.room - 1][edge + 1];
                if (edgeData == 50) {
                    // 11 means come back in the same exit.
                    edgeData = this.room;
                    edge = [5, 4, 0, 2, 1][edge-1];
                }
                if (edgeData) {
                    this.game.inputEnabled = false;

                    // Hide ego before we reposition him to the new entry point.
                    if (edgeData != this.room) this.hide();

                    // Set the new room for ego.
                    this.room = Math.abs(edgeData);

                    // Get room data for new room, so we can calculate right side entry position.
                    let newRoomWidth = this.game.rooms[this.room - 1][1];
                    let newRoomDown = (this.game.rooms[this.room - 1][3] < 0);
                    let pathStartY = (newRoomDown? 980 : 600);
                    let pathStartAddX = (newRoomDown? -70 : 70);
                    let pathEndAddX = (newRoomDown? 100 : 30);
                    let reverseX = newRoomWidth - ((this.x / this.game.roomData[1]) * newRoomWidth);

                    // 1 = left crossing
                    // 2 = left path
                    // 3 = centre crossing
                    // 4 = right path
                    // 5 = right crossing

                    // Work out the new position for ego.
                    switch (edge) {
                        case 1: // From the left edge of screen, i.e. left crossing
                            this.setPosition(newRoomWidth, this.z);
                            this.setDirection(Sprite.LEFT);
                            this.moveTo(newRoomWidth - 70, 740, () => this.game.inputEnabled = true);
                            break;

                        case 2: // Left foot path, i.e. hitting horizon up the left side.
                            this.setPosition(newRoomWidth - pathStartAddX - this.radius, pathStartY);
                            this.setDirection(newRoomDown? Sprite.IN : Sprite.OUT);
                            this.moveTo(newRoomWidth - pathEndAddX, 740, () => this.game.inputEnabled = true);
                            break;

                        case 6:
                        case 3: // From the bottom edge of screen, i.e. across road.
                            this.setPosition(reverseX, 950);
                            this.setDirection(Sprite.IN);
                            this.moveTo(reverseX, 740, () => this.game.inputEnabled = true);
                            break;

                        case 4: // Right foot path, i.e. hitting horizon up the right side.
                            this.setPosition(pathStartAddX - this.radius, pathStartY);
                            this.setDirection(Sprite.OUT);
                            this.moveTo(pathEndAddX, 740, () => this.game.inputEnabled = true);
                            break;

                        case 5: // From the right edge of screen, i.e. right crossing.
                            this.setPosition(-50, this.z);
                            this.setDirection(Sprite.RIGHT);
                            this.moveTo(70, 740, () => this.game.inputEnabled = true);
                            break;

                        case 7: // Back from the castle.
                            this.setPosition(3300, 600);
                            this.setDirection(Sprite.OUT);
                            this.moveTo(3300, 740, () => this.game.inputEnabled = true);
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
}