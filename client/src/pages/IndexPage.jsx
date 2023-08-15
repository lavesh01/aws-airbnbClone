import { useEffect, useState } from "react"

import { Link } from "react-router-dom";
import axios from "axios";

export default function IndexPage() {
    const [ places , setPlaces ] = useState([]);

    useEffect(() => {
        axios.get('/places')
        .then(res => {
            setPlaces([...res.data,...res.data,...res.data]);
        })
        .catch((err) => console.error(err));
    },[]);
    
    return(
        <>
        <div className="grid gap-x-6 gap-y-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mt-8">
            {places?.map((place,index) => {
                return <Link to={`/place/${place._id}`} key={index}>
                    <div className="bg-gray-500 rounded-2xl flex mb-2">
                        {place.photos?.[0] && (
                            <img className="rounded-2xl object-cover aspect-square" src={`http://localhost:4000/uploads/${place.photos[0]}`} alt="photo" />
                        )}
                    </div>    
                    <h2 className="font-bold">{place.address}</h2>
                    <h3 className="text-sm text-gray-500">{place.title}</h3>
                    <div className="mt-2">
                        <span className="font-bold">₹{place.price}</span> night
                    </div>
                </Link>
            })}
        </div>
      </>
    )
}