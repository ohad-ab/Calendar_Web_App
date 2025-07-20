import { Link } from "react-router-dom";

/**
 * Component displaying a single search result for a TV show.
 *
 * @param {{
 *   id: number,
 *   name: string,
 *   premiered: string,
 *   network?: string,
 *   web?: string,
 *   imgSRC: string
 * }} props - The show details
 * @returns {JSX.Element}
 */
function SearchResult(props){

  return (
    <div className="search_result">
    <img className="result_image" src={props.imgSRC} alt={`${props.name} poster`}/>
    <Link to={`/show?id=${props.id}`}>{props.name}</Link>
    {props.network &&<p>Network:{props.network}</p>}
    {props.web && <p>Web channel: {props.web}</p>}
    <br/>
    </div>
  )
}

export default SearchResult;