import Market from "./market";

const PRICES_API = 'https://api.bithumb.com/public/ticker/ALL';
const COIN_KEYS = {
  ETH: 'ETH',
  ETC: 'ETC',
  XRP: 'XRP',
  QTUM: 'QTUM',
  DASH: 'DASH',
  LTC: 'LTC',
  ZEC: 'ZEC',
  BCH: 'BCH',
  BTC: 'BTC'
};
const COIN_FEES = {
  ETH: 0.01,
  ETC: 0.01,
  XRP: 1,
  QTUM: 0.05,
  DASH: 0.01,
  LTC: 0.01,
  ZEC: 0.001,
  BCH: 0.005,
  BTC: 0.003
};
const COIN_STATUS = {
  ETH: true,
  ETC: true,
  XRP: true,
  QTUM: true,
  DASH: true,
  LTC: true,
  ZEC: true,
  BCH: true,
  BTC: true,
};

export default class Bithumb extends Market {
  static get MARKET_NAME() { return "Bithumb"; }

  constructor(coins) {
    super(coins, COIN_KEYS, COIN_FEES, PRICES_API)
  }

  async getPrices() {
    const prices = {};
    const body = await this.callAPI(this._priceAPI);
    const json = JSON.parse(body);
    for (let coin of this._coins) {
      const key = this._coinKeys[coin];
      // closing_price	최근 24시간 내 마지막 거래금액
      // buy_price	거래 대기건 최고 구매가
      // sell_price	거래 대기건 최소 판매가
      const price = parseFloat(json.data[key].sell_price);
      if (COIN_STATUS[coin]) {
        prices[coin] = price;
      }
    }

    return prices;
  };

  calculatePremium(krw, basePrices, ...markets) {
    const premiums = {};
    for (let market of markets) {
      premiums[market.name] = {};
      for (let priceKey of Object.keys(market.prices)) {
        const premium = basePrices[priceKey] / (market.prices[priceKey] * krw) - 1;
        premiums[market.name][priceKey] = premium;
      }
    }

    return premiums;
  }
}