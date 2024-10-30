import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PORT } from "../../config";

function Show(){
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('id');
  const [show , setShow] = useState({})
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    axios.get(PORT+'/show?id='+id, {withCredentials: true}).then((response)=>{
      if(response.data.user)
      {
        setShow(response.data.show);
        setAdded(response.data.added);
      }
      else{
        navigate('/login');
      }
    })
  },[])
  
  function handleAddButton(){
      axios.post(PORT+'/add', show, {withCredentials: true}).then((response)=>{
        if(response.status === 200)
          setAdded(true)
        else{
          console.log(response.statusText)
        }
        }).catch((error)=>{
          alert(error);
        })
  }

  function handleDeleteButton(){
    console.log(show.id)
    axios.post(PORT+'/delete', {id: show.id}).then((response)=>{
      alert('The show has been removed from the calendar ')
      setAdded(false);
    }).catch((error)=>{
      alert(error.statusText);
    })
  }
  function handleBackButton(event){
    event.preventDefault();
    navigate(`/`); 
  }

  return show.name && (
    <div className="show">
      <button className="back_from_search" onClick={handleBackButton}>Back to calendar</button>
      <img className="show_image" src={show.image.original} />
      <h2>{show.name}</h2>
      <p>Premiered at {show.premiered}</p>
      {show.ended && <p>Ended at: {show.ended}</p>}
      <p>Genres: {show.genres.join(', ')}</p>
      {show.network &&<p>Network: {show.network.name}</p>}
      {show.webChannel && <p>Web channel: {show.webChannel.name}</p>}
      <p>Summary: {show.summary.slice(show.summary.search(',')+1,-4)}</p>
      {!added?<button onClick={handleAddButton}>{'Add To Calendar'}</button> : 
        <div className="showpage_buttons">
          {/* <button onClick={()=>navigate('/')}>{'View On Calendar'}</button> */}
          <button onClick={handleDeleteButton}>{'Remove From Calendar'}</button>
        </div>
        }
    </div>
  )
}

export default Show;