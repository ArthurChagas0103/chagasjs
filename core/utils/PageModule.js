export class PageModule {
  constructor() {
    this.initialized = false;
  }

  init() {
    this.initialized = true;
  }

  destroy() {
    this.initialized = false;
  }
}
