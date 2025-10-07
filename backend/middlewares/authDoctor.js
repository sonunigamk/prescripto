import jwt from "jsonwebtoken";

const authDoctor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.dtoken || req.headers.dToken;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized, Login Again",
      });
    }

    // If using "Bearer <token>" format
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Assign decoded ID to req.doctorId and req.doctor (optional)
    req.doctorId = decoded.id;
    req.doctor = { _id: decoded.id };

    next();
  } catch (error) {
    console.log("AuthDoctor Error:", error.message);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default authDoctor;
