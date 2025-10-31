import {
  createPasswordHash,
  isStrongPassword,
} from "../../../assets/js/utils/PasswordUtils.js";
import { SendEmail } from "../../../assets/js/utils/SendEmail.js";
import config from "../../../assets/js/utils/Config.js";
import { localStorageKeys } from "../../../assets/js/utils/Constantes.js";

export class ForgotPasswordModel {
  constructor() {
    this.userEmail = "";
    this.verificationCode = "";
    this.codeGeneratedAt = null;
  }

  validateEmail(email) {
    if (!isValidEmail(email)) {
      return false;
    }

    const suplliers = JSON.parse(
      localStorage.getItem(localStorageKeys.REGISTERED_SUPPLIERS) || "[]"
    );

    return suplliers.some((supplier) => supplier.email == email);
  }

  generateVerificationCode() {
    this.codeGeneratedAt = new Date();

    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendEmailVerificationCode() {
    const sendEmail = new SendEmail(
      config.ENDPOINTS.SEND_EMAIL,
      config.EMAIL_CONFIG.TEMPLATE_ID.GENERIC_EMAIL,
      config.EMAIL_CONFIG.SERVICE_ID,
      config.EMAIL_CONFIG.USER_ID,
      {
        email: this.userEmail,
        subject: "Código de verificação para redefinição de senha",
        message: `Olá,
        <br /><br />
        Recebemos uma solicitação para redefinir a senha da sua conta. Para continuar, utilize o código de verificação abaixo:
        <br /><br />
        <b>${this.verificationCode}</b>
        <br /><br />
        Este código é válido por <b>15 minutos</b>.
        <br /><br />
        ⚠️ <b>Não compartilhe este código com ninguém</b>. Se você não solicitou a redefinição de senha, ignore este e-mail com segurança.
        <br /><br />
        A <b>Save&Serve</b> nunca solicitará códigos ou links de acesso por e-mail, telefone ou redes sociais. Fique atento a possíveis tentativas de golpe.`,
      }
    );

    const response = await sendEmail.send();

    if (!response) {
      throw new Error("Erro ao enviar o email!");
    }
  }

  validateVerificationCode(inputCode) {
    if (inputCode !== this.verificationCode) {
      return false;
    }

    if (!this.codeGeneratedAt) {
      return false;
    }

    const now = new Date();
    const timeDiff = (now - this.codeGeneratedAt) / 1000 / 60;

    return timeDiff <= 15;
  }

  validatePassword(password, confirmPassword) {
    if (password !== confirmPassword) {
      return { valid: false, message: "As senhas não coincidem." };
    }

    const strongPasswordValidation = isStrongPassword(password);
    if (strongPasswordValidation.valid === false) {
      return {
        valid: false,
        message: strongPasswordValidation.message,
      };
    }

    return { valid: true };
  }

  updatePassword(newPassword) {
    const passwordHash = createPasswordHash(newPassword);
    const suppliers = JSON.parse(
      localStorage.getItem(localStorageKeys.REGISTERED_SUPPLIERS) || "[]"
    );
    const updatedSuppliers = suppliers.map((supplier) => {
      if (supplier.email === this.userEmail) {
        return { ...supplier, senha: passwordHash };
      }

      return supplier;
    });

    localStorage.setItem(
      localStorageKeys.REGISTERED_SUPPLIERS,
      JSON.stringify(updatedSuppliers)
    );

    return true;
  }

  setEmail(email) {
    this.userEmail = email;
  }

  setVerificationCode(code) {
    this.verificationCode = code;
    this.codeGeneratedAt = new Date();
  }

  getEmail() {
    return this.userEmail;
  }

  getVerificationCode() {
    return this.verificationCode;
  }
}
