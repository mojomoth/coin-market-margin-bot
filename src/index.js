import Worker from './worker';
import Finance from './finance';

// constant data
const TICK = 1000;
const MAX_WORKER = 1;

// data
let workerCount = 0;
let money = 1000000;
let workers = {};
let finance = new Finance();

// process
const proc = () => {
  // refresh data
  finance.getUSDKRW();
  console.log(finance.krw);

  // new worker
  if (workerCount < MAX_WORKER) {
    const worker = new Worker(workers);
    workerCount ++;
  }

  // do worker
  for (let key of Object.keys(workers)) {
    workers[key].do();
  }
};

// start
setInterval(proc, TICK);
