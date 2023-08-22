import { Navigate, useParams } from "react-router-dom";
import { useContext, useState } from "react"

import AccountsNav from "../components/AccountsNav";
import PlacesPage from "./PlacesPage";
import { UserContext } from "../UserContext"
import axios from "axios";

export default function ProfilePage(){
    const [ redirect, setRedirect ] = useState(null);
    const { user, ready, setUser } = useContext(UserContext);
    let { subpage } = useParams();
    if(subpage === undefined){
        subpage = 'profile';
    }

    const handleLogout = () => {
        axios.post('/logout')
        .then(res => {
            if(res.data){
                setUser(null);
                setRedirect('/');
            }
        })
    }

    if(!ready){
        return <div>Loading...</div>
    }
    
    if(ready && !user && !redirect){
        return <Navigate to={'/login'} />
    }

    if(redirect){
        return <Navigate to={redirect} />
    }
    
    return(
        <>
            <div>
                <AccountsNav />
                {
                    subpage === 'profile' && (
                        <div className="">
                            <div className="text-center max-w-lg mx-auto bg-gray-200 px-4 py-8 rounded-2xl">
                                Logged in as <b>{user.name}</b> ({user.email})
                                <button className="primary max-w-sm mt-2" onClick={handleLogout}>Logout</button>
                            </div>
                        </div>
                    )
                }
                {
                    subpage === 'places' && <PlacesPage />
                }
            </div>
        </>
    )
}