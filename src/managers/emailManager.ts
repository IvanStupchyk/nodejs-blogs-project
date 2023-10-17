import {emailAdapter} from "../adapters/emailAdapter";
import {UserType} from "../types/generalTypes";

export const emailManager = {
  async sendEmailConfirmationMessage(user: UserType) {
    await emailAdapter.sendEmail(
      user.accountData.email,
      'Confirm email',
      `<h1>Thank for your registration</h1>
 <p>To finish registration please follow the link below:
     <a href='https://somesite.com/confirm-email?code=${user.emailConfirmation.confirmationCode}'>
     complete registration
     </a>
 </p>`
    )
  },

  async resendEmailConfirmationMessage(email: string, code: string) {
    await emailAdapter.sendEmail(
      email,
      'Confirm email',
      `<h1>Thank for your registration</h1>
 <p>To finish registration please follow the link below:
     <a href='https://somesite.com/confirm-email?code=${code}'>
     complete registration
     </a>
 </p>`
    )
  }
}