import config from "./Config.js";

function createPasswordHash(password) {
  try {
    const strongPasswordValidation = isStrongPassword(password);
    if (strongPasswordValidation.valid === false) {
      throw new Error(strongPasswordValidation.message);
    }

    const saltedPassword = password + config.ENCRYPTION_KEY;
    const hash = CryptoJS.SHA256(saltedPassword).toString();

    return hash;
  } catch (error) {
    console.error("Erro ao criar hash da senha: ", error);

    throw error;
  }
}

function verifyPassword(password, hash) {
  try {
    if (!password || !hash) {
      return false;
    }

    const newHash = createPasswordHash(password);

    return newHash === hash;
  } catch (error) {
    console.error("Erro ao verificar senha: ", error);

    throw error;
  }
}

function isStrongPassword(password) {
  try {
    const requisitos = [
      { regex: /.{8,}/, message: "ter pelo menos 8 caracteres" },
      { regex: /[a-z]/, message: "conter pelo menos uma letra minúscula" },
      { regex: /[A-Z]/, message: "conter pelo menos uma letra maiúscula" },
      { regex: /\d/, message: "conter pelo menos um número" },
      {
        regex: /[@#$%^&*!]/,
        message: "conter pelo menos um caractere especial (@#$%^&*!).",
      },
    ];

    const erros = requisitos
      .filter((requisito) => !requisito.regex.test(password))
      .map((requisito) => requisito.message);

    if (erros.length === 0) {
      return { valid: true, message: "Senha forte." };
    } else {
      return {
        valid: false,
        message: "Sua senha deve " + erros.join(", ") + ".",
      };
    }
  } catch (error) {
    console.error("Erro ao verificar senha: ", error);

    throw error;
  }
}

export { createPasswordHash, verifyPassword, isStrongPassword };
