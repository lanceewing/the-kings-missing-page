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
                game.actor.say("Have you found our missing Page Boy yet?", 550);
              } else {
                game.actor.say("Please take the map to help your search.", 550);
              }
            });
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
              let endX = (left? (down? 20 : 200) : game.roomData[1] - (down? 70 : 200));
              let firstX = (left? (down? 150 : 20) : game.roomData[1] - (down? 200 : 70));              

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
              if (game.hasItem('compass') && game.hasItem('map')) {
                game.inputEnabled = false;
                ego.stop();
                ego.moveTo(210, 740);
                ego.moveTo(210, 640);
                ego.moveTo(70, 550);
                ego.moveTo(-50, 550);
              } else {
                ego.say("I might get lost in the woods. I need a map and compass.");
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
              else if ((thing == 'coffin') && !game.hasItem('amulet')) {
                ego.say("Magic is stopping me opening the coffin.");
              } 
              else {
                let props = game.props.filter(prop => prop[0] == obj.propData[10]);
                if (props.length) {
                  ego.moveTo(ego.cx, 740, () => {
                    ego.moveTo(obj.cx, 740, () => {
                      // Add "outside" background
                      game.addPropToRoom([0, 14, 'outside', null, 6720, 485, 0, 970, , 1000]);
                      // Add "inside" background.
                      game.addPropToRoom([0, 14, 'inside', null, 400, 300, obj.cx-200, 700, , 1001]);
                      // Add the items inside the building.
                      props.forEach(prop => game.addPropToRoom(prop));
                      ego.hide();
                      game.inside = 1;
                    });
                  });
                } else {
                  ego.say("There's no one home.");
                }
              }
            } else {
              // Walk to screen object or screen click position.
              if (((e.target == game.screen) || obj) && !game.inside) {
                let z = ((e.pageY / game.scaleY) - 27) * 2;
                ego.stop(true);
                ego.moveTo(game.screenLeft + (e.pageX / game.scaleX), z > 710? z : 740);
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
            default:
              // Is item in the current room?
              if (obj && obj.propData[1] & 1) {

                if (obj.propData[0] < 11) {
                  // Normal room, so walk to item and pick it up.
                  ego.moveTo(ego.cx, 740, () => ego.moveTo(obj.x, 740, pickup));
                } else {
                  // Inside room.
                  if (obj.propData[0] == 12 || obj.propData[0] == 31 || obj.propData[0] == 28)  {
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
          case 'envelope':
            if (game.hasItem('letter')) {
              ego.say("It's empty.", 200);
            } else {
              ego.say("Letter inside.", 200);
              game.getItem('letter', '📄');
            }
            break;
          case 'letter':
            if (game.hasItem('paperclip')) {
              ego.say("It's a commission from the King asking you to find his missing page boy.", 300);
            } else {
              ego.say("Has paper clip.", 200);
              game.getItem('paperclip', '📎');
            }
            break;
          case 'wastebasket':
            if (game.hasItem('syringe')) {
              ego.say("It's empty.");
            } else {
              ego.say("Syringe is inside.");
              game.getItem('syringe', '💉');
            }
            break;
          case 'shopping cart':
            if (game.hasItem('water pistol')) {
              ego.say("Nothing in there.", 250);
            } else {
              ego.say("I found a water pistol.", 300);
              game.getItem('water pistol', '🔫');
            }
            break;
          case 'map':
            ego.say("It is a map of the woods. The entrance is to the left of the circus.");
            break;
          case 'chipmunk':
            ego.say("It's scaring the elephant.");
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
          default:
            if (thing != "") {
              ego.say("It's just a " + thing + ".", 250);
            }
            break;
        }
        break;
      
      case 'Use':
        if (cmd == verb) {
          // Using items will add the ' with ' word to the sentence.
          if (game.hasItem(thing)) {
            newCommand = 'Use ' + thing + ' with ';
          } else {
            switch (thing) {
              case 'mailbox':
                if (flags[1]) {
                  // Mailbox open.
                  if (game.hasItem('envelope')) {
                    // No letter inside, so close it.
                    obj.render('📪');
                    flags[1] = 0;
                  } else {
                    // Letter inside, so take it.
                    obj.render('📭');
                    game.getItem('envelope', '✉');
                  }
                } else {
                  // Mailbox closed. Use will open it.
                  obj.render(flags[2]? '📭' : '📬');
                  flags[1] = 1;
                }
                break;
              case 'bellhop':
                if (!game.actor) {
                  game.addPropToRoom([ 19, 0, 'hotel_clerk', '🤵', 200, 150, 3260, 450, , 1002 ]);
                  game.actor.say("Can I help you?");
                } else {
                  game.actor.say("I'm already here.");
                }
                break;
              default:
                ego.say("I can't use that.", 250);
                break;
            }
          }
        } else {
          // If verb doesn't equal cmd, it means that it is a scenario where an item
          // is being used with something.
          let useFn = () => {
            let thing1 = cmd.substring(4, cmd.indexOf(' with '));
            let things = [thing, thing1].sort().join();
            switch (things) {
              case 'rose,tulip':
                if (game.hasItem('rose') && game.hasItem('tulip')) {
                  game.getItem('bouquet', '💐');
                  game.dropItem('tulip');
                  game.dropItem('rose');
                } else {
                  ego.say("I should pick them both up first.", 200);
                }
                break;
              case 'fountain,water pistol':
                if (flags[2]) {
                  ego.say("It's already full.", 200);
                } else {
                  ego.say("OK", 70);
                  flags[2] = 1;
                }
                break;
              case 'bouquet,bride':
                game.dropItem('bouquet');
                game.actor.say('Thanks. Take my lipstick.', 250);
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
                if (game.hasItem('compass')) {
                  game.actor.say("I have nothing to sell.");
                } else {
                  game.actor.say("Here's your compass.");
                  game.getItem('compass');
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
              case 'chipmunk,coconut':
                game.dropItem('coconut');
                ego.say("The chipmunk took the coconut and ran away.");
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
                  obj.say("Mmmm... yummy. Here, take this amulet.");
                  game.getItem('amulet', '🧿');
                } else {
                  ego.say("They're asleep.");
                }
                break;
              case 'syringe,vampire':
                if (game.hasItem('blood')) {
                  actor.say("You already have my blood.");
                } else {
                  game.getItem('blood');
                }
                break;
              case 'blood,scientist':
                game.dropItem('blood');
                game.actor.say("Here, this is the cure.");
                game.getItem('test tube', '🧪');
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
              case 'test tube,vampire':
                // End game sequence.
                game.inputEnabled = false;
                actor.say("An antidote? Really? Thank you so much!", 200, () => {
                  actor.say("It tastes... strange...", 200, () => {
                    actor.say("I feel... something...", 200, () => {
                      actor.render('👦');
                      actor.say("I'm normal again!!", 200, () => {
                        game.room = 7;
                        ego.edge
                        game.fadeOut(game.wrap);
                        setTimeout(() => {
                          game.newRoom();
                          ego.say("I have returned the page boy to the castle.", 200, () => {
                            ego.say("Thank you for helping me to solve the case.", 200, () => {
                              ego.say("Well done!!!", 200, () => {
                                game.gameOver("You've Won!!");
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
          if (game.inside) {
            useFn();
          } else {
            ego.moveTo(ego.cx, 740, () => ego.moveTo(obj.cx, 740, useFn));
          }

          newCommand = verb;
        }
        break;

      default:
        ego.say("Nothing happened.", 220);
        break;
    }

    return newCommand;
  }

}
