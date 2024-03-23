import { asyncError } from "../middleware/error.js";
import { User } from "../models/user.js";
import errorHanlder from "../utils/error.js";
import { cookieOptions, sendEmail, sendToken } from "../utils/features.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary";

import path from "path";
import dotenv from "dotenv";
import twilio from "twilio";
dotenv.config({ path: path.resolve(process.cwd(), "../data/config.env") });

import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from "../secrets.js";
import { Outlet } from "../models/outlet.js";
const accountSid = TWILIO_ACCOUNT_SID;
const authToken = TWILIO_AUTH_TOKEN;
console.log(accountSid, authToken);
const client = twilio(accountSid, authToken, { lazyLoading: true });

export const login = asyncError(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  // handle error
  if (!user) {
    return next(new errorHanlder("Incorrect Email or Password", 400));
  }
  if (!password) return next(new errorHanlder("Please enter password"), 400);

  const isMatched = await user.comparePassword(password);
  console.log(isMatched);
  if (!isMatched) {
    return next(new errorHanlder("Incorrect Email or Password", 400));
  }
  sendToken(user, res, `Welcome back ${user.name}`, 200);
});

export const signup = asyncError(async (req, res, next) => {
  const { name, email, password, address, city, country, pinCode, phone } =
    req.body;
  let user = await User.findOne({ email });
  if (user) return next(new errorHanlder("Email already exists", 400));
  // req.file
  let avatar = undefined;

  if (req.file) {
    const file = getDataUri(req.file);
    // add cloudinary here
    const myCloud = await cloudinary.v2.uploader.upload(file.content);
    console.log(myCloud);
    avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
    console.log(avatar);
  }

  user = await User.create({
    avatar,
    name,
    email,
    password,
    address,
    city,
    country,
    pinCode,
    phone,
  });
  sendToken(user, res, `Registered Successfully`, 201);
});

export const getMyProfile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
});

export const logOut = asyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      ...cookieOptions,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Log Out Successfully",
    });
});

export const updateProfile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  console.log(user.email);
  const { name, email, address, city, country, pinCode } = req.body;
  console.log(email);
  if (name) user.name = name;
  if (email) user.email = email;
  if (address) user.address = address;
  if (city) user.city = city;
  if (country) user.country = country;
  if (pinCode) user.pinCode = pinCode;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully",
  });
});

export const changePassword = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return next(new errorHanlder("Please enter all fields"), 400);
  const isMatched = await user.comparePassword(oldPassword);
  if (!isMatched) return next(new errorHanlder("Incorrect old password"), 400);
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password Changed Successfully",
  });
});

export const updatePic = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const file = getDataUri(req.file);
  console.log(user.avatar.public_id);
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  console.log(user.avatar.public_id);

  // add cloudinary here
  const myCloud = await cloudinary.v2.uploader.upload(file.content);
  console.log(myCloud);
  user.avatar = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };
  await user.save();

  res.status(200).json({
    success: true,
    message: "Avatar updated successfully",
  });
});
export const forgetPassword = asyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return next(new errorHanlder("Incorrect Email", 404));
  // max,min 2000,10000
  // math.random()*(max-min)+min

  const randomNumber = Math.random() * (999999 - 100000) + 100000;
  const otp = Math.floor(randomNumber);
  const otp_expire = 15 * 60 * 1000;

  user.otp = otp;
  user.otp_expire = new Date(Date.now() + otp_expire);
  await user.save();
  console.log("Hi1");
  const message = `Your OTP for Reseting Password is ${otp}.\n Please ignore if you haven't requested this.`;
  try {
    console.log("Hi2");

    await sendEmail("OTP For Reseting Password", user.email, message);
    console.log("Hi3");
  } catch (error) {
    console.log("Hi4");

    user.otp = null;
    user.otp_expire = null;
    await user.save();
    return next(error);
  }
  console.log("Hi5");

  res.status(200).json({
    success: true,
    message: `Email Sent To ${user.email}`,
  });
});

export async function getNearbyOutlets(req, res) {
  const { latitude, longitude } = req.query; // Access location data from request body

  if (!latitude || !longitude) {
    return res.status(400).json({ message: "Missing location data" });
  }

  const userLocation = {
    type: "Point",
    coordinates: [longitude, latitude], // Inverted order for GeoJSON
  };

  try {
    // Replace "Outlet" with your actual Mongoose model name for outlets

    // Define the maximum search radius (in kilometers)
    // const maxDistance = 5;

    // Find nearest outlets using $near with limit and sort
    const nearbyOutlets = await Outlet.find({
      location: { $near: userLocation },
    })
      .limit(3) // Limit results to 3 nearest outlets
      .sort({ location: 1 }); // Sort by distance (ascending)

    res.json({ outlets: nearbyOutlets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error finding nearby outlets" });
  }
}

export const resetPassword = asyncError(async (req, res, next) => {
  const { otp, password } = req.body;

  const user = await User.findOne({
    otp,
    otp_expire: {
      $gt: Date.now(),
    },
  });

  if (!user)
    return next(new errorHanlder("Incorrect OTP or has been expired", 400));

  if (!password)
    return next(new errorHanlder("Please Enter New Password", 400));

  user.password = password;
  user.otp = undefined;
  user.otp_expire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Changed Successfully, You can login now",
  });
});

export const otpLogin = asyncError(async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone number format (optional)

    // Check if user exists (optional)
    const user = await User.findOne({ phone });

    // Generate verification code using Twilio Verify (or your chosen OTP provider)
    const verification = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications.create({
        to: `+91${phone}`,
        channel: "sms", // Or 'whatsapp' if enabled
      });

    res.status(200).json({
      message: "Verification code sent",
      verificationSid: verification.sid,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

export const verifyOtp = asyncError(async (req, res) => {
  try {
    const { verificationSid, code, phone } = req.body;

    // Verify the code using Twilio Verify
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks.create({ verificationSid: verificationSid, code });

    if (verificationCheck.status === "approved") {
      const user = await User.findOne({ phone });
      // User successfully verified, proceed with login logic (e.g., generate session token)
      sendToken(user, res, `Welcome back ${user.name}`, 200);
    } else {
      res.status(401).json({ message: "Invalid verification code" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});
