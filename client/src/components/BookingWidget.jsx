import { useContext, useEffect, useState } from "react"

import { Navigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import axios from 'axios';
import { differenceInCalendarDays } from 'date-fns';

export default function BookingWidget({place}){
    const { user } = useContext(UserContext);
    const [ checkIn, setCheckIn ] = useState('');
    const [ checkOut, setCheckOut ] = useState('');
    const [ numberOfGuests, setNumberOfGuests ] = useState(1);
    const [ name ,setName ] = useState('');
    const [ phone ,setPhone ] = useState('');
    const [ redirect , setRedirect ] = useState('');

    useEffect(() => {
        if(user){
            setName(user.name);
        }
    },[user]);

    let numberOfNights = 0;
    if(checkIn && checkOut){
        numberOfNights = differenceInCalendarDays(new Date(checkOut), new Date(checkIn));
    }

    const handleBooking = () => {
        const data = { 
            place: place._id, 
            price: numberOfNights * place.price,
            checkIn , checkOut, numberOfGuests, name , phone };
        axios.post('/bookings', data )
            .then(res => {
                console.log(res.data._id)
                setRedirect(`/account/bookings/${res.data._id}`)
            })
            .catch(err => console.error(err));
        
    }
    
    if(redirect){
        return <Navigate to={redirect} />
    }
    return(
        <>
            <div className="bg-white shadow p-4 rounded-2xl">
                <div className="text-2xl text-center">
                    Price: ₹{place.price} / per night
                </div>
                <div className="border rounded-2xl mt-4">
                    <div className="flex">
                        <div className="py-3 px-4">
                            <label>Check in:</label>
                            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}/>
                        </div>
                        <div className="py-3 px-4 border-l">
                            <label>Check out:</label>
                            <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}/>
                        </div>
                    </div>
                        
                    <div className="py-3 px-4 border-t">
                        <label>Number of guests:</label>
                        <input type="number" value={numberOfGuests} onChange={(e) => setNumberOfGuests(e.target.value)}/>
                    </div>

                    {numberOfNights > 0 && (
                       <div className="py-3 px-4 border-t">
                            <label>Your full name:</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)}/>
                       
                            <label>Phone:</label>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}/>
                        </div> 
                    )}
                </div> 
                <button className="primary mt-4" onClick={handleBooking}>
                    Book this place
                    {numberOfNights > 0 && (
                        <span> ₹{numberOfNights * place.price} </span>
                    )}
                </button>
            </div>
        </>
    )
}