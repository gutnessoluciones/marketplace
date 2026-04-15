/**
 * Email barrel — re-exports from the Brevo email module.
 *
 * This file exists for backward compatibility so existing imports
 * from "@/lib/email" continue to work without changes.
 *
 * Implementation: src/lib/email/index.ts (Brevo transactional API)
 */

export {
  sendEmail,
  sendOfferReceivedEmail,
  sendOfferAcceptedEmail,
  sendOfferCounteredEmail,
  sendOrderStatusEmail,
  sendNewMessageEmail,
  sendDisputeOpenedEmail,
  sendWelcomeEmail,
  sendConfirmationEmail,
  sendPasswordRecoveryEmail,
  sendOrderConfirmationEmail,
  sendAdminAlertEmail,
  isEmailConfigured,
} from "./email/index";

export type { SendEmailOptions } from "./email/index";
