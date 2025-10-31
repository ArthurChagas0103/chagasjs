const defaultConfig = {
  ENCRYPTION_KEY: "xxxxxx",
  ENDPOINTS: {
    SEND_EMAIL: "https://api.emailjs.com/api/v1.0/email/send",
  },
  EMAIL_CONFIG: {
    TEMPLATE_ID: {
      CONTACT: "xxxxxx",
      GENERIC_EMAIL: "xxxxxx",
    },
    SERVICE_ID: "xxxxxx",
    USER_ID: "xxxxxx",
  },
};

function loadConfig() {
  try {
    const config = {
      ...defaultConfig,
    };

    return config;
  } catch (error) {
    console.error("Erro ao carregar configurações:", error);

    return defaultConfig;
  }
}

const config = loadConfig();

export default config;
