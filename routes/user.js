import express from "express";
import {
  changePassword,
  updateProfile,
  getMyProfile,
  logOut,
  login,
  signup,
  updatePic,
  forgetPassword,
  resetPassword,
  otpLogin,
  verifyOtp,
  getNearbyOutlets,
} from "../controllers/user.js";
import { isAuthenticated } from "../middleware/auth.js";
import { singleUpload } from "../middleware/multer.js";
import { Outlet } from "../models/outlet.js";

const router = express.Router();

router.post("/login", login);
router.post("/new", singleUpload, signup);
router.post("/otp-login", otpLogin);
router.post("/verify-otp", verifyOtp);
router.get("/me", isAuthenticated, getMyProfile);
router.get("/logout", isAuthenticated, logOut);
// update route
router.put("/updateprofile", isAuthenticated, updateProfile);
router.put("/changepassword", isAuthenticated, changePassword);
router.put("/updatepic", isAuthenticated, singleUpload, updatePic);

// forget and reset password and email
router.route("/forgetpassword").post(forgetPassword).put(resetPassword);

router.get("/nearby-outlets", isAuthenticated, getNearbyOutlets);


router.post("/outlets", isAuthenticated, async (req, res, next) => {
  try {
    const { name, address, location } = req.body; // Destructure outlet data

    // Validation (optional): You can add validation here to ensure required fields are present
    location.type = "Point"

    const newOutlet = new Outlet({
      name,
      address,
      location,
    //   ...otherInfo, // Include any other relevant data from request body
    });

    await newOutlet.save();

    res.status(201).json({ message: "Outlet created successfully", outlet: newOutlet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating outlet" });
  }
});

export default router;
