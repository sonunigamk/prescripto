import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const MyAppointments = () => {
  const { backendUrl, token,getDoctorsData } = useContext(AppContext)

  const [appointments, setAppointment] = useState([])

  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_')
    return `${dateArray[0]} ${months[Number(dateArray[1])]} ${dateArray[2]}`
  }

const getUserAppointments = async () => {
  try {
    const { data } = await axios.get(backendUrl + '/api/user/appointments', {
      headers: { token }
    });

    
    console.log("Fetched appointments:", data);

    // Check if appointment exists and is an array
    if (data?.appointment && Array.isArray(data.appointment)) {
      if (data.appointment.length > 0) {
        setAppointment(data.appointment.reverse());
        console.log("Appointments Data:", data.appointment);
      } else {
        console.log("Appointments array is empty.");
        toast.error("No appointments available.");
      }
    } else {
      console.log("Appointments is not an array or is missing.");
      toast.error("Appointments data is invalid.");
    }
  } catch (error) {
    console.log("Error fetching appointments:", error);
    toast.error(error.response?.data?.message || error.message);
  }
};

const cancelAppointment = async (appointmentId) => {
  console.log(appointmentId);
  try {
    const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', {appointmentId }, {
    headers: { token }
})

    if (data.success) {
      toast.success("Appointment canceled successfully!") 
      getUserAppointments()
      getDoctorsData() 
    } else {
      toast.error(data.message || "Failed to cancel appointment.") 
    }
  } catch (error) {
    console.log(error)
    toast.error(error.response?.data?.message || error.message) 
  }
}

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My appointments</p>
      <div>
        {
          appointments.length > 0 ? (
            appointments.map((item, index) => (
              <div
                className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b'
                key={index}
              >
                <div>
                  <img
                    className='w-32 bg-indigo-50'
                    src={item.docData.image} 
                    alt=""
                  />
                </div>
                <div className='flex-1 text-sm text-zinc-600'>
                  <p className='text-neutral-800 font-semibold'>{item?.docData?.name}</p>
                  <p>{item?.docData?.speciality}</p>
                  <p className='text-zinc-700 font-medium mt-1'>Address:</p>
                  <p className='text-xs'>{item?.docData?.address?.line1}</p>
                  <p className='text-xs'>{item?.docData?.address?.line2}</p>
                  <p className='text-xs mt-1'>
                    <span className='text-sm text-neutral-700 font-medium'>Date & Time</span>:
                    {` ${slotDateFormat(item.slotDate)} | ${item.slotTime}`}
                  </p>
                </div>
                <div className='flex flex-col gap-2 justify-end'>
                  {!item.cancelled ? (
                    <>
                      <button className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>
                        Pay Online
                      </button>

                      <button
                        onClick={() => cancelAppointment(item._id)}
                        className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'
                      >
                        Cancel Appointment
                      </button>
                    </>
                  ) : (
                    <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>
                      Appointment cancelled
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No appointments found.</p>
          )
        }
      </div>
    </div>
  )
}

export default MyAppointments
