export abstract class AlertManager {
  public static show(message: string): void {
    if (this.onMessage) {
      this.onMessage(message);
    }
  }

  public static onMessage?: (message: string) => void;
}
