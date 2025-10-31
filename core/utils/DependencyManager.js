export class DependencyManager {
  constructor() {
    this.dependencies = {};
  }

  register(name, dependency) {
    this.dependencies[name] = dependency;
  }

  get(name) {
    return this.dependencies[name];
  }
}
