import { useEffect, useState, useMemo } from "react";
import CalendarItem from "../components/CalendarItem";
import CalendarItemCard from "../components/CalendarItemCard";
import prevIcon from "../../images/icons/left-arrow.png"
import nextIcon from "../../images/icons/arrow-point-to-right.png"

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
 
/**
 * Renders a monthly calendar view with episodes marked on their air dates.
 *
 * @param {{ shows: Array<Object> }} props - Array of episode objects with air_date, episode_id, etc.
 * @returns {JSX.Element}
 */
function Calendar({shows}){
  const date = new Date();
  const [currMonth, setCurrMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [infoVisible, setInfoVisible] = useState(false);
  const [infoFadeOut, setInfoFadeOut] = useState(false);
  
  //A dictionary where the keys are days of the month and the values are arrays with episodes on that day
  const episodesByDate = useMemo(()=>{
    return shows.reduce((acc, show) => {
      const day = show.air_date.split('T')[0];
      if (!acc[day]) acc[day] = [];
      acc[day].push(show);
      return acc;
  }, {});
  }) 

  const firstDayOfMonth = new Date(currMonth.getFullYear(), currMonth.getMonth(), 1).getDay();
  const lastDayInMonth = new Date(currMonth.getFullYear(), currMonth.getMonth()+1, 0).getDay();
  const daysInMonth = new Date(currMonth.getFullYear(), currMonth.getMonth()+1, 0).getDate();
  const numberOfRows = Math.ceil((firstDayOfMonth + daysInMonth + 6 -lastDayInMonth)/7);
  const rowsStyle = `30px repeat(${numberOfRows}, 170px)`;
  const INFO_FADE_DURATION = 300;

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
        const dayClassName= `day ${episodes?'occ_day':''}`
        calendar.push(
          <div key={day} className={dayClassName} onClick={(e) => handleInfo(e,day , episodes)}>
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

      await wait(INFO_FADE_DURATION);
      
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
    if(episodes && selectedDay !==day){//If info is avaiable and the card is closed
      setInfoVisible(true);
    setSelectedDay(day);
    }
  }

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
      <div className="month_change">
        <button className="prev_month arrow_button" onClick={handleLeftArrowClick}>
        <img className="arrow" src={prevIcon} alt="Previous month"/>
        </button>
        <h3>{currMonth.toLocaleString('default', {month: 'long'})} {currMonth.getFullYear()}</h3>
        <button className="next_month arrow_button" onClick={handleRightArrowClick}>
          <img className="arrow" src={nextIcon} alt="Next month"/>
        </button>
      </div>
        
      <div className="month_calendar" style={{gridTemplateRows: rowsStyle}}>
        {renderCalendar()}
      </div>
    </div>
  )
}
export default Calendar;