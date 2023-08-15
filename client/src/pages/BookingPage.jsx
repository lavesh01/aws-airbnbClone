import { useEffect, useState } from "react";

import AddressLink from "../components/AddressLink";
import BookingDates from "../components/BookingDates";
import PlaceGallery from "../components/PlaceGallery";
import axios from "axios";
import { useParams } from "react-router-dom"

export default function BookingPage(){
    const [ booking, setBooking ] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        if(id){
            axios.get('/bookings').then(response => {
                const foundBooking = response.data.find(({_id}) => _id === id);
                if(foundBooking){
                    setBooking(foundBooking);
                }
            })
            .catch(err => console.error(err));
        }
    },[id]);

    if(!booking){
        return <>Loading..</>;
    }

    return(
        <div className="my-8">
            <h1 className="text-3xl">{booking.place.title}</h1>
            <AddressLink className="my-2 block">{booking.place.address}</AddressLink>
            <div className="flex justify-between items-center bg-gray-200 p-6 mb-6 rounded-2xl">
                <div>
                    <h2 className="text-2xl mb-4">Your booking information</h2>
                    <BookingDates booking={booking} />
                </div>
                <div className="bg-primary p-6 text-white rounded-2xl">
                    <div>Total price</div>
                    <div className="text-3xl">₹{booking.price}</div>
                </div>
            </div>
            <PlaceGallery place={booking.place} />
        </div>
    )
}
