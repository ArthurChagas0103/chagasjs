import SentMessagesMarketingModel from "../../../../models/supplier/marketing/sent-messages/sentMessagesMarketingModel.js";

export class SentMessagesMarketingController {
  constructor() {
    this.model = new SentMessagesMarketingModel();
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document.getElementById("filterEmails").addEventListener("click", () => {
      const startDate = document.getElementById("startDate").value;
      const endDate = document.getElementById("endDate").value;
      const subject = document.getElementById("subjectInput").value;
      let filteredEmails = this.model.getAllSentEmails();

      if (startDate && endDate) {
        filteredEmails = this.model.filterByDateRange(
          filteredEmails,
          startDate,
          endDate
        );
      }

      if (subject) {
        filteredEmails = this.model.filterBySubject(filteredEmails, subject);
      }

      this.updateEmailList(filteredEmails);
    });

    document.getElementById("emailList").addEventListener("click", (e) => {
      if (e.target.classList.contains("view-email")) {
        const emailId = e.target.dataset.emailId;
        this.viewEmail(emailId);
      }
    });
  }

  async loadEmails() {
    const emails = this.model.getAllSentEmails();
    this.updateEmailList(emails);
  }

  updateEmailList(emails) {
    const emailList = document.getElementById("emailList");
    const noDataMessage = document.getElementById("noDataMessage");
    emailList.innerHTML = "";

    if (emails.length === 0) {
      noDataMessage.classList.remove("d-none");
    } else {
      noDataMessage.classList.add("d-none");
      emails.forEach((email) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${email.subject}</td>
            <td>${new Date(email.sentDate).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary view-email" data-email-id="${
                  email.id
                }">
                    <i class="bi bi-eye"></i> Visualizar
                </button>
            </td>
        `;
        emailList.appendChild(row);
      });
    }
  }

  viewEmail(emailId) {
    const emails = this.model.getAllSentEmails();
    const email = emails.find((e) => e.id === emailId);

    if (email) {
      bootbox.dialog({
        title: email.subject,
        message: `<div class="email-view">${email.message}</div>`,
        size: "large",
        buttons: {
          close: {
            label: "Fechar",
            className: "btn-primary",
          },
        },
      });
    }
  }
}
