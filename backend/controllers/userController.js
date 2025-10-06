import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
// import razorpay from "razorpay";


//API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Details" }); // Use 400 for bad requests
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a valid email" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a strong password" });
    }

    ///hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.status(200).json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API to get user profile data
const getProfile = async (req, res) => {
  try {
    const userData = await userModel.findById(req.user).select("-password");
    res.status(200).json({ success: true, userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ApI to update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, dob, gender } = req.body;
    const userId = req.user;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.status(400).json({ success: false, message: "Data Missing" });
    }

    const updateData = {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    };

    if (imageFile) {
      //upload image to cloudinary
      try {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: "image",
        });
        updateData.image = imageUpload.secure_url; // Corrected to imageUpload
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res
          .status(500)
          .json({ success: false, message: "Failed to upload image" });
      }
    }
    const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    }); //Added {new: true}

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "Profile updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.user;

    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    if (!docData.available) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor not available" });
    }

    let slots_booked = docData.slots_booked || {}; // Ensure slots_booked is initialized

    // Checking slot availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res
          .status(400)
          .json({ success: false, message: "Slot not available" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [slotTime];
    }

    const userData = await userModel.findById(userId).select("-password");
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const appointmentData = {
      userId,
      docId,
      userData: userData,
      docData: {
        _id: docData._id,
        name: docData.name,
        specialization: docData.specialization,
        fees: docData.fees,
        image: docData.image,
        address: docData.address,
      },
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // Save updated slots
    const updatedDoctor = await doctorModel.findByIdAndUpdate(
      docId,
      { slots_booked },
      { new: true }
    );
    if (!updatedDoctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    res.status(201).json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API to get user appointments for frontend
const listAppointment = async (req, res) => {
  try {
    const userId = req.user;
    const appointments = await appointmentModel.find({ userId });
    res.status(200).json({ success: true, appointment: appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Api to cancle Appointment
const cancelAppointment = async (req, res) => {
  try {
    // Get userId from the JWT token (set by middleware)
    const userId = req.user;
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res
        .status(400)
        .json({ success: false, message: "Appointment ID is required" });
    }

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }
    if (appointment.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized Action" });
    }
    if (appointment.cancelled) {
      return res
        .status(400)
        .json({ success: false, message: "Appointment already cancelled." });
    }

    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      { cancelled: true },
      { new: true } // Return the modified document
    );

    if (!updatedAppointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" }); // Handle the case where the update fails.
    }
    // Update doctor's slots_booked
    const { docId, slotDate, slotTime } = updatedAppointment; // Use updatedAppointment
    const doctor = await doctorModel.findById(docId);
    if (doctor) {
      let slots_booked = doctor.slots_booked || {}; // Ensure it's initialized
      if (slots_booked[slotDate]) {
        slots_booked[slotDate] = slots_booked[slotDate].filter(
          (time) => time !== slotTime
        );
        // Remove the date entry if the slot list becomes empty
        if (slots_booked[slotDate].length === 0) {
          delete slots_booked[slotDate];
        }

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });
      }
    }
    res.status(200).json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//--- Api to make payment of appointment using razorpay ---//
/*
// ---------------------------- RAZORPAY INTEGRATION (TEMPORARILY DISABLED) ---------------------------- //
// The following code handles payment creation and verification using Razorpay.
// Uncomment this section when you’re ready to integrate payment functionality again.

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,           // Your Razorpay public key
  key_secret: process.env.RAZORPAY_KEY_SECRET,   // Your Razorpay secret key
});

// -------------------- Create a Razorpay Order -------------------- //
// This API generates a Razorpay order for a given appointment.
// It checks if the appointment exists and isn’t cancelled before creating the order.

const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    // If appointment not found or cancelled, stop payment process
    if (!appointmentData || appointmentData.cancelled) {
      return res.json({
        success: false,
        message: "Appointment Cancelled or not found",
      });
    }

    // Create payment options for Razorpay
    const options = {
      amount: appointmentData.amount * 100,            // Convert amount to paisa
      currency: process.env.CURRENCY || "INR",         // Default currency is INR
      receipt: appointmentId,                          // Store appointment ID as receipt
    };

    // Create a new Razorpay order
    const order = await razorpayInstance.orders.create(options);

    // Send the order details to frontend
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Razorpay Payment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- Verify Razorpay Payment -------------------- //
// This API verifies the payment after a successful transaction on the frontend.
// If payment status is 'paid', it updates the appointment record as paid.

const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === 'paid') {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
      res.json({ success: true, message: "Payment Successful" });
    } else {
      res.json({ success: false, message: "Payment Failed" });
    }

  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.json({ success: false, message: error.message });
  }
};

// ---------------------------- END OF RAZORPAY SECTION ---------------------------- //
*/






export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
};
