import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { PORT } from "../../config";

function Logout(){
  const navigate = useNavigate();

  function handleLogout(e){
    e.preventDefault();
   
      axios.post(PORT+'/logout',{}, {withCredentials: true}).then((response)=>{
      if(response.data.success)
        {
          console.log("logout")
          navigate('/login')
          // props.setUser(null);
        }
      else{
        alert(response.data.message)
      }
      }).catch((error)=>{
        alert(error);
      })
    
  }
  return(
    <div className="logout">
      <button className='login_button' type='submit' onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Logout;