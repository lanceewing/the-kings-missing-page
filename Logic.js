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
    let speaker = game.actor? game.actor : ego;

    switch (verb) {
      case 'Talk to':
        switch (thing) {
          case 'guard':
            game.actor.say("Hello Detective Pip.", 250, () => {
              if (game.hasItem('map')) {
                game.actor.say("Have you found our missing Page Boy yet?", 500);
              } else {
                game.actor.say("Please take the map to help your search.", 500);
              }
            });
            break;
          case 'moai statue':
            if (flags[3]) {
              if (game.hasItem("magic ring")) {
                ego.say("They're ignorning me now.");
              } else {
                obj.say("We're hungry!");
              }
            } else {
              obj.say("Zzzzzzz...", 150, () => {
                ego.say("I think they're... asleep?");
              });
            }
            break;
          case 'family':
            game.actor.say("Happy Halloween!");
            break;
          case 'boy':
            game.actor.say("I used to be a Page Boy for the King.", 450, () => {
              game.actor.say("Then the goblin did something to me.", 500);
            });
            break;
          case 'goblin':
            game.actor.say("The Page Boy? Yes, I saw him.", 400, () => {
              game.actor.say("Told me some bad news, so I taught him a lesson.");
            });
            break;
          case 'sheep':
            e.target.parentNode.say("Baaaaa!");
            break;
          case 'cow':
            e.target.parentNode.say("Mooooo!");
            break;
          case 'office worker':
            if (game.hasItem('ticket')) {
              game.actor.say("Hello!");
            } else {
              game.actor.say("I've lost my briefcase!");
            }
            break;
          case 'self service':
            game.actor.say("Does not compute!");
            break;
          default:
            if (obj && obj == game.actor) {
              game.actor.say("Hello!");
            } else {
              speaker.say("It doesn't speak.");
            }
            break;
        }
        break;

      case 'Walk to':
        switch (thing) {
          case 'outside':
            while (obj && obj.nextElementSibling) {
              obj = obj.nextElementSibling;
              game.remove(obj.previousElementSibling);
            }
            game.remove(obj);
            game.actor = null;
            ego.setPosition(ego.x, ego.z-544);
            ego.show();
            game.inside = 0;
            game.thing = '';
            break;
          case 'left path':
          case 'right path': {
              let left = thing.includes('left');
              // TODO: This is a bit hacky. Would be nice if this method had the actual target sprite.
              let down = document.querySelectorAll('.down').length > 0; 
              let endY = (down? 1000 : 490);
              let endX = (left? (down? -70 : 70) : game.roomData[1] - (down? -70 : 70));
              let firstX = (left? (down? 100 : 20) : game.roomData[1] - (down? 100 : 20));              

              game.inputEnabled = false;
              ego.stop();

              // Walk to be in front of the path.
              ego.moveTo(firstX, 740);

              // Now walk through the path.
              ego.moveTo(endX, endY);
            }
            break;

          case 'woods':
            if (flags[4]) {
              if (game.hasItem('map')) {
                game.inputEnabled = false;
                ego.stop();
                ego.moveTo(210, 740);
                ego.moveTo(210, 640);
                ego.moveTo(70, 555);
                ego.moveTo(-50, 555);
              } else {
                ego.say("I might get lost in the woods. I need a map.");
              }
            } else {
              ego.say("The elephant blocks my way.");
            }
            break;

          case 'road':
            game.inputEnabled = false;
            ego.stop();
            ego.moveTo(game.screenLeft + (e.pageX / game.scaleX), 850);
            ego.moveTo(game.screenLeft + (e.pageX / game.scaleX), 1000);
            break;

          case 'castle path':
          case 'mountain':
            game.inputEnabled = false;
            ego.stop();
            ego.moveTo(3280, 740);
            ego.moveTo(3280, 400);
            break;

          default:
            // Walking into a building.
            if (obj && obj.propData && obj.propData[1] & 16) { 
              if ((thing == 'circus') && !game.hasItem('ticket')) {
                ego.say("I need a ticket.");
              }
              else if ((thing == 'coffin') && !game.hasItem('magic ring')) {
                ego.say("Magic is stopping me opening the coffin.");
              } 
              else {
                let props = game.props.filter(prop => prop[0] == obj.propData[10]);
                if (props.length) {
                  ego.stop(true);
                  ego.moveTo(ego.cx, 740, () => {
                    ego.moveTo(obj.cx, 740, () => {
                      let outsideX = Math.min(Math.max(obj.cx-200, 280), game.roomData[1] - 680);
                      // Add "outside" background
                      game.addPropToRoom([0, 14, 'outside', null, 6720, 485, 0, 970, , 1000]);
                      // Add "inside" background.
                      game.addPropToRoom([0, 14, 'inside', null, 400, 300, outsideX, 700, , 1001]);
                      // Add the items inside the building.
                      props.forEach(prop => game.addPropToRoom(prop));
                      ego.hide();
                      game.inside = 1;
                      ego.setPosition(ego.x, ego.z+544);
                    });
                  });
                } else {
                  ego.say("This building is locked.");
                }
              }
            } else {
              // Walk to screen object or screen click position.
              let z = ((e.pageY / game.scaleY) - 27) * 2;
              if (z <= 970) {
                if (!game.inside) {
                  ego.stop(true);
                  let destX = game.screenLeft + (e.pageX / game.scaleX);
                  destX = (destX > game.roomData[1] - 50? game.roomData[1] + 10 : destX < 50? -10 : destX);
                  ego.moveTo(destX, z > 710? z : 740);
                }
              } else {
                // Must be an item. Change command to Use
                game.verb = 'Use';
                newCommand = 'Use ' + thing + ' with ';
              }
            }
            break;
        }
        break;

      case 'Pick up':
        if (game.hasItem(thing)) {
          ego.say("I already have that.", 140);
        } else {
          switch (thing) {
            case 'jack-o-lantern':
              ego.say("No, I shouldn't.");
              break;
            default:
              // Is item in the current room?
              if (obj && obj.propData[1] & 1) {

                if (obj.propData[0] < 11) {
                  // Normal room, so walk to item and pick it up.
                  ego.moveTo(ego.cx, 740, () => ego.moveTo(obj.x, 740, pickup));
                } else {
                  // Inside room.
                  if (obj.propData[0] == 31 || obj.propData[0] == 28)  {
                    // In my house, castle and the hospital ego can pick the items without constraint.
                    pickup();
                  }
                  else if (thing == 'bellhop') {
                    if (game.actor) {
                      game.actor.say("Please leave that there.");
                    } else {
                      pickup();
                    }
                  }
                  else {
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
          case 'ticket':
            ego.say("It's a ticket for the circus.");
            break;
          case 'bank card':
            ego.say("It has my name on it.");
            break;
          case 'circus':
            ego.say("The circus is in town.");
            break;
          case 'road':
            ego.say("Maybe I should cross the road?");
            break;
          case 'halloween house':
          case 'jack-o-lantern':
            ego.say("Someone is celebrating Halloween.");
            break;
          case 'mailbox':
            ego.say("This is my mailbox.");
            break;
          case 'letter':
            ego.say("It's a commission from the King asking me to find his missing page boy.");
            break;
          case 'water pistol':
            ego.say(flags[2]? "It contains water." : "It is empty.");
            break;
          case 'shopping cart':
            ego.moveTo(ego.cx, 740, () => ego.moveTo(obj.cx, 740, () => {
              if (game.hasItem('water pistol')) {
                ego.say("Nothing in there.", 250);
              } else {
                ego.say("I found a water pistol.", 300);
                game.getItem('water pistol', '🔫');
              }
            }));
            break;
          case 'map':
            ego.say("It is a map of the woods. The entrance is to the left of the circus.");
            break;
          case 'chipmunk':
            ego.say("It's scaring the elephant.");
            break;
          case 'briefcase':
            ego.say("Someone forgot this briefcase at the bus stop.");
            break;
          case 'elephant':
            if (flags[4]) {
              ego.say("He looks happy now.");
            } else {
              ego.say("It's blocking the entrance to the woods.", 250, () => {
                if (flags[6]) {
                  ego.say("I need something to lure him away.");
                } else {
                  ego.say("I think it's afraid of the chipmunk.");
                }
              });
            }
            break;
          case 'feeding hole':
            ego.say("This is where the elephant feeds.");
            break;
          case 'castle':
            ego.say("The King's castle.");
            break;
          case 'my house':
            ego.say("This is where I live.");
            break;
          case 'tree':
          case 'trees':
            if ((game.room == 4) || (game.room == 7)) {
              ego.say("This might be the woods, but where is the entrance?");
            } else {
              ego.say("The trees make this town look very pretty.");
            }
            break;
          default:
            if (thing != "") {
              ego.say("It's just a " + thing + ".", 250);
            }
            break;
        }
        break;
      
      case 'Use':
        let useFn = () => {
          let thing1 = cmd.substring(4, cmd.indexOf(' with '));
          let things = [thing, thing1].sort().join();
          switch (things) {
            case 'bank,bank card':
              ego.say("The ATM is broken. I should go inside.");
              break;
            case 'rose,tulip':
              if (game.hasItem('rose') && game.hasItem('tulip')) {
                game.getItem('bouquet', '💐');
                game.dropItem('tulip');
                game.dropItem('rose');
                ego.say("I made a bouquet.");
              } else {
                ego.say("I should pick them both up first.", 200);
              }
              break;
            case 'fountain,water pistol':
              if (flags[2]) {
                ego.say("It's already full.", 200);
              } else {
                ego.say("The pistol now contains water.");
                flags[2] = 1;
              }
              break;
            case 'bouquet,bride':
              game.dropItem('bouquet');
              game.actor.say('Thanks. Take my lipstick.');
              game.getItem('lipstick');
              break;
            case 'briefcase,office worker':
              game.dropItem('briefcase');
              game.actor.say('Thanks. Take my circus ticket.');
              game.getItem('ticket');
              break;
            case 'clown,lipstick':
              game.dropItem('lipstick');
              game.actor.say("Thanks. Take my mask.");
              game.getItem('mask');
              break;
            case 'cash,salesperson':
              if (game.hasItem('syringe')) {
                game.actor.say("I have nothing to sell.");
              } else {
                game.actor.say("Here's your syringe.");
                game.getItem('syringe');
              }
              break;
            case 'cash,cashier':
              if (game.hasItem('banana')) {
                game.actor.say("I only have bananas to sell.");
              } else {
                game.actor.say("Here's your banana.");
                game.getItem('banana');
              }
              break;
            case 'bank card,cashier':
            case 'bank card,salesperson':
              game.actor.say("We only take cash.");
              break;
            case 'chipmunk,palm nut':
              game.dropItem('palm nut');
              ego.say("The chipmunk took the palm nut and ran away.");
              obj.propData[0] = -1;
              game.remove(obj);
              flags[6] = 1;
              break;
            case 'banana,feeding hole':
              let bananaProps = [ 4, 2, 'banana', '🍌', 30, 30, 1125, 640, , 651 ];
              game.dropItem('banana');
              game.props.push(bananaProps);
              game.addPropToRoom(bananaProps);
              flags[5] = 1;
              break;
            case 'candy,moai statue':
              if (flags[3]) { // Statues are awake.
                game.dropItem('candy');
                obj.say("Mmmm... yummy. Here, take this magic ring.");
                game.getItem('magic ring', '💍');
              } else {
                ego.say("They're asleep.");
              }
              break;
            case 'boy,syringe':
              if (game.hasItem('blood')) {
                game.actor.say("You already have my blood.");
              } else {
                game.actor.say("Sure, take my blood. Please find a cure.");
                game.dropItem('syringe');
                game.getItem('blood', '💉');
              }
              break;
            case 'blood,doctor':
              game.dropItem('blood');
              game.actor.say("Here, this is the cure.");
              game.getItem('pill', '💊');
              break;
            case 'bellhop,moai statue':
              if (flags[3]) {
                ego.say("They're already awake.");
              } else {
                ego.say("The bell sound woke them up.");
                flags[3] = 1;
              }
              break;
            case 'family,water pistol':
              if (game.hasItem('candy')) {
                ego.say("I already have candy.");
              } else if (flags[2]) {
                if (game.hasItem('mask')) {
                  game.actor.say("Here's some candy.");
                  game.getItem('candy');
                } else {
                  game.actor.say("You're not dressed up!");
                }
              } else {
                ego.say("It doesn't have water.");
              }
              break;
            case 'bank card,bank teller':
              if (game.hasItem('cash')) {
                ego.say("I already have enough cash.");
              } else {
                game.actor.say("Here's your cash.");
                game.getItem('cash');
              }
              break;
            case 'boy,pill':
              // End game sequence.
              game.inputEnabled = false;
              game.actor.say("An antidote? Really? Thank you so much!", 450, () => {
                game.actor.say("It tastes... strange...", 350, () => {
                  game.actor.say("I feel... something...", 350, () => {
                    game.actor.render('👦');
                    game.actor.say("I'm normal again!!", 300, () => {
                      game.room = 7;
                      ego.edge
                      game.fadeOut(game.wrap);
                      setTimeout(() => {
                        ego.setPosition(ego.x, ego.z-544);
                        game.inside = 0;
                        game.newRoom();
                        ego.say("I have returned the page boy to the castle.", 200, () => {
                          ego.say("Thank you for helping me to solve the case.", 200, () => {
                            ego.say("Well done!!!", 200, () => {
                              setTimeout(() => location.reload(), 3000);
                            });
                          });
                        });
                      }, 200);
                    });
                  });
                });
              });
              break;
            default:
              ego.say("Hmmm, that didn't work.");
              break;
          }
        }

        // Execute Use command for two objects, with movement when outside.
        if (game.inside || !obj) {
          useFn();
        } else {
          ego.moveTo(ego.cx, 740, () => ego.moveTo(obj.cx, 740, useFn));
        }

        newCommand = verb;
        break;

      default:
        ego.say("Nothing happened.", 220);
        break;
    }

    if (newCommand.endsWith('with ')) {
      game.verbIcon = game.inventory[thing].innerHTML;
      game.cursors[game.verbIcon] = `url(${Util.renderEmoji(game.verbIcon, 50, 50)[0].toDataURL()}) 25 25, auto`;
    }

    return newCommand;
  }

}
