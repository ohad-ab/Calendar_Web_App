import React from "react";

function CalendarItemCard({episodes, fadeOut}){
  return (
    <div className={`calendar_info_card ${fadeOut?'fade_out':'fade_in'}`}>
    {episodes.map(episode => {
      return(
        <div className="calendar_info_card_block" key={episode.episode_id}>
        <p style={{fontWeight: 'bold', fontSize:'14px'}}>{episode.name}</p>
        <p>Season {episode.season}</p>
        <p>Episode {episode.episode_number}</p>
        <p>"{episode.episode_name}"</p>
        {episode.air_time && <p>{episode.air_time}</p>}
        {episode.network && <p>{episode.network}</p>}
        {episode.web_channel && <p>{episode.web_channel}</p>}
        <a href={episode.url}>Series Site</a><br/>
        <a href={`show?id=${episode.show_id}`}>Series Page</a>
        <br/>
      </div>)
      })
    }
    </div>
    
    
  )
}

export default CalendarItemCard;