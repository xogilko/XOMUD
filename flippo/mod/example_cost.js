const soundboard = {
          sounds: {
              pluh: new Audio('https://www.myinstants.com/media/sounds/pluh.mp3'),
              boom: new Audio('https://www.myinstants.com/media/sounds/vine-dramatic-boom-sound-effect.mp3'),
              disappear: new Audio('https://www.myinstants.com/media/sounds/disappear.mp3'),
          },
          playSound: function(soundName) {
              if (this.sounds[soundName]) {
                  this.sounds[soundName].play();
              } else {
                  console.log("Sound not found:", soundName);
              }
          }
};

// Play 'pluh' sound when event listeners are created
soundboard.playSound('pluh');

// Play 'boom' sound on every HTTP request
(function(open) {
    XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
        soundboard.playSound('boom');
        open.call(this, method, url, async, user, pass);
    };
})(XMLHttpRequest.prototype.open);
const originalFetch = window.fetch;
window.fetch = function(...args) {
    soundboard.playSound('boom');
    return originalFetch.apply(this, args);
};
// Play 'disappear' sound on window unload
window.addEventListener('unload', function() {
    soundboard.playSound('disappear');
});