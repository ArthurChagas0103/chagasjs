import { ForgotPasswordModel } from "../../../models/supplier/forgot-password/ForgotPasswordModel.js";
import { toastService } from "../../../assets/js/utils/ToastService.js";

export class ForgotPasswordSupplierController {
  constructor(
    buttonSendCodeId,
    buttonVerifyCodeId,
    buttonUpdatePasswordId,
    buttonBackEmail,
    buttonBackCode
  ) {
    this.model = new ForgotPasswordModel();
    this.buttonSendCode = document.getElementById(buttonSendCodeId);
    this.buttonVerifyCode = document.getElementById(buttonVerifyCodeId);
    this.buttonUpdatePassword = document.getElementById(buttonUpdatePasswordId);
    this.buttonBackEmail = document.getElementById(buttonBackEmail);
    this.buttonBackCode = document.getElementById(buttonBackCode);

    this.buttonSendCode.addEventListener("click", () =>
      this.handleEmailSubmit()
    );
    this.buttonVerifyCode.addEventListener("click", () =>
      this.handleCodeSubmit()
    );
    this.buttonUpdatePassword.addEventListener("click", () =>
      this.handlePasswordSubmit()
    );
    this.buttonBackEmail.addEventListener("click", () => this.voltarEtapa(1));
    this.buttonBackCode.addEventListener("click", () => this.voltarEtapa(2));
  }

  showError(msg) {
    toastService.error({
      title: "Atenção",
      message: msg,
      icon: "bi bi-exclamation-triangle-fill",
    });
  }

  avancarEtapa(etapa) {
    document.querySelector(".step.active").classList.remove("active");
    document.getElementById("step" + etapa).classList.add("active");
    document.querySelector(".progress-bar").style.width = etapa * 33 + "%";
  }

  voltarEtapa(etapa) {
    this.avancarEtapa(etapa);
  }

  async handleEmailSubmit() {
    this.buttonSendCode.setAttribute("disabled", true);

    try {
      const email = document.getElementById("email").value;

      if (this.model.validateEmail(email)) {
        this.model.setEmail(email);

        const verificationCode = this.model.generateVerificationCode();

        this.model.setVerificationCode(verificationCode);
        await this.model.sendEmailVerificationCode();

        this.avancarEtapa(2);
      } else {
        this.showError("Email não encontrado no sistema.");
      }
    } catch (error) {
      console.error("Erro ao enviar o código de verificação:", error);
      this.showError(
        "Ocorreu um erro ao tentar enviar o código. Tente novamente."
      );
    } finally {
      this.buttonSendCode.removeAttribute("disabled");
    }
  }

  handleCodeSubmit() {
    this.buttonVerifyCode.setAttribute("disabled", true);

    try {
      const inputCode = document.getElementById("code").value;
      if (this.model.validateVerificationCode(inputCode)) {
        this.avancarEtapa(3);
      } else {
        this.showError("Código de verificação inválido ou expirado.");
      }
    } catch (error) {
      console.error("Erro ao validar código de verificação:", error);
      this.showError("Ocorreu um erro ao verificar o código.");
    } finally {
      this.buttonVerifyCode.removeAttribute("disabled");
    }
  }

  handlePasswordSubmit() {
    this.buttonUpdatePassword.setAttribute("disabled", true);

    try {
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const validationResult = this.model.validatePassword(
        newPassword,
        confirmPassword
      );

      if (validationResult.valid) {
        if (this.model.updatePassword(newPassword)) {
          toastService.success({
            title: "Sucesso!",
            message: "Senha atualizada com sucesso!",
            icon: "bi bi-check-circle-fill",
          });

          window.location.href = "#loginSupplier";
        } else {
          this.showError("Erro ao atualizar a senha. Tente novamente.");
        }
      } else {
        this.showError(validationResult.message);
      }
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      this.showError("Erro inesperado ao atualizar a senha.");
    } finally {
      this.buttonUpdatePassword.removeAttribute("disabled");
    }
  }
}
