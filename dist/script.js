const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";

const MOVIES_PER_PAGE = 12;
let currentPage = 1;

const movies = [];
let filteredMovies = [];

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const changeModeBox = document.querySelector("#change-mode-box");

let viewMode = localStorage.getItem("view-mode");

function renderMovieListByCard(data) {
  let rawHTML = "";

  data.forEach((item) => {
    // title, image
    rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img
            src="${POSTER_URL + item.image}"
            class="card-img-top"
            alt="Movie Poster"
          />
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${
              item.id
            }">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${
              item.id
            }">+</button>
          </div>
        </div>
      </div>
    </div>`;
  });

  dataPanel.innerHTML = rawHTML;
}

function renderMovieListByList(data) {
  let rawHTML = "";

  data.forEach((item) => {
    rawHTML += `
      <ul class="list-group" id="list-mode">
        <li class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">${item.title}</h5>
          <div>
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </li>
      </ul>`;
  });
  dataPanel.innerHTML = rawHTML;
}

function renderPaginator(amount) {
  //???????????????
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item ${page === currentPage ? "active" : ""}">
        <a class="page-link" href="#" data-page="${page}">${page}</a>
      </li>`;
  }

  paginator.innerHTML = rawHTML;
}

function getMoviesByPage(page) {
  // page 1 -> movies 0 - 11
  // page 2 -> movies 12 - 23
  // page 3 -> movies 24 - 35
  // ...
  const data = filteredMovies.length ? filteredMovies : movies;
  //???????????? index
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  //???????????????????????????
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    // response.data.results
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`;
  });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  // ??? find ????????????????????????????????? id ??????????????????????????????????????? movie
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    return alert("??????????????????????????????!");
  }
  // ??? movie ??????????????????
  list.push(movie);
  // ???????????? localStorage.setItem??????????????????????????????????????? local stroage
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

changeModeBox.addEventListener("click", function onChangeModeBoxClicked(event) {
  // if (event.target.matches("#card-mode-button")) {
  //   renderMovieListByCard(getMoviesByPage(currentPage));
  //   localStorage.setItem("view-mode", "card");
  //   viewMode = localStorage.getItem("view-mode");
  // } else if (event.target.matches("#list-mode-button")) {
  //   renderMovieListByList(getMoviesByPage(currentPage));
  //   localStorage.setItem("view-mode", "list");
  //   viewMode = localStorage.getItem("view-mode");
  // }

  let movieData = getMoviesByPage(currentPage);
  let eventId = event.target.id
  let mode = eventId.substring(0, eventId.indexOf("-"));
  localStorage.setItem("view-mode", mode);
  viewMode = localStorage.getItem("view-mode");

  if (mode === "card") {
    renderMovieListByCard(movieData);
  }

  if (mode === "list") {
    renderMovieListByList(movieData);
  }
});

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  //???????????????????????? a ???????????????
  if (event.target.tagName !== "A") return;
  //?????? dataset ????????????????????????
  currentPage = Number(event.target.dataset.page);
  if (viewMode === "list") {
    renderMovieListByList(getMoviesByPage(currentPage));
  } else {
    renderMovieListByCard(getMoviesByPage(currentPage));
  }
  if (filteredMovies.length === 0) {
    renderPaginator(movies.length);
  } else {
    renderPaginator(filteredMovies.length);
  }
});

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  //??????????????????
  event.preventDefault();
  //?????????????????????
  const keyword = searchInput.value.trim().toLowerCase();

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  //???????????????????????????????????????
  if (filteredMovies.length === 0) {
    return alert("Cannot find any movie with keyword:" + keyword);
  }

  if (viewMode === "list") {
    //??????????????? 1 ??????????????????
    renderMovieListByList(getMoviesByPage(1));
  } else {
    renderMovieListByCard(getMoviesByPage(currentPage));
  }

  //???????????????
  renderPaginator(filteredMovies.length);
});

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    if (viewMode === "list") {
      renderMovieListByList(getMoviesByPage(1));
    } else {
      renderMovieListByCard(getMoviesByPage(1));
    }
  })
  .catch((err) => console.log(err));