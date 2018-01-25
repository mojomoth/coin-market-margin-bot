import Market from "./market";

const PRICES_API = 'http://data.gate.io/api2/1/tickers';
const COIN_KEYS = { 
  ETH: 'eth_usdt', 
  ETC: 'etc_usdt', 
  XRP: 'xrp_usdt', 
  QTUM: 'qtum_usdt', 
  DASH: 'dash_usdt', 
  LTC: 'ltc_usdt', 
  ZEC: 'zec_usdt', 
  BCH: 'bch_usdt', 
  BTC: 'btc_usdt' 
};
const COIN_FEES = { 
  ETH: 0.003, 
  ETC: 0.01, 
  XRP: 0.01, 
  QTUM: 0.1, 
  DASH: 0.02, 
  LTC: 0.002, 
  ZEC: 0.001, 
  BCH: 0.0006, 
  BTC: 0.002
};
const COIN_STATUS = { 
  ETH: true,
  ETC: true, 
  XRP: false,
  QTUM: true,
  DASH: true,
  LTC: true,
  ZEC: true, 
  BCH: true,
  BTC: true,
};

export default class GateIO extends Market {
  static get MARKET_NAME() {  return "GateIO"; }

  constructor(coins) {
    super(coins, COIN_KEYS, COIN_FEES, PRICES_API)
  }

  async getPrices(usdkrw = null) {
    const prices = {};
    const body = await this.callAPI(this._priceAPI);
    const json = JSON.parse(body);
    for (let coin of this._coins) {
      const key = this._coinKeys[coin];
      let price = parseFloat(json[key].last);

      // USD => KRW
      if (usdkrw) {
        price *= usdkrw;
      }

      if (COIN_STATUS[coin]) {
        prices[coin] = price;
      }
    }

    return prices;
  };
}