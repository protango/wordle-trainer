export class PerfMonitor {
  private readonly reportEvery = 5000;
  private processedSinceLastReport = 0;
  private lastReportTime = Date.now();
  // private interval: NodeJS.Timeout;
  public processed = 0;

  constructor(public items: number) {
    /*
    this.interval = setInterval(() => {
      if (!this.processedSinceLastReport) {
        return;
      }
      const elapsed = Date.now() - this.lastReportTime;
      const rate = this.processedSinceLastReport / elapsed;
      const remaining = (this.items - this.processed) / rate / 1000;
      console.log(
        `${this.processed} items processed in ${elapsed} ms, ${rate} items/ms. Estimated time remaining: ${remaining} sec.`
      );
      this.processedSinceLastReport = 0;
      this.lastReportTime = Date.now();
    }, this.reportEvery);
    */
  }

  public doneOne(): void {
    this.processed++;
    this.processedSinceLastReport++;
    /*
    if (this.processed === this.items) {
      clearInterval(this.interval);
    }
    */
    const elapsed = Date.now() - this.lastReportTime;
    if (elapsed >= this.reportEvery) {
      const rate = this.processedSinceLastReport / (elapsed / 1000);
      const remaining = (this.items - this.processed) / rate;
      console.log(
        `${this.processed} items processed in ${
          elapsed / 1000
        }sec, ${rate} items/sec. Estimated time remaining: ${remaining} sec.`
      );
      this.processedSinceLastReport = 0;
      this.lastReportTime = Date.now();
    }
  }
}
