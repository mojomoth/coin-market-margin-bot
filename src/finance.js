import request from 'request';
import { JSDOM } from 'jsdom';

export default class Finance {
  constructor() {
    this.getUSDKRW();
    this.krw = 0;
  }

  getUSDKRW() {
    const options = {
      url: 'https://finance.google.com/finance/converter?a=1&from=USD&to=KRW'
    };

    request(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const dom = new JSDOM(body);
        const text = dom.window.document.querySelector("span").textContent;
        this.krw = text.split(" ")[0];
      }
    });
  }
}