/**
 * Holds room logic functions.
 */
class Logic {

  /**
   * Constructor for Logic.
   * 
   * @param {Game} game The Game.
   */
  constructor(game) {
    this.game = game;
    this.userInput = game.userInput;
  }

  /**
   * Processes a command from the user input.
   * 
   * @param {string} verb The verb part of the command to process.
   * @param {string} cmd The full command to process.
   * @param {string} thing The thing or noun part of the command to process.
   * @param {MouseEvent} e The mouse event associated with the command to process.
   */
  process(verb, cmd, thing, e) {
    let newCommand = cmd;
    let thingId = thing.replace(' ', '_');

    switch (verb) {

      case 'Walk to':
        switch (thing) {
          case 'left path':
          case 'right path': {
              let left = thing.includes('left');
              // TODO: This is a bit hacky. Would be nice if this method had the actual target sprite.
              let down = document.querySelectorAll('.down').length > 0; 
              let endY = (down? 1000 : 490);
              let endX = (left? (down? 20 : 200) : this.game.roomData[1] - (down? 70 : 200));
              let firstX = (left? (down? 150 : 20) : this.game.roomData[1] - (down? 200 : 70));              

              this.game.inputEnabled = false;
              this.game.ego.stop();

              // Walk to be in front of the path.
              this.game.ego.moveTo(firstX, 740);

              // Now walk through the path.
              this.game.ego.moveTo(endX, endY);
            }
            break;

          case 'woods':
            this.game.inputEnabled = false;
            this.game.ego.stop();
            this.game.ego.moveTo(210, 740);
            this.game.ego.moveTo(210, 640);
            this.game.ego.moveTo(70, 550);
            this.game.ego.moveTo(-50, 550);
            break;

          case 'road':
            // TODO: Walk sideways first to avoid trees and cars.
            this.game.inputEnabled = false;
            this.game.ego.stop();
            this.game.ego.moveTo(this.game.screenLeft + (e.pageX / this.game.scaleX), 850);
            this.game.ego.moveTo(this.game.screenLeft + (e.pageX / this.game.scaleX), 1000);
            break;

          case 'castle path':
          case 'mountain':
            this.game.inputEnabled = false;
            this.game.ego.stop();
            this.game.ego.moveTo(3280, 740);
            this.game.ego.moveTo(3280, 400);
            break;

          default:
            this.game.ego.stop(true);

            let z = ((e.pageY / this.game.scaleY) - 27) * 2;
            if (z > 710) {
              this.game.ego.moveTo(
                this.game.screenLeft + (e.pageX / this.game.scaleX),
                ((e.pageY / this.game.scaleY) - 27) * 2);
    
            } else {
              this.game.ego.moveTo(this.game.screenLeft + (e.pageX / this.game.scaleX), 740);
            }
            break;
        }
        break;

      default:
        this.game.ego.say("Nothing happened.", 220);
        break;
    }

    return newCommand;
  }

}
