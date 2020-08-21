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
    let flags = this.game.flags;

    // If thing is in the current room, then obj will reference it.
    let obj = this.game.objs.find(i => i.dataset['name'] == thing);

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

      case 'Pick up':
        if (this.game.hasItem(thing)) {
          this.game.ego.say("I already have that.", 140);
        } else {
          switch (thing) {
            default:
              // Is item in the current room?
              if (obj && obj.propData[1] & 1) {
                this.game.ego.moveTo(this.game.ego.cx, 740, function() {
                  this.game.ego.moveTo(obj.x, 740, function() {
                    this.game.getItem(thing);
                    this.game.remove(obj);
                    obj.propData[0] = -1;  // Clears the room number for the item.
                    // TODO: this.game.addToScore(15);
                  });
                });
              }
              else {
                this.game.ego.say("I can't get that.", 220);
              }
              break;
          }
        }
        break;
      
      case 'Use':
        if (cmd == verb) {
          // Using items will add the ' with ' word to the sentence.
          if (this.game.hasItem(thing)) {
            newCommand = 'Use ' + thing + ' with ';
          } else {
            switch (thing) {
              case 'mailbox':
                if (flags[1]) {
                  // Mailbox open.
                  if (flags[2]) {
                    // No letter inside, so close it.
                    obj.render('📪');
                    flags[1] = 0;
                  } else {
                    // Letter inside, so take it.
                    obj.render('📭');
                    flags[2] = 1;
                    this.game.getItem('envelope');
                  }
                } else {
                  // Mailbox closed. Use will open it.
                  obj.render(flags[2]? '📭' : '📬');
                  flags[1] = 1;
                }
                break;
            }
          }
        } else {
          // If verb doesn't equal cmd, it means that it is a scenario where an item
          // is being used with something.
          let thing2 = cmd.substring(4, cmd.indexOf(' with '));
          switch (thing2) {
            default:
              break;
          }
        }
        break;

      default:
        this.game.ego.say("Nothing happened.", 220);
        break;
    }

    return newCommand;
  }

}
