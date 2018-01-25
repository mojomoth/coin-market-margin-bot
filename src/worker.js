import { setTimeout } from "timers";
import Bithumb from "./markets/bithumb";
import GateIO from "./markets/gateio";

export const STATUS = {
  REQUEST_BUY_BASE_COIN: 'REQUEST_BUY_BASE_COIN',
  PENDING_BUY_BASE_COIN: 'PENDING_BUY_BASE_COIN',
  COMPLETE_BUY_BASE_COIN: 'COMPLETE_BUY_BASE_COIN',
  REQUEST_TRANSFER_BASE_COIN: 'REQUEST_TRANSFER_BASE_COIN',
  PENDING_TRANSFER_BASE_COIN: 'PENDING_TRANSFER_BASE_COIN',
  COMPLETE_TRANSFER_BASE_COIN: 'COMPLETE_TRANSFER_BASE_COIN',
  REQUEST_SELL_BASE_COIN: 'REQUEST_SELL_BASE_COIN',
  PENDING_SELL_BASE_COIN: 'PENDING_SELL_BASE_COIN',
  COMPLETE_SELL_BASE_COIN: 'COMPLETE_SELL_BASE_COIN',
  REQUEST_BUY_TARGET_COIN: 'REQUEST_BUY_TARGET_COIN',
  PENDING_BUY_TARGET_COIN: 'PENDING_BUY_TARGET_COIN',
  COMPLETE_BUY_TARGET_COIN: 'COMPLETE_BUY_TARGET_COIN',
  REQUEST_TRANSFER_TARGET_COIN: 'REQUEST_TRANSFER_TARGET_COIN',
  PENDING_TRANSFER_TARGET_COIN: 'PENDING_TRANSFER_TARGET_COIN',
  COMPLETE_TRANSFER_TARGET_COIN: 'COMPLETE_TRANSFER_TARGET_COIN',
  REQUEST_SELL_TARGET_COIN: 'REQUEST_SELL_TARGET_COIN',
  PENDING_SELL_TARGET_COIN: 'PENDING_SELL_TARGET_COIN',
  COMPLETE_SELL_TARGET_COIN: 'COMPLETE_SELL_TARGET_COIN',
  START_WORK: 'START_WORK',
  END_WORK: 'END_WORK',
};

const MIN_EARN_KRW = 1000;
const MIN_PREMIUM_GAP = 0.015;

const TEST = {
  BUY_BASE_COIN_TIME: 1000,
  TRANSFER_BASE_COIN_TIME: 5 * 60 * 1000,
  SELL_BASE_COIN_TIME: 5000,
  BUY_TARGET_COIN_TIME: 1000,
  TRANSFER_TARGET_COIN_TIME: 5 * 60 * 1000,
  SELL_TARGET_COIN_TIME: 5000,
  // BUY_BASE_COIN_TIME: 5000,
  // TRANSFER_BASE_COIN_TIME: 60 * 60 * 1000,
  // SELL_BASE_COIN_TIME: 10000,
  // BUY_TARGET_COIN_TIME: 5000,
  // TRANSFER_TARGET_COIN_TIME: 60 * 60 * 1000,
  // SELL_TARGET_COIN_TIME: 10000,
  // BUY_BASE_COIN_TIME: 1000,
  // TRANSFER_BASE_COIN_TIME: 1000,
  // SELL_BASE_COIN_TIME: 1000,
  // BUY_TARGET_COIN_TIME: 1000,
  // TRANSFER_TARGET_COIN_TIME: 1000,
  // SELL_TARGET_COIN_TIME: 1000,
  DO: (worker, after, time) => setTimeout(() => { worker._status = after }, time),
};

export default class Worker {
  constructor(root, bot, markets) {
    this._id = (new Date()).getTime();

    this._root = root;
    this._bot = bot;
    this._markets = markets;

    this._status = STATUS.START_WORK;
    this._baseCoin = {};
    this._targetCoin = {};
    this._spendMoney = 0;
    this._transferAmount = 0;
    this._earnUSD = 0;
    this._spendUSD = 0;
    this._backAmount = 0;
    this._earnMoney = 0;
    this._targetMarket = null;

    console.log("[Create Worker]");
  }

  get id() {
    return this._id;
  }

  get status() {
    return this._status;
  }

  floorCoin(n, pos) {
    let digits = Math.pow(10, pos);
    let num = Math.floor(n * digits) / digits;
    return num.toFixed(pos);
  }

  testCoin(gap) {
    const bithumb = this._markets[Bithumb.MARKET_NAME];
    const coinName = gap.premiumA < gap.premiumB ? gap.a : gap.b;
    const coinCost = bithumb.prices[coinName];
    const coinPremium = gap.premiumA < gap.premiumB ? gap.premiumA : gap.premiumB;

    // test
    const coinAmount = this.getCoinAmount(this._bot.money, coinCost);
    this._baseCoin['name'] = coinName;
    this._baseCoin['premium'] = coinPremium;
    this._baseCoin['amount'] = coinAmount;
    this._targetMarket = gap.store;

    const spendMoney = coinAmount * coinCost;

    ////////////////////////// test /////////////////////////////
    const targetName = gap.premiumA > gap.premiumB ? gap.a : gap.b;
    const sendCost = this._markets[gap.store].prices[coinName];
    const targetCost = this._markets[gap.store].prices[targetName];
    const transferAmount = coinAmount - bithumb.getFee(coinName);
    const getUSD = this.floorCoin((transferAmount * sendCost), 2);
    const getAmount = this.floorCoin((getUSD / targetCost), 4);
    const backAmount = getAmount - this._markets[gap.store].getFee(targetName);
    const getKRW = Math.floor(backAmount * bithumb.prices[targetName]);
    const earnKRW = getKRW - spendMoney;
    ////////////////////////// test /////////////////////////////

    // this._baseCoin[amount] = gap;
    console.log('---------------------------')
    console.log('coinName : ' + coinName + ' / ' + targetName);
    console.log('coinCost : ' + coinCost + ' ' + sendCost + ' / ' + bithumb.prices[targetName] + ' ' + targetCost);
    console.log('coinAmount : ' + coinAmount);
    console.log('spendMoney : ' + spendMoney);
    console.log('transferAmount : ' + transferAmount);
    console.log('getUSD : ' + getUSD);
    console.log('getAmount : ' + getAmount);
    console.log('backAmount : ' + backAmount);
    console.log('backCost : ' + bithumb.prices[targetName]);
    console.log('getKRW : ' + getKRW);
    console.log('earnKRW : ' + earnKRW);
    console.log(gap);
    console.log('---------------------------')

    return earnKRW;
  }

  getCoinMoney(marketName, coinName, coinAmount) {
    const market = this._markets[marketName];
    const coinCost = market.prices[coinName];
    const money = coinCost * coinAmount;

    return money;
  }

  getCoinAmount(money, coinCost) {
    let coinAmount = money / coinCost;
    coinAmount = this.floorCoin(coinAmount, 4);

    let spendMoney = Math.floor(coinAmount * coinCost);
    coinAmount = spendMoney / coinCost;
    coinAmount = this.floorCoin(coinAmount, 4);

    return coinAmount;
  }

  getTransferAmount(marketName, coinName, coinAmount) {
    const bithumb = this._markets[marketName];
    const transferAmount = coinAmount - bithumb.getFee(coinName);

    return transferAmount;
  }

  testPremiumGap(premium) {
    let maxPremium = { max: 0, name: '', gap: 0 };
    for (let key of Object.keys(premium[this._targetMarket])) {
      let p = premium[this._targetMarket][key];

      if (p > maxPremium.max) {
        maxPremium.max = p;
        maxPremium.name = key;
      }
    }

    // test
    const coinCost = this._markets[this._targetMarket].prices[maxPremium.name];
    this._targetCoin['name'] = maxPremium.name;
    this._targetCoin['premium'] = maxPremium.max;
    this._targetCoin['amount'] = this.getCoinAmount(this._earnUSD, coinCost)

    let gap = parseFloat(maxPremium.max - this._baseCoin['premium']);
    maxPremium.gap = gap;

    return maxPremium;
  }

  async do() {
    let premium = null;
    let gap = null;
    let premiumGap = 0;
    switch (this.status) {
      case STATUS.REQUEST_BUY_BASE_COIN:
        console.log("> Request Buy Base Coin");
        this._status = STATUS.PENDING_BUY_BASE_COIN;
        premium = await this._root.refreshMarket();

        gap = this._root.refreshGap(premium);

        // check erarn
        let earnKRW = this.testCoin(gap);

        if (earnKRW < MIN_EARN_KRW) {
          // protect
          this._status = STATUS.REQUEST_BUY_BASE_COIN;
        } else {
          // action
          TEST.DO(this, STATUS.COMPLETE_BUY_BASE_COIN, TEST.BUY_BASE_COIN_TIME);
        }
        break;
      case STATUS.COMPLETE_BUY_BASE_COIN:
        this._status = STATUS.REQUEST_TRANSFER_BASE_COIN;

        // buy action
        this._spendMoney = this.getCoinMoney(Bithumb.MARKET_NAME, this._baseCoin['name'], this._baseCoin['amount']);
        this._bot.money -= this._spendMoney;

        console.log("> Complete Buy Base Coin");
        break;
      case STATUS.REQUEST_TRANSFER_BASE_COIN:
        this._status = STATUS.PENDING_TRANSFER_BASE_COIN;

        TEST.DO(this, STATUS.COMPLETE_TRANSFER_BASE_COIN, TEST.TRANSFER_BASE_COIN_TIME);
        break;
      case STATUS.COMPLETE_TRANSFER_BASE_COIN:
        this._status = STATUS.REQUEST_SELL_BASE_COIN;

        // transfer action
        this._transferAmount = this.getTransferAmount(Bithumb.MARKET_NAME, this._baseCoin['name'], this._baseCoin['amount']);

        console.log("> Complete Transfer Base Coin");
        break;
      case STATUS.REQUEST_SELL_BASE_COIN:
        console.log("> Request Transfer Base Coin");
        this._status = STATUS.PENDING_SELL_BASE_COIN;

        // action
        TEST.DO(this, STATUS.COMPLETE_SELL_BASE_COIN, TEST.SELL_BASE_COIN_TIME);

        break;
      case STATUS.COMPLETE_SELL_BASE_COIN:
        this._status = STATUS.REQUEST_BUY_TARGET_COIN;

        this._earnUSD = this.getCoinMoney(this._targetMarket, this._baseCoin['name'], this._transferAmount);

        console.log("> Complete Sell Base Coin");
        break;
      case STATUS.REQUEST_BUY_TARGET_COIN:
        this._status = STATUS.PENDING_BUY_TARGET_COIN;

        premium = await this._root.refreshMarket();

        premium = this.testPremiumGap(premium)

        if (premium.gap < MIN_PREMIUM_GAP) {
          console.log(premium.gap + ' ' + MIN_PREMIUM_GAP);
          // protect
          this._status = STATUS.REQUEST_BUY_TARGET_COIN;
        } else {
          // action
          TEST.DO(this, STATUS.COMPLETE_BUY_TARGET_COIN, TEST.BUY_TARGET_COIN_TIME);
        }
        break;
      case STATUS.COMPLETE_BUY_TARGET_COIN:
        this._status = STATUS.REQUEST_TRANSFER_TARGET_COIN;

        this._spendUSD = this.getCoinMoney(this._targetMarket, this._targetCoin['name'], this._earnUSD);

        console.log("> Complete Buy Target Coin");
        break;
      case STATUS.REQUEST_TRANSFER_TARGET_COIN:
        this._status = STATUS.PENDING_TRANSFER_TARGET_COIN;

        TEST.DO(this, STATUS.COMPLETE_TRANSFER_TARGET_COIN, TEST.TRANSFER_TARGET_COIN_TIME);
        break;
      case STATUS.COMPLETE_TRANSFER_TARGET_COIN:
        this._status = STATUS.REQUEST_SELL_TARGET_COIN;

        // transfer action
        this._backAmount = this.getTransferAmount(this._targetMarket, this._targetCoin['name'], this._targetCoin['amount']);

        console.log("> Complete Transfer Target Coin");
        break;
      case STATUS.REQUEST_SELL_TARGET_COIN:
        this._status = STATUS.PENDING_SELL_TARGET_COIN;

        premium = await this._root.refreshMarket();

        this._earnMoney = this.getCoinMoney(Bithumb.MARKET_NAME, this._targetCoin['name'], this._backAmount);

        this._bot.money += this._earnMoney;

        // action
        TEST.DO(this, STATUS.COMPLETE_SELL_TARGET_COIN, TEST.SELL_TARGET_COIN_TIME);

        break;
      case STATUS.COMPLETE_SELL_TARGET_COIN:
        this._status = STATUS.END_WORK;
        console.log("> Complete Sell Target Coin === " + this._bot.money);
        break;
      case STATUS.START_WORK:
        this._status = STATUS.REQUEST_BUY_BASE_COIN;
        // this._status = STATUS.REQUEST_TRANSFER_TARGET_COIN;
        break;
      case STATUS.END_WORK:
        this._root.deleteWorker(this);
        break;
      default:
        return;
    }
  }

  rollback() {
    switch(this._status) {
      case STATUS.PENDING_BUY_BASE_COIN: 
        this._status = STATUS.REQUEST_BUY_BASE_COIN;
        break;
      case STATUS.PENDING_TRANSFER_BASE_COIN:
        this._status = STATUS.REQUEST_TRANSFER_BASE_COIN;
        break;
      case STATUS.PENDING_SELL_BASE_COIN:
        this._status = STATUS.REQUEST_SELL_BASE_COIN;
        break;
      case STATUS.PENDING_BUY_TARGET_COIN:
        this._status = STATUS.REQUEST_BUY_TARGET_COIN;
        break;
      case STATUS.PENDING_TRANSFER_TARGET_COIN:
        this._status = STATUS.REQUEST_TRANSFER_TARGET_COIN;
        break;
      case STATUS.PENDING_SELL_TARGET_COIN: 
        this._status = STATUS.REQUEST_SELL_TARGET_COIN;
        break;
      default:
        break;
    }
  }
}