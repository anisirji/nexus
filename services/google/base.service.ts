export abstract class BaseGoogleService {
  protected initialized = false;
  
  abstract initialize(): Promise<void>;
  
  protected async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
      this.initialized = true;
    }
  }
}