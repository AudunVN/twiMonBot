class RateLimit {
  /**
   * @param {number} limit
   * @param {number} [interval]
   */
  constructor(limit, interval) {
    this.limit = limit;
    this.interval = interval || 1000;

    this.queue = [];

    this.time = 0;
    this.count = 0;

    this.timerId = null;
  }

  _next() {
    if (this.timerId !== null) return;

    const now = Date.now();
    if (now - this.time >= this.interval) {
      this.time = now;
      this.count = 0;
    }

    while (this.queue.length && this.count < this.limit) {
      this.count++;
      this.queue.shift()();
    }

    if (this.count === this.limit) {
      this.timerId = setTimeout(() => {
        this.timerId = null;
        this._next();
      }, this.interval - (Date.now() - this.time));
    }
  }

  /**
   * @param {function} callback
   * @returns {function:Promise}
   */
  wrap(callback) {
    return (...args) => {
      return new Promise((resolve, reject) => {
        this.queue.push(() => {
          try {
            resolve(callback.apply(null, args));
          } catch (err) {
            reject(err);
          }
        });
        this._next();
      });
    };
  };
}

export default RateLimit;