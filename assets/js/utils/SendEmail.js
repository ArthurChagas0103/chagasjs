export class SendEmail {
  constructor(endpoint, templateId, serviceId, userId, data) {
    this.endpoint = endpoint;
    this.templateId = templateId;
    this.serviceId = serviceId;
    this.userId = userId;
    this.data = data;
  }

  toJSON() {
    return {
      service_id: this.serviceId,
      template_id: this.templateId,
      user_id: this.userId,
      template_params: this.data,
    };
  }

  async send() {
    if (!this.endpoint) {
      throw new Error("Endpoint não informado!");
    }
    if (!this.templateId) {
      throw new Error("Template não informado!");
    }
    if (!this.data || this.data.length === 0) {
      throw new Error("Dados não informados!");
    }

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.toJSON()),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar o email!");
      }

      return true;
    } catch (error) {
      console.error("Erro:", error);

      return false;
    }
  }
}
