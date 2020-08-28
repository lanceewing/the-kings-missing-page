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
    let game = this.game;
    let flags = game.flags;
    let ego = game.ego;

    // If thing is in the current room, then obj will reference it.
    let obj = game.objs.find(i => i.dataset['name'] == thing);
    let pickup = () => game.getItem(thing);

    switch (verb) {

      case 'Walk to':
        switch (thing) {
          case 'outside':
            while (obj && obj.nextElementSibling) {
              obj = obj.nextElementSibling;
              this.game.remove(obj.previousElementSibling);
            }
            this.game.remove(obj);
            break;
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
          ego.say("I already have that.", 140);
        } else {
          switch (thing) {
            default:
              // Is item in the current room?
              if (obj && obj.propData[1] & 1) {

                if (obj.propData[0] < 11) {
                  // Normal room, so walk to item and pick it up.
                  ego.moveTo(ego.cx, 740, () => ego.moveTo(obj.x, 740, pickup));
                } else {
                  // Inside room.
                  if (obj.propData[0] == 12)  {
                    pickup();
                  } else {
                    game.actor.say(`Hey! That's my ${thing}.`);
                  }
                }
              }
              else {
                ego.say("I can't get that.", 220);
              }
              break;
          }
        }
        break;

      case 'Look at':
        switch (thing) {
          case 'envelope':
            if (this.game.hasItem('letter')) {
              this.game.ego.say("It's empty.", 200);
            } else {
              this.game.ego.say("Letter inside.", 200);
              this.game.getItem('letter');
            }
            break;
          case 'letter':
            if (this.game.hasItem('paperclip')) {
              this.game.ego.say("It's a commission from the King asking you to find his missing page boy.", 300);
            } else {
              this.game.ego.say("Has paper clip.", 200);
              this.game.getItem('paperclip');
            }
            break;
          case 'shopping cart':
            if (this.game.hasItem('water pistol')) {
              this.game.ego.say("Nothing in there.", 250);
            } else {
              this.game.ego.say("I found a water pistol.", 300);
              this.game.getItem('water pistol');
            }
            break;
          default:
            if (thing != "") {
              this.game.ego.say("It's just a " + thing + ".", 250);
            }
            break;
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
                  if (this.game.hasItem('envelope')) {
                    // No letter inside, so close it.
                    obj.render('📪');
                    flags[1] = 0;
                  } else {
                    // Letter inside, so take it.
                    obj.render('📭');
                    this.game.getItem('envelope');
                  }
                } else {
                  // Mailbox closed. Use will open it.
                  obj.render(flags[2]? '📭' : '📬');
                  flags[1] = 1;
                }
                break;
              default:
                // TODO: Change this to check buildings map
                if (obj && obj.propData && obj.propData[1] & 16) { // Building
                  ego.moveTo(ego.cx, 740, () => {
                    ego.moveTo(obj.cx, 740, () => {
                      // Add "outside" background
                      game.addPropToRoom([0, 14, 'outside', null, 6720, 485, 0, 970, , 1000]);
                      // Add "inside" background.
                      game.addPropToRoom([0, 14, 'inside', null, 400, 300, obj.x, 700, , 1001]);
                      // Add the items inside the building.
                      game.props.forEach(prop => { if (prop[0] == obj.propData[10]) game.addPropToRoom(prop); });

                    });
                  });
                } else {
                  this.game.ego.say("I can't use that.", 250);
                }
                break;
            }
          }
        } else {
          // If verb doesn't equal cmd, it means that it is a scenario where an item
          // is being used with something.
          let things = [thing, cmd.substring(4, cmd.indexOf(' with '))].sort().join();
          switch (things) {
            case 'rose,tulip':
              if (this.game.hasItem('rose') && this.game.hasItem('tulip')) {
                this.game.getItem('bouquet');
                this.game.dropItem('tulip');
                this.game.dropItem('rose');
              } else {
                this.game.ego.say("I should pick them both up first.", 200);
              }
              break;
            case 'fountain,water pistol':
              if (flags[2]) {
                this.game.ego.say("It's already full.", 200);
              } else {
                this.game.ego.say("OK");
                flags[2] = 1;
              }
              break;
            case 'bouquet,bride':
              game.dropItem('bouquet');
              obj.say('Thanks. Take my lipstick.', 250);
              game.getItem('lipstick');
              break;
            default:
              break;
          }

          newCommand = verb;
        }
        break;

      default:
        this.game.ego.say("Nothing happened.", 220);
        break;
    }

    return newCommand;
  }

}
