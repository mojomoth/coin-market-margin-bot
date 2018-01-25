import request from 'request';
import { JSDOM } from 'jsdom';

export default class Finance {
  constructor() {
    this._krw = this.getUSDKRW();
  }

  get krw() {
    return this._krw;
  }

  async getUSDKRW() {
    try {
      const price = await new Promise((resolve, reject) => {
        request({ url: 'https://finance.google.com/finance/converter?a=1&from=USD&to=KRW' }, (error, response, body) => {
          if (!error && response.statusCode == 200) {
            const dom = new JSDOM(body);
            const text = dom.window.document.querySelector("span").textContent;
            const krw = text.split(" ")[0];
            resolve(krw);
          } else {
            reject(null);
          }
        });
      });

      return price;
    } catch (error) {  
      return error;
    }
  }
}