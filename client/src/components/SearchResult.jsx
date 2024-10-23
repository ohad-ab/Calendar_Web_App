import React from "react";

function SearchResult(props){

  function handleAddButton(res){
    console.log('click')
  }

  return (
    <div className="search_result">
    <img className="result_image" src={props.imgSRC} />
    <a href={"/show?id="+props.id}>{props.name}</a>
    <p>Premiered at {props.premiered}</p>
    {props.network &&<p>Network:{props.network}</p>}
    {props.web && <p>Web channel: {props.web}</p>}
    <br/>
    </div>
  )
}

export default SearchResult;