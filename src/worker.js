import { setTimeout } from "timers";

export default class Worker {
  constructor(root) {
    this.id = (new Date()).getTime();
    root[this.id] = this;
  }

  do () {
    
  }
}