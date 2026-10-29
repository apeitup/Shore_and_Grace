import type { Logger, NotificationTypes } from "@medusajs/framework/types";
import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils";
import nodemailer, { type Transporter } from "nodemailer";

type InjectedDependencies = {
  logger: Logger;
};

type SmtpNotificationOptions = {
  host: string;
  port: number | string;
  secure: boolean | string;
  user: string;
  password: string;
  from: string;
  from_name?: string;
};

export class SmtpNotificationService extends AbstractNotificationProviderService {
  static identifier = "notification-smtp";

  protected readonly logger_: Logger;
  protected readonly transporter_: Transporter;
  protected readonly from_: string;

  constructor(
    { logger }: InjectedDependencies,
    options: SmtpNotificationOptions,
  ) {
    super();
    this.logger_ = logger;
    this.from_ = options.from_name
      ? `"${options.from_name.replace(/"/g, "")}" <${options.from}>`
      : options.from;
    this.transporter_ = nodemailer.createTransport({
      host: options.host,
      port: Number(options.port),
      secure: String(options.secure) === "true",
      auth: {
        user: options.user,
        pass: options.password,
      },
    });
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO,
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    if (!notification?.to || !notification.content?.subject) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "An SMTP notification requires a recipient and subject.",
      );
    }

    const replyTo = notification.provider_data?.reply_to;
    const cc = notification.provider_data?.cc;
    const bcc = notification.provider_data?.bcc;

    try {
      const result = await this.transporter_.sendMail({
        to: notification.to,
        from: notification.from?.trim() || this.from_,
        replyTo: typeof replyTo === "string" ? replyTo : undefined,
        cc: typeof cc === "string" ? cc : undefined,
        bcc: typeof bcc === "string" ? bcc : undefined,
        subject: notification.content.subject,
        text: notification.content.text,
        html: notification.content.html,
      });

      return { id: result.messageId };
    } catch (error) {
      this.logger_.error(
        `SMTP notification failed: ${
          error instanceof Error ? error.message : "Unknown SMTP error"
        }`,
      );
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "The email notification could not be sent.",
      );
    }
  }
}
