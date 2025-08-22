import { asyncHandler } from "../utils/asyncHandler.js";
import { client } from "../index.js";
import { GenericModel } from "../model/userModel.js";

export const fetchNumber = async (resumeId) => {
  const result = await GenericModel.find({
    notionResumeID: resumeId,
  });
  const name = result[0].profiles[0].personalInfo.fullName;
  const number = result[0].profiles[0].personalInfo.phone;
  console.log("Fetching called", name, number);
  return { name, number };
};

const sendWhatsappMessage = async (chatId, message) => {
  try {
    await client.sendMessage(chatId, message);
    await client.sendMessage(
      process.env.GROUPID,
      message
    );
    console.log("Message sent successfully:");
    return { success: true  };
  } catch (error) {
    console.error("Error sending message:", error.message);
    return { success: false, error: error.message };
  }
};

export const getToken = asyncHandler(async (req, res) => {
  const reqBody = await req.body;
  console.log(reqBody);

  if (reqBody.verification_token) {
    console.log("--------New Connection Request Received-------");
    console.log("Verification token received:", reqBody.verification_token);
    return;
  }
  // Handle database update
  if (reqBody.type === "page.properties_updated") {
    try {
      let { name, number } = await fetchNumber(
        process.env.RESUMEID
      );
      if (number && name) {
        if (!number.startsWith("+91")) {
          number = "+91" + number;
          // console.log(number);
        }
        const Phonenumber = number.replace(/[+-\s]/g, ""); // Clean number
        const chatId = `${Phonenumber}@c.us`
        const message = `Hello ${name},\n\nThis is a reminder that your resume has been updated for the job application.\n\nBest regards,\nHiredEAsy`;
        // console.log("Sending to:", chatId);
        const response = await sendWhatsappMessage(chatId, message);
        // console.log("Message sent successfully:", response);
      }
    } catch (error) {
      // console.error("Error processing update:", error.message);
    }
  }

  res.status(200).send("Webhook received");
});
