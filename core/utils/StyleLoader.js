class StyleLoader {
  constructor() {
    this.loadedStyles = new Map();
    this.loadingStyles = new Set();
  }

  /**
   * Carrega um arquivo CSS dinamicamente
   * @param {string} href - URL do CSS
   * @param {object} [options] - Opções de carregamento
   * @param {boolean} [options.force=false] - Forçar recarregamento mesmo se já carregado
   * @returns {Promise<void>}
   */
  load(href, { force = false } = {}) {
    return new Promise((resolve, reject) => {
      if (!force && this.loadedStyles.has(href)) {
        resolve();

        return;
      }

      if (this.loadingStyles.has(href)) {
        const waitForLoad = () => {
          setTimeout(() => {
            if (this.loadedStyles.has(href)) {
              resolve();
            } else {
              waitForLoad();
            }
          }, 50);
        };

        waitForLoad();

        return;
      }

      this.loadingStyles.add(href);

      const link = document.createElement("link");

      link.rel = "stylesheet";
      link.href = href;
      link.onload = () => {
        this.loadedStyles.set(href, true);
        this.loadingStyles.delete(href);

        resolve();
      };

      link.onerror = () => {
        this.loadingStyles.delete(href);
        reject(new Error(`Failed to load CSS: ${href}`));
      };

      document.head.appendChild(link);
    });
  }

  /**
   * Remove um CSS carregado
   * @param {string} href - URL do CSS
   */
  unload(href) {
    document
      .querySelectorAll(`link[rel="stylesheet"][href="${href}"]`)
      .forEach((link) => {
        link.remove();
      });

    this.loadedStyles.delete(href);
    this.loadingStyles.delete(href);
  }

  /**
   * Carrega múltiplos arquivos CSS em ordem
   * @param {string[]} styles - Array de URLs
   * @returns {Promise<void[]>}
   */
  loadAll(styles) {
    return Promise.all(styles.map((href) => this.load(href)));
  }
}

export const styleLoader = new StyleLoader();
