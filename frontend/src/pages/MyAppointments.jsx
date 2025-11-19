import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from 'react-router-dom'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);

  const [appointments, setAppointment] = useState([]);
  const navigate = useNavigate()

  // ------- State for the Payment Success Popup (Mock Mode) ------- //
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState({
    amount: 0,
    date: "",
    transId: ""
  });

  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // ------- Function to format the date nicely ------- //
  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return `${dateArray[0]} ${months[Number(dateArray[1])]} ${dateArray[2]}`;
  };

  // ------- Fetch User Appointments from API ------- //
  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });

      if (data.success) {
        // We reverse the array so latest appointments show first
        setAppointment(data.appointment.reverse());
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ------- Cancel Appointment Function ------- //
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ------- Handle Payment (Mock) & Show Popup ------- //
  const handlePayment = async (appointmentId, fees) => {
    try {
      // 1. Call the API to update DB
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-razorpay",
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        // 2. Prepare fake receipt data
        const dateNow = new Date();
        const formattedDate = dateNow.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) + " | " + dateNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setSuccessDetails({
          amount: fees,
          date: formattedDate,
          transId: "TXN" + Math.floor(100000000 + Math.random() * 900000000)
        });

        // 3. Refresh list and Show Modal
        getUserAppointments();
        setShowSuccessModal(true);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };


  // ------- Razorpay payment integration (Future Use) ------- //
  /*
  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Appointment Payment",
      description: "Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            backendUrl + "/api/user/verifyRazorpay",
            response,
            { headers: { token } }
          );
          if (data.success) {
            getUserAppointments();
            navigate("/my-appointments");
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };
  
  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-razorpay",
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        initPay(data.order);
      }
    } catch (error) {
      console.log(error);
    }
  };
  */


  // ------- Load Appointments on Mount & Auto-Refresh every 10s ------- //
  useEffect(() => {
    if (token) {
      // 1. Fetch immediately
      getUserAppointments();

      // 2. Set up a timer to fetch every 10 seconds (Polling)
      // This ensures if a Doctor cancels/completes, the user sees it automatically.
      const intervalId = setInterval(() => {
        getUserAppointments();
      }, 10000); // 10000 ms = 10 seconds

      // 3. Cleanup the timer when user leaves the page
      return () => clearInterval(intervalId);
    }
  }, [token]);


  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My appointments
      </p>
      <div>
        {appointments.length > 0 ? (
          appointments.map((item, index) => (
            <div
              className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
              key={index}
            >
              <div>
                <img
                  className="w-32 bg-indigo-50"
                  src={item.docData.image}
                  alt=""
                />
              </div>
              <div className="flex-1 text-sm text-zinc-600">
                <p className="text-neutral-800 font-semibold">
                  {item?.docData?.name}
                </p>
                <p>{item?.docData?.speciality}</p>
                <p className="text-zinc-700 font-medium mt-1">Address:</p>
                <p className="text-xs">{item?.docData?.address?.line1}</p>
                <p className="text-xs">{item?.docData?.address?.line2}</p>
                <p className="text-xs mt-1">
                  <span className="text-sm text-neutral-700 font-medium">
                    Date & Time
                  </span>
                  :{` ${slotDateFormat(item.slotDate)} | ${item.slotTime}`}
                </p>
              </div>

              <div className="flex flex-col gap-2 justify-end">

                {/* ------- Button Logic based on Status ------- */}

                {/* 1. PAY ONLINE: Show if NOT Cancelled AND NOT Paid AND NOT Completed */}
                {!item.cancelled && !item.payment && !item.isCompleted && (
                  <button
                    onClick={() => handlePayment(item._id, item.docData.fees)}
                    className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    Pay Online
                  </button>
                )}

                {/* 2. PAID: Show if NOT Cancelled AND Paid AND NOT Completed */}
                {!item.cancelled && item.payment && !item.isCompleted && (
                  <button
                    disabled
                    className=" sm:min-w-48 py-2 border border-primary rounded cursor-not-allowed opacity-70 bg-green-50 text-green-600 font-medium"
                  >
                    Paid
                  </button>
                )}

                {/* 3. COMPLETED: Show if NOT Cancelled AND isCompleted */}
                {!item.cancelled && item.isCompleted && (
                  <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500">
                    Completed
                  </button>
                )}


                {/* ------- Cancel Button Logic ------- */}

                {/* 4. CANCEL ACTION: Show if NOT Cancelled AND NOT Completed */}
                {/* (User cannot cancel if the doctor already marked it completed) */}
                {!item.cancelled && !item.isCompleted && (
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                  >
                    Cancel Appointment
                  </button>
                )}

                {/* 5. CANCELLED LABEL: Show if Cancelled */}
                {item.cancelled && (
                  <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500">
                    Appointment Cancelled
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No appointments found.</p>
        )}
      </div>

      {/* ------- Payment Success Modal Popup ------- */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl transform transition-all scale-100 text-center">

            {/* Green Check Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-500 mb-6">Your appointment booking is confirmed.</p>

            {/* Receipt Details Card */}
            <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-100 mb-6 shadow-inner">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Amount Paid</span>
                <span className="text-sm font-bold text-gray-800">${successDetails.amount}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Date</span>
                <span className="text-xs font-medium text-gray-700">{successDetails.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Transaction ID</span>
                <span className="text-xs font-mono text-gray-700">{successDetails.transId}</span>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-primary text-white py-3 rounded-full font-semibold hover:bg-indigo-700 transition-colors duration-300 shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyAppointments;