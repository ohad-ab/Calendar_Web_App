import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PORT } from "../../config";
/**
 * Component for displaying detailed information about a show.
 * Allows adding/removing from calendar and rating the show.
 *
 * @returns {JSX.Element|null}
 */
function Show(){
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('id');
  const [show , setShow] = useState({})
  const [added, setAdded] = useState(false);
  const [rating, setRating] = useState(null);
  const [userRate, setUserRate] = useState(null);
  const [starBlank, setStarBlank] = useState(5);
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    axios.get(PORT+'/show?id='+id, {withCredentials: true}).then((response)=>{
      if(response.data.user)
      {
        setShow(response.data.show);
        setAdded(response.data.added);
        setRating(response.data.totalRating);
        setStarBlank(Math.floor(response.data.totalRating));
        setUserRate(response.data.userRating);
      }
      else{
        navigate('/login');
      }
    })
  },[id, navigate])
  
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
    axios.post(PORT+'/delete', {id: show.id, rate: userRate}, {withCredentials: true}).then((response)=>{
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

  function handleMouseEnter(starNum){
    if (!userRate) {
      setHover(true);
      setStarBlank(starNum);
    }
  }
  function handleMouseLeave(){
      setHover(false);
      setStarBlank(Math.floor(rating));
  }

  function handleStarClick(rate){
    if (!userRate) {
      axios.post(PORT+'/rate', {show:show, rate: rate}, {withCredentials: true}).then((response)=>{
        setUserRate(rate);
        axios.get(PORT+'/show?id='+id, {withCredentials: true}).then((response)=>{
          if(response.data.user)
          {
            setRating(response.data.totalRating);
          }
          else{
            navigate('/login');
          }
        })
        }).catch((error)=>{
          alert(error);
        });
    }
      
  }

  const renderStars = () => {
  return Array.from({ length: 5 }, (_, index) => {
    const filled = index < starBlank || (index === starBlank && hover);
    const partial = index === Math.floor(rating) && !hover && !userRate;

    return (
      <svg
        key={`star${index}`}
        style={!userRate ? { cursor: 'pointer' } : {}}
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onMouseEnter={() => handleMouseEnter(index)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleStarClick(index + 1)}
      >
        <defs>
          <linearGradient id={`starGradient${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset={`${(rating - Math.floor(rating)) * 100}%`} stopColor="yellow" />
            <stop offset="0%" stopColor="white" />
          </linearGradient>
        </defs>
        <polygon
          points="12,2 15,9 22,9 17,14 18.5,21 12,17 5.5,21 7,14 2,9 9,9"
          fill={
            filled
              ? "yellow"
              : partial
              ? `url(#starGradient${index})`
              : "white"
          }
          stroke="black"
          strokeWidth="0.1"
        />
      </svg>
    );
  });
};

  return show.name && (
    <div className="show">
      <button className="back_from_search" onClick={handleBackButton}>Back to calendar</button>
      <img className="show_image" src={show.image.original} alt={`${show.name} poster`} />
      <h2>{show.name}</h2>
      {renderStars()}
      ({rating})
      <p>Premiered at {show.premiered}</p>
      {show.ended && <p>Ended at: {show.ended}</p>}
      <p>Genres: {show.genres.join(', ')}</p>
      {show.network &&<p>Network: {show.network.name}</p>}
      {show.webChannel && <p>Web channel: {show.webChannel.name}</p>}
      <p>Summary: {show.summary?.replace(/<[^>]+>/g, '').trim()}</p>
      {!added?<button onClick={handleAddButton}>{'Add To Calendar'}</button> : 
        <div className="showpage_buttons">
          <button onClick={handleDeleteButton}>{'Remove From Calendar'}</button>
        </div>
        }
    </div>
  )
}

export default Show;