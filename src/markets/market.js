import request from 'request';
import { resolve } from 'dns';

export default class Market {
  constructor(coins, coinKeys, fees, api) {
    this._coins = coins;
    this._coinKeys = coinKeys;
    this._fees = fees;
    this._priceAPI = api;

    this.prices = null;
  }

  async getPrices() {
    const body = await this.callAPI(this._priceAPI);
    const data = JSON.parse(body);
  };

  callAPI(url) {
    return new Promise((resolve, reject) => {
      request({ url }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      });
    });
  };

  getFee(name) {
    return this._fees[name];
  }

  calculateGapOfPremium(premiums) {
    let store = '';
    let coin1 = '';
    let coin2 = '';
    let max = 0;
    for (let market of Object.keys(premiums)) {
      const coinKeys = Object.keys(premiums[market]);
      for (let premium1 of coinKeys) {
        let base = premiums[market][premium1];
        for (let premium2 of coinKeys) {
          let target = premiums[market][premium2];
          let m = Math.abs(base - target);

          if (m > max) {
            store = market;
            coin1 = premium1;
            coin2 = premium2;
            max = m;
          }
        }
      }
    }

    return { store, a: coin1, b: coin2, premiumA: premiums[store][coin1], premiumB: premiums[store][coin2], gap: max };
  }
}