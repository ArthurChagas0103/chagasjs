export class ContactModel {
  constructor(name, email, subject, message) {
    this.name = name.trim();
    this.email = email.trim();
    this.subject = subject.trim();
    this.message = message.trim();
  }

  validate() {
    const errors = [];

    if (!this.name) errors.push("O nome é obrigatório.");
    if (!this.email || !isValidEmail(this.email))
      errors.push("Email inválido.");
    if (!this.subject) errors.push("O assunto é obrigatório.");
    if (!this.message) errors.push("A mensagem é obrigatória.");

    return errors;
  }

  toJSON() {
    return {
      name: this.name,
      email: this.email,
      subject: this.subject,
      message: this.message,
    };
  }
}
