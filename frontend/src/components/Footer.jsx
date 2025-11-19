import React from 'react'
import { assets } from '../assets/assets'
import { FaLaptopMedical } from "react-icons/fa";

const Footer = () => {
    return (
        <div className='md:mx-10'>
            <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
                {/* left section */}
                <div className="left-box">
                    <img className='mb-5 w-40' src={assets.logo} alt="logo" />

                    {/* <div className="log flex gap-1 px-1 justify-center items-center">
        <FaLaptopMedical  className=' text-blue-600 text-4xl rounded-2xl'/>
        <h1 className='font-bold text-3xl text-blue-950 '>Prescripto</h1>
        </div> */}


                    <p className='w-full md:w-2/3 text-gray-600 leading-6'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                </div>

                {/* middle section */}
                <div className="middle-box">
                    <p className='text-xl font-medium mb-5'>COMPANY</p>
                    <ul className='flex flex-col gap-2 text-gray-600'>
                        <li>Home</li>
                        <li>About us</li>
                        <li>Delivery</li>
                        <li>Privacy policy</li>
                    </ul>

                </div>

                {/* right section */}
                <div className="right-box">
                    <p className='text-xl font-medium mb-5' >GET IN TOUCH</p>
                    <ul className='flex flex-col gap-2 text-gray-600' >
                        <li>+0-000-000-000</li>
                        <li>sonunigam0382002@gmail.com</li>

                        {/* Admin Link Added Here */}
                        <li className='mt-2'>
                            <a
                                href="https://prescripto-admin-beta-drab.vercel.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className='border border-slate-400 px-4 py-1.5 rounded-full shadow-2xl text-xs hover:bg-gray-100 transition-all font-semibold '
                            >
                                Admin Panel
                            </a>
                        </li>
                    </ul>

                </div>
            </div>
            {/* copyright section */}
            <div>
                <hr />
                <p className='py-5 text-sm text-center'>Copyright 2025 @SonuKumar - All Right Reserved.</p>
            </div>
        </div>
    )
}

export default Footer