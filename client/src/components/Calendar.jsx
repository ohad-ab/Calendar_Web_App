import React, { useEffect, useState } from "react";
import CalendarItem from "./CalendarItem";
import CalendarItemCard from "./CalendarItemCard";
import prevIcon from "../../images/icons/left-arrow.png"
import nextIcon from "../../images/icons/arrow-point-to-right.png"
 
function Calendar(props){
  const shows = props.shows;
  const date = new Date();
  const [currMonth, setCurrMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [infoVisible, setInfoVisible] = useState(false);
  const [infoFadeOut, setInfoFadeOut] = useState(false);
  
  //A dictionary where the keys are days of the month and the values are arrays with episodes on that day
  const episodesByDate = shows.reduce((acc, show) => {
    const day = show.air_date.split('T')[0];
    if (!acc[day]) acc[day] = [];
    acc[day].push(show);
    return acc;
  }, {});

  // const arr = Array.from({length: 29},(_,i)=>{
  //   const episode = episodesByDate[new Date(Date.UTC(currMonth.getFullYear(), currMonth.getMonth(), i+1)).toISOString()];
  //   return episode

  // })
  const firstDayOfMonth = new Date(currMonth.getFullYear(), currMonth.getMonth(), 1).getDay();
  const lastDayInMonth = new Date(currMonth.getFullYear(), currMonth.getMonth()+1, 0).getDay();
  const daysInMonth = new Date(currMonth.getFullYear(), currMonth.getMonth()+1, 0).getDate();
  const numberOfRows = Math.ceil((firstDayOfMonth + daysInMonth + 6 -lastDayInMonth)/7);
  const rowsStyle = `30px repeat(${numberOfRows}, 170px)`;

  function renderCalendar(){
    const calendar =
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day)=>(
      <div key={day} className="day-name">{day}</div>
    ))
    //Render blank boxes for days on the first week that are not in the month
    for(let i=0; i<firstDayOfMonth; i++){
      calendar.push(<p key={'bs'+i} className="day blank"></p>)
    }
    //For each day render info for every episode on that day, if exists
    for(let day=1; day<=daysInMonth; day++){
      const currDate = new Date(Date.UTC(currMonth.getFullYear(), currMonth.getMonth(), day));
        const episodes = episodesByDate[currDate.toISOString().split('T')[0]];
        const dayClass= `day ${episodes?'occ_day':''}`
        calendar.push(
          <div key={day} className={dayClass} onClick={(e) => handleInfo(e,day , episodes)}>
            <p  className="day_date">{day}</p>
            <div className="calendar_item_list">
              {episodes && episodes.map(e=>(<CalendarItem key={e.episode_id} episode={e}/>))}
              
            </div>
            {episodes && infoVisible && selectedDay === day && ( // Render info card conditionally
                <CalendarItemCard key={day+'c'} episodes={episodes} fadeOut={infoFadeOut}/>
            )}
          </div>)
        
    }
      for(let i=0; i< 6 - lastDayInMonth; i++){
        calendar.push(<p key={'be'+i} className="day blank"></p>)
      }
      return calendar;
  }

  //Info card fade out functionality
  async function fadeOut() {
    setInfoFadeOut(true)

      await wait(300);
      
        setInfoVisible(false);
        setSelectedDay(null);
        setInfoFadeOut(false); 
  }

  //Toggle info card
  async function handleInfo(e, day, episodes){
    const dayElement = e.target.closest('.calendar_info_card');
    if(selectedDay && !dayElement)//If info card is open and clicked ouside of it, close it
    {
    await fadeOut();
      
    }
    if(episodes && selectedDay !=day){//If info is avaiable and the card is closed
      setInfoVisible(true);
    setSelectedDay(day);
    }
  }
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleBodyClick = (event) => {
    const calendarElement = document.querySelector('.calendar');
    const dayElement = event.target.closest('.calendar_info_card');
    // If click is outside the calendar or on a different day, close the info card
    
    if ((!calendarElement.contains(event.target)) && !dayElement) {
      fadeOut();
    }
  };
  useEffect(() => {
    // Add click event listener to the body
    document.body.addEventListener('click', handleBodyClick);

    // Cleanup the event listener on unmount
    return () => {
      document.body.removeEventListener('click', handleBodyClick);
    };
  }, []);

  function handleLeftArrowClick(){
    setCurrMonth(new Date(currMonth.getFullYear(), currMonth.getMonth()-1))
    if(infoVisible)
      fadeOut()
  }

  function handleRightArrowClick(){
    setCurrMonth(new Date(currMonth.getFullYear(), currMonth.getMonth()+1))
    if(infoVisible)
      fadeOut()
  }

  return(
    <div className="calendar">
      {/* {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day)=>(
        <div key={day} className="day-name">{day}</div>
      ))}
        {Array.from({length: firstDayOfMonth},(_,i)=>{
          return <p key={'bs'+i} className="day blank"></p>
        })}
        {Array.from({length: daysInMonth},(_,i)=>{
          const currDate = new Date(Date.UTC(calMonth.year, calMonth.month, i+1));
          currDay++;
          const episodes = episodesByDate[currDate.toISOString().split('T')[0]];
          if (!episodes)
            return <div className="day"><p key={currDay} className="day_date">{currDay}</p></div>
          return episodes &&<div className="day"><p className="day_date">{currDay}</p>
            {episodes.map(e=>(<CalendarItem key={e.episode_id} episode={e}/>))}
            </div>

        })}
        {Array.from({length: 6 - lastDayInMonth},(_,i)=>{
          return <p key={'be'+i} className="day blank"></p>
        })} */}
      <div className="month_change">
        <button className="prev_month arrow_button" onClick={handleLeftArrowClick}>
        <img className="arrow" src={prevIcon}/>
        </button>
        <h3>{currMonth.toLocaleString('default', {month: 'long'})} {currMonth.getFullYear()}</h3>
        <button className="next_month arrow_button" onClick={handleRightArrowClick}>
          <img className="arrow" src={nextIcon}/>
        </button>
      </div>
        
      <div className="month_calendar" style={{gridTemplateRows: rowsStyle}}>
        {renderCalendar()}
      </div>
    </div>
  )
}
export default Calendar;