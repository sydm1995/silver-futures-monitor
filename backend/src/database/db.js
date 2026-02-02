// 内存数据存储（简化版，不使用SQLite）
class MemoryDB {
  constructor() {
    this.klines = [];
    this.ticks = [];
  }

  saveKline(kline) {
    this.klines.push(kline);
    // 限制存储数量
    if (this.klines.length > 1000) {
      this.klines = this.klines.slice(-500);
    }
  }

  saveTick(tick) {
    this.ticks.push(tick);
    // 限制存储数量
    if (this.ticks.length > 1000) {
      this.ticks = this.ticks.slice(-500);
    }
  }

  getKlines(period, limit = 500) {
    return this.klines
      .filter(k => k.period === period)
      .slice(-limit);
  }

  getTicks(limit = 100) {
    return this.ticks.slice(-limit);
  }

  close() {
    // 内存存储不需要关闭操作
  }
}

const db = new MemoryDB();

export default db;
