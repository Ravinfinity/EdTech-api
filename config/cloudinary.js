const cloudinary = require("cloudinary").v2;
require("dotenv").config();

exports.cloudinaryConnect = () => {
  try {
    cloudinary.config({
      CLOUD_NAME: process.env.CLOUD_NAME,
      API_KEY: process.env.API_KEY,
      API_SECRET: process.env.API_SECRET,
    });
    console.log("Cloudinary connected successfully");
  } catch (error) {
    console.log("Error connecting to Cloudinary: ", error.message);
  }
};
