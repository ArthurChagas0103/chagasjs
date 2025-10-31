class ScriptLoader {
  constructor() {
    this.loadedScripts = new Map();
    this.loadingScripts = new Set();
  }

  /**
   * Carrega um script dinamicamente
   * @param {string} src - URL do script
   * @param {string} type - Tipo do script
   * @param {object} [options] - Opções de carregamento
   * @param {boolean} [options.force=false] - Forçar recarregamento mesmo se já carregado
   * @returns {Promise<void>}
   */
  load(src, type, { force = false } = {}) {
    return new Promise((resolve, reject) => {
      if (!force && this.loadedScripts.has(src)) {
        resolve();

        return;
      }

      if (this.loadingScripts.has(src)) {
        const waitForLoad = () => {
          setTimeout(() => {
            if (this.loadedScripts.has(src)) {
              resolve();
            } else {
              waitForLoad();
            }
          }, 50);
        };

        waitForLoad();

        return;
      }

      this.loadingScripts.add(src);

      const script = document.createElement("script");

      script.src = src;
      script.async = true;

      if (type === "module") {
        script.type = "module";
      }

      script.onload = () => {
        this.loadedScripts.set(src, true);
        this.loadingScripts.delete(src);
        resolve();
      };

      script.onerror = () => {
        this.loadingScripts.delete(src);
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.body.appendChild(script);
    });
  }

  /**
   * Remove um script carregado
   * @param {string} src - URL do script
   */
  unload(src) {
    document.querySelectorAll(`script[src="${src}"]`).forEach((script) => {
      script.remove();
    });

    this.loadedScripts.delete(src);
    this.loadingScripts.delete(src);
  }

  /**
   * Carrega múltiplos scripts em ordem
   * @param {string[]} scripts - Array de URLs
   * @returns {Promise<void[]>}
   */
  loadAll(scripts, type) {
    return Promise.all(scripts.map((src) => this.load(src, type)));
  }
}

export const scriptLoader = new ScriptLoader();
