import axios from "axios";
import * as $ from 'jquery';
import { ids } from "webpack";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");
const $episodesBtn = $(".Show-getEpisodes");

const BASE_URL = "http://api.tvmaze.com/";

// [
//   {
//     id: 1767,
//     name: "The Bletchley Circle",
//     summary:
//       `<p><b>The Bletchley Circle</b> follows the journey of four ordinary
//          women with extraordinary skills that helped to end World War II.</p>
//        <p>Set in 1952, Susan, Millie, Lucy and Jean have returned to their
//          normal lives, modestly setting aside the part they played in
//          producing crucial intelligence, which helped the Allies to victory
//          and shortened the war. When Susan discovers a hidden code behind an
//          unsolved murder she is met by skepticism from the police. She
//          quickly realises she can only begin to crack the murders and bring
//          the culprit to justice with her former friends.</p>`,
//     image:
//         "http://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg"
//   }
// ]

interface ShowInterface {
  id: number;
  name: string;
  summary: string;
  image: string | null;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
*/

function createShow(show: { show; }): ShowInterface {

  if (show.show.image === null) {
    return {
      id: show.show.id,
      name: show.show.name,
      summary: show.show.summary,
      image: null
    };
  } else {

    return {
      id: show.show.id,
      name: show.show.name,
      summary: show.show.summary,
      image: show.show.image.medium
    };
  }
}

async function getShowsByTerm(term: string): Promise<[]> {
  const response = await axios.get(`${BASE_URL}search/shows`, { params: { q: term } });
  const results: [] = response.data.map(show => {
    return createShow(show);
  });
  return results;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: ShowInterface[]) {
  $showsList.empty();

  for (let show of shows) {
    if (show.image === null) {
      show.image = "https://tinyurl.com/tv-missing";
    }
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

interface EpisodeInterface {
  id: number,
  name: string,
  season: string,
  number: string;
}

function createEpisode(episode): EpisodeInterface {
  return {
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number.toString()
  };
}

async function getEpisodesOfShow(id): Promise<[]> {
  const response = await axios.get(`${BASE_URL}shows/${id}/episodes`);
  const episodes = response.data.map(r => {
    console.log(createEpisode(r));
    return createEpisode(r);
  });
  return episodes;
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
  $episodesList.empty();

  for (let episode of episodes) {
    const $episode = $(
      `<li>
        <p>Name: ${episode.name}</p>
        <p>Season: ${episode.season}</p>
        <p>Number: ${episode.number}</p>
       </li>
      `);

    $episodesList.append($episode);
  }
  $episodesArea.show();
}

async function handleClick(evt) {

  const showId = +$(evt.target).closest(".Show").data("show-id");
  console.log("handleClick showId", showId);

  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);

}

$showsList.on("click", $episodesBtn, handleClick);