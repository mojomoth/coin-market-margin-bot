import Worker from './worker';
import Finance from './finance';
import Bithumb from './markets/bithumb';
import GateIO from './markets/gateio';
import Binance from './markets/binance';

// constant data
const TICK = 1000;
const MAX_WORKER = 1;
const COINS = ['ETH', 'ETC', 'XRP', 'QTUM', 'DASH', 'LTC', 'ZEC', 'BCH', 'BTC'];

class Bot {
  constructor() {
    this.money = 2000000;

    // data
    this.workerCount = 0;
    this.workers = {};
    this.markets = {};
    this.finance = new Finance();

    // api
    let bithumb = new Bithumb(COINS);
    let gateio = new GateIO(COINS);
    let binance = new Binance(COINS);

    // bind map
    this.markets[Bithumb.MARKET_NAME] = bithumb;
    this.markets[GateIO.MARKET_NAME] = gateio;
    this.markets[Binance.MARKET_NAME] = binance;
  }

  createWorker() {
    const worker = new Worker(this, bot, this.markets);
    this.workers[worker.id] = worker;
    this.workerCount ++;
  }

  deleteWorker(worker) {
    delete this.workers[worker.id];
    this.workerCount --;
  }

  async refreshMarket() {
    // refresh krw
    const krw = await this.finance.getUSDKRW();

    // market
    const bithumb = this.markets[Bithumb.MARKET_NAME];
    const gateio = this.markets[GateIO.MARKET_NAME];
    const binance = this.markets[Binance.MARKET_NAME];

    // refresh prices
    const bithumbPrices = await bithumb.getPrices();
    const gateioPrices = await gateio.getPrices();
    const binancePrices = await binance.getPrices();

    // assign
    bithumb.prices = bithumbPrices;
    gateio.prices = gateioPrices;
    binance.prices = binancePrices;

    // refresh premiums
    const premiums = bithumb.calculatePremium(krw, bithumbPrices, { name: GateIO.MARKET_NAME, prices: gateioPrices }, { name: Binance.MARKET_NAME, prices: binancePrices });

    return premiums;
  }

  refreshGap(premiums) {
    const bithumb = this.markets[Bithumb.MARKET_NAME];
    const gap = bithumb.calculateGapOfPremium(premiums);
    
    return gap;
  }
}

// create bot
const bot = new Bot();

// process
const proc = async () => {
  // new worker
  if (bot.workerCount < MAX_WORKER) {
    bot.createWorker();
  }

  // do worker
  const workers = bot.workers;
  for (let key of Object.keys(workers)) {
    try {
      await workers[key].do();
    } catch (e) {
      console.log(e.toString());
      workers[key].rollback();
    }
  }
};

// start
setInterval(proc, TICK);
