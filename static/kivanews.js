// kivanews.js

var Kivanews = function () {
  this.url = '/.netlify/functions/fetch_recent';
  this.lastTime = Date.now()-1000000;
  this.lastId = 0;
  this.news = [];
}

Kivanews.prototype.check = function () {
  let self = this;
  return new Promise((resolve, reject) => {
    if (self.news.length === 0) {
      // cache recent lending actions
      fetch(self.url)
      .then( resp => resp.json() )
      .then( data => {
        self.news = data;
        if (self.news.length === 0) {
          resolve(); // nothing found
          return;
        }
      })
      .catch((error) => {
        reject(error);
      });
    }
    // find the earliest item later than last time we checked.
    var nextItem = null;
    while(nextItem = self.news.pop()) {
      var nextTime = Date.parse(nextItem.date);
      var nextId = nextItem.id;
      if (nextTime >= self.lastTime && nextId != self.lastId){
        self.lastTime = nextTime;
        self.lastId = nextId;
        break; // once
      }
    }
    // return the found item (or null if none left).
    resolve(nextItem);
  })
}