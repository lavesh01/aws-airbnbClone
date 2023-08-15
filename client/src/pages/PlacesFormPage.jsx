import { Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import AccountsNav from "../components/AccountsNav";
import Perks from "../components/Perks";
import PhotosUploader from "../components/PhotosUploader";
import axios from 'axios';

export default function PlacesFormPage(){
    const { id } = useParams();
    const [ title, setTitle ] = useState('');
    const [ address, setAddress ] = useState('');
    const [ addedPhotos, setAddedPhotos ] = useState([]);
    const [ description, setDescription ] = useState('');
    const [ perks, setPerks ] = useState([]);
    const [ extraInfo, setExtraInfo ] = useState('');
    const [ checkIn, setCheckIn ] = useState('');
    const [ checkOut, setCheckOut ] = useState('');
    const [ maxGuests, setMaxGuests ] = useState(1);
    const [ redirect , setRedirect ] = useState(false);
    const [ price , setPrice ] = useState(1000);

    useEffect(() => {
        if(!id){
            return;
        }

        axios.get(`/places/${id}`)
        .then(res => {
            const { data } = res;
            setTitle(data.title);
            setAddress(data.address);
            setAddedPhotos(data.photos);
            setDescription(data.description);
            setPerks(data.perks);
            setExtraInfo(data.extraInfo);
            setCheckIn(data.checkIn);
            setCheckOut(data.checkOut);
            setMaxGuests(data.maxGuests);
            setPrice(data.price);
        })
        .catch(err => console.error(err));
        
    },[id]);

    const preInput = (text,description) => {
        return  (
            <>
                <h2 className="text-2xl mt-4">{text}</h2>
                <p className="text-gray-500 text-sm" >{description}</p>
            </>
        )
    };

    const savePlace = (e) => {
        e.preventDefault();
        const placeData = { title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests,price };

        if(id){
            axios.put('/places', {id, ...placeData} )
            .then(response => {
                const {data} = response;
                setRedirect(true);
            })
            .catch(err => console.error(err));
        }else{
            axios.post('/places', placeData )
            .then(response => {
                const {data} = response;
                setRedirect(true);
            })
            .catch(err => console.error(err));
        }
        
    }
    
    if(redirect){
        return <Navigate to={'/account/places'} />
    }

    return (
        <>
        <div>
                <AccountsNav />
                <form onSubmit={savePlace} >
                    {preInput('Title','Title for your place , should be short and catch as in the advertisement.')}
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="title, for example: My lovely apartment." />
               
                    {preInput('Address','Address to this place')}
                    <input  type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="address" />
            
                    {preInput('Photos','more = better')}
                    <PhotosUploader addedPhotos={addedPhotos} setAddedPhotos={setAddedPhotos} />
                    
                    {preInput('Description','Description of the place')}
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)}></textarea>

                    {preInput('Perks','Select all the perks of your place')}
                    <Perks perks={perks} setPerks={setPerks} />

                    {preInput('Extra info','House rules, etc')}
                    <textarea value={extraInfo} onChange={(e) => setExtraInfo(e.target.value)} ></textarea>

                    {preInput('Check in&out times','Add check in and out time, remember to have some time window for cleaning the room between guests.')}
                    <div className="mt-2 grid gap-2 grid-cols-2 md:grid-cols-4">
                        <div>
                            <h3 className="mb-1">Check in time</h3>
                            <input type="text" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} placeholder="14:00" />
                        </div>
                        <div>
                            <h3 className="mb-1">Check out time</h3>
                            <input type="text" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} placeholder="14:00" />
                        </div>
                        <div>
                            <h3 className="mb-1">Max number of guests</h3>
                            <input type="number" value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)} placeholder="2" />
                        </div>
                        <div>
                            <h3 className="mb-1">Price per night</h3>
                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="1000" />
                        </div>
                    </div>

                    <button className="primary my-4">Save</button>
                </form>
            </div>
        </>
    )
}