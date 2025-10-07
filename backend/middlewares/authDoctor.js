import jwt from "jsonwebtoken";

const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers;

    if (!dtoken) {
      return res.json({
        success: false,
        message: "Not Authorized, Login Again",
      });
    }

    // Verify token
    const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);

    // Assign to req.doctorId instead of req.body
    req.doctorId = token_decode.id;

    next();
  } catch (error) {
    console.log("AuthDoctor Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export default authDoctor;
