function promisify(fn) {
    return function promiseFn() {
      return new Promise((resolve, reject) => {
        function callback(err, ...res) {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        }
        fn.call(this, ...arguments, callback);
      });
    };
  }
  
  module.exports = promisify;
  