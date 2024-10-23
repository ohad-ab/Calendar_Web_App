import React from "react";
 
function CalendarItem({episode}){
  return (
    <div className="calendar_item">
      <p>{episode.name}</p>
      <p>{episode.season}x{episode.episode_number}</p>
      {episode.air_time && <p>{episode.air_time}</p>}
      {episode.network && <p>{episode.network}</p>}
      {episode.web_channel && <p>{episode.web_channel}</p>}
      <br/>
    </div>
  )
}
export default CalendarItem;