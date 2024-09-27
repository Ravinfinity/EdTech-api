const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expired: 3 * 60,
    // The document will be automatically deleted after 3 minutes of its creation time
  },
});

//a function -> to send emails
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email from StudyNotion",
      otp
    );
    console.log("Email sent Successfully to ", email);
    console.log(mailResponse);
  } catch (error) {
    console.log("Error occurred while sending email to", email);
    console.log(error);
    throw error;
  }
}

otpSchema.pre("save", async function (next) {
  // console.log("New document saved to database");

  // Only send an email when a new document is created
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
  next();
});

module.exports = mongoose.model("OTP", otpSchema);
