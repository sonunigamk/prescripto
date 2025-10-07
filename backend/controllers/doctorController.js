import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";

const changeAvailablity = async (req, res) => {
  try {
    const { docId } = req.body;

    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.json({ success: true, message: "Availability Changed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

///--- Api for doctor Login ---///

const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

///---- Api to get doctor appointment for doctor panel ----//

const appointmentsDoctor = async (req, res) => {
  try {
    const doctorId = req.doctorId; // from middleware
    const appointments = await appointmentModel
      .find({ docId: doctorId })
      .populate("userId", "name dob image");
    res.json({ success: true, appointments });
  } catch (error) {
    console.log("AppointmentsDoctor Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

///----Api to mark Appointment completed for doctor panel ----////

const appointmentComplete = async (req, res) => {
  try {
    const docId = req.doctorId; // from middleware
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });
      return res.json({ success: true, message: "Appointment Completed" });
    } else {
      return res.json({ success: false, message: "Marking Complete Failed" });
    }
  } catch (error) {
    console.log("AppointmentComplete Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

//.--- Api to cancel appointment for doctor panel---///

const appointmentCancel = async (req, res) => {
  try {
    const docId = req.doctorId; // from middleware
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      return res.json({ success: true, message: "Appointment Cancelled" });
    } else {
      return res.json({ success: false, message: "Mark failed" });
    }
  } catch (error) {
    console.log("AppointmentCancel Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

///--- Api to get  dashboard data for doctor panel---//

const doctorDashboard = async (req, res) => {
  try {
    const docId = req.doctor._id; // Use the doctor ID from middleware

    const appointments = await appointmentModel.find({ docId });

    const earnings = appointments.reduce(
      (acc, item) => acc + (item.isCompleted || item.payment ? item.amount : 0),
      0
    );

    const patients = [...new Set(appointments.map((item) => item.userId))];

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };

    res.json({ success: true, dashData }); // ✅ key here: dashData
  } catch (error) {
    console.log("DoctorDashboard Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

///-- Api to get doctor profile for doctor panel---///

const doctorProfile = async (req, res) => {
  try {
    const docId = req.doctorId; // from middleware
    if (!docId) {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized" });
    }

    const profileData = await doctorModel.findById(docId).select("-password");

    if (!profileData) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    res.json({ success: true, profileData });
  } catch (error) {
    console.log("DoctorProfile Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

////---- Api to update doctor profile data from doctor panel----///

const updateDoctorProfile = async (req, res) => {
  try {
    const docId = req.doctorId; // from authDoctor middleware
    if (!docId) {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized" });
    }

    const { fees, address, available } = req.body;

    const updatedProfile = await doctorModel.findByIdAndUpdate(
      docId,
      { fees, address, available },
      { new: true } // returns updated doc
    );

    if (!updatedProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    res.json({ success: true, message: "Profile Updated", updatedProfile });
  } catch (error) {
    console.log("UpdateDoctorProfile Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  changeAvailablity,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
};
