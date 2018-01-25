import Market from "./market";

const PRICES_API = 'https://api.binance.com/api/v1/ticker/allPrices';
const COIN_KEYS = { 
  ETH: 'ETHBTC', 
  ETC: 'ETCBTC', 
  XRP: 'XRPBTC', 
  QTUM: 'QTUMBTC', 
  DASH: 'DASHBTC', 
  LTC: 'LTCBTC', 
  ZEC: 'ZECBTC', 
  BCH: 'BCHBTC', 
  BTC: 'BTCUSDT' 
};
const COIN_FEES = { 
  ETH: 0.01, 
  ETC: 0.01, 
  XRP: 0.25, 
  QTUM: 0.01, 
  DASH: 0.002, 
  LTC: 0.01, 
  ZEC: 0.005, 
  BCH: -1, 
  BTC: 0.005
};
const COIN_STATUS = { 
  ETH: true,
  ETC: true, 
  XRP: true,
  QTUM: true,
  DASH: true,
  LTC: true,
  ZEC: true, 
  BCH: false,
  BTC: true,
};

export default class Binance extends Market {
  static get MARKET_NAME() {  return "Binance"; }

  constructor(coins) {
    super(coins, COIN_KEYS, COIN_FEES, PRICES_API)
  }

  async getPrices(usdkrw = null) {
    const prices = {};
    const body = await this.callAPI(this._priceAPI);
    

    const json = JSON.parse(body);
    const datas = {};
    
    for (let data of json) {
      datas[data.symbol] = data.price;
    }

    for (let coin of this._coins) {
      const key = this._coinKeys[coin];
      let price = parseFloat(datas[key]);

      if (datas[key] && COIN_STATUS[coin]) {
        prices[coin] = price;
      }
    }
    
    // BTC => USD
    for (let key of Object.keys(prices)) {
      if (key == 'BTC') continue;
      
      prices[key] *= prices['BTC'];
    }

    // USD => KRW
    if (usdkrw) {
      for (let key of Object.keys(prices)) {
        prices[key] *= usdkrw;
      }
    }

    return prices;
  };
}