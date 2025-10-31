import { scriptLoader } from "../utils/ScriptLoader.js";
import { styleLoader } from "../utils/StyleLoader.js";

class DefaultModule {
  /**
   * @param {Object} config - Configurações do módulo
   * @param {string[]} config.requiredStyles - Styles de dependência
   * @param {string} config.controllerStyle - URL do controller principal
   * @param {string[]} config.requiredScripts - Scripts de dependência
   * @param {string} config.controllerScript - URL do controller principal
   * @param {string} config.type - Tipo do arquivo
   * @param {Object} config.initOptions - Opções para inicialização
   */
  constructor({
    requiredStyles = [],
    controllerStyle,
    requiredScripts = [],
    controllerScript,
    type,
    initOptions = {},
  } = {}) {
    this.requiredStyles = requiredStyles;
    this.controllerStyle = controllerStyle;
    this.requiredScripts = requiredScripts;
    this.controllerScript = controllerScript;
    this.type = type;
    this.initOptions = initOptions;
    this.initialized = false;
  }

  async init() {
    try {
      if (this.requiredStyles.length > 0) {
        await styleLoader.loadAll(this.requiredStyles);
      }
      if (this.controllerStyle) {
        await styleLoader.load(this.controllerStyle);
      }
      if (this.requiredScripts.length > 0) {
        await scriptLoader.loadAll(this.requiredScripts, this.type);
      }
      if (this.controllerScript) {
        await scriptLoader.load(this.controllerScript, this.type);
      }

      this.initialized = true;
    } catch (error) {
      console.error("Falha ao inicializar o módulo:", error);
      throw error;
    }
  }

  async destroy() {
    if (!this.initialized) return;

    if (this.controllerScript) {
      scriptLoader.unload(this.controllerScript);
    }
    if (this.controllerStyle) {
      styleLoader.unload(this.controllerStyle);
    }
    if (this.requiredScripts) {
      this.requiredScripts.forEach((element) => {
        scriptLoader.unload(element);
      });
    }
    if (this.requiredStyles) {
      this.requiredStyles.forEach((element) => {
        styleLoader.unload(element);
      });
    }

    this.initialized = false;
  }
}

export default DefaultModule;
