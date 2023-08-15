import { useEffect, useState } from "react";

import BookingWidget from './../components/BookingWidget';
import PlaceAddress from "../components/AddressLink";
import PlaceGallery from "../components/PlaceGallery";
import axios from "axios";
import { useParams } from "react-router-dom"

export default function PlacePage(){
    const { id } = useParams();
    const [ place,setPlace ] = useState();

    useEffect(() => {
        if(!id){
            return;
        }
        axios.get(`places/${id}`)
        .then(res => {
            setPlace(res.data);
        })
    },[]);
    
    if(!place){
        return <>Loading..</>
    }


    return(
        <div className="mt-4 bg-gray-100 -mx-8 px-8 pt-8">
            <h1 className="text-3xl">{place?.title}</h1>
            <PlaceAddress>{place.address}</PlaceAddress>

            <PlaceGallery place={place} />

            <div className="mt-8 mb-4 grid gap-8 grid-cols-1 md:grid-cols-[2fr_1fr]">
                <div>
                    <div className="my-4">
                        <h2 className="font-semibold text-2xl">Description</h2>
                        {place.description}
                    </div>

                    Check-in: {place.checkIn} <br />
                    Check-out: {place.checkOut} <br />
                    Max number of guests: {place.maxGuests} <br />
                </div>

                <div>
                    <BookingWidget place={place} />
                </div>
            </div>

            <div className="bg-white -mx-8 px-8 py-8 border-t">
                <div>
                    <h2 className="font-semibold text-2xl">Extra info</h2>
                </div>
                <div className="mb-4 mt-2 text-sm text-gray-700 leading-5">{place.extraInfo}</div>
            </div>


        </div>
    )
}
