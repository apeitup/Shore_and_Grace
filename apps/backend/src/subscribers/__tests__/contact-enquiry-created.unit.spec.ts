import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { CONTACT_ENQUIRY_MODULE } from "../../modules/contact-enquiry";
import contactEnquiryCreatedHandler from "../contact-enquiry-created";

describe("contact enquiry created subscriber", () => {
  const originalEnvironment = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnvironment };
    jest.restoreAllMocks();
  });

  it("does not fail or lose the saved enquiry when an email cannot be sent", async () => {
    process.env.NOTIFICATION_FROM_EMAIL = "notifications@example.com";
    process.env.CONTACT_RECIPIENT_EMAIL = "contact@example.com";
    process.env.CONTACT_REPLY_TO_EMAIL = "contact@example.com";

    const enquiry = {
      id: "contact_01",
      reference: "SG-C-20261029-ABC123",
      name: "Customer Name",
      email: "customer@example.com",
      category: "products",
      message: "Please tell me more.",
    };
    const retrieveContactEnquiry = jest.fn().mockResolvedValue(enquiry);
    const createNotifications = jest
      .fn()
      .mockRejectedValueOnce(new Error("SMTP unavailable"))
      .mockResolvedValueOnce({ id: "noti_ack" });
    const logger = { error: jest.fn() };
    const container = {
      resolve: jest.fn((key: string) => {
        if (key === CONTACT_ENQUIRY_MODULE) {
          return { retrieveContactEnquiry };
        }
        if (key === Modules.NOTIFICATION) {
          return { createNotifications };
        }
        if (key === ContainerRegistrationKeys.LOGGER) {
          return logger;
        }
        throw new Error(`Unexpected container key: ${key}`);
      }),
    };

    await expect(
      contactEnquiryCreatedHandler({
        event: { data: { id: enquiry.id } },
        container,
      } as never),
    ).resolves.toBeUndefined();

    expect(retrieveContactEnquiry).toHaveBeenCalledWith(enquiry.id);
    expect(createNotifications).toHaveBeenCalledTimes(2);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("the internal notification failed"),
    );
  });
});
