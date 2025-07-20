import React from "react";
/**
 * Component for the episode's details to show on a calendar day.
 *
 * @param {{ episode: Object }} props - Episode object containing name, season, air time, etc.
 * @returns {JSX.Element}
 */
function CalendarItem({episode}){
  return (
    <div className="calendar_item">
      <p>{episode.name}</p>
      <p>{episode.season}x{episode.episode_number}</p>
      {episode.air_time && <p>{episode.air_time}</p>}
      {episode.network && <p>Network: {episode.network}</p>}
      {episode.web_channel && <p>Web: {episode.web_channel}</p>}
      <br/>
    </div>
  )
}
export default CalendarItem;