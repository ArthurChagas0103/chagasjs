import { localStorageKeys } from "../../../../assets/js/utils/Constantes.js";

class SentMessagesMarketingModel {
  constructor() {
    this.storageKey = localStorageKeys.SENT_EMAILS;
  }

  getAllSentEmails() {
    const emails = localStorage.getItem(this.storageKey);
    return emails ? JSON.parse(emails) : [];
  }

  filterByDateRange(emails, startDate, endDate) {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);

    const filtered = emails.filter((email) => {
      const emailDate = new Date(email.sentDate);
      return emailDate >= start && emailDate <= end;
    });

    return filtered;
  }

  filterByRecipient(emails, recipient) {
    return emails.filter((email) =>
      email.to.toLowerCase().includes(recipient.toLowerCase())
    );
  }

  filterBySubject(emails, subject) {
    return emails.filter((email) =>
      email.subject.toLowerCase().includes(subject.toLowerCase())
    );
  }
}

export default SentMessagesMarketingModel;
