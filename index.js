const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const changeMode = document.querySelector("#change-mode");
const movies = [];
let filteredMovies = [];
const MOVIES_PER_PAGE = 12;
let nowMode = 'card'
let nowPage = 1

// api取出
axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieCard(getMoviesByPage(1))
})


// 監聽現在模式
changeMode.addEventListener("click", function ChangeModeSubmitted(event) {
  if (event.target.matches("#cardMode")) {
   
    nowMode = 'card'
  } else if (event.target.matches("#listMode")) {
    nowMode = 'list'
  }
  switchMode()
})

// 執行切換模式 重新渲染
function switchMode () {
  if (nowMode === 'card') {
    renderMovieCard(getMoviesByPage(nowPage)) 
  } else {
    renderModalList(getMoviesByPage(nowPage))
  }
}


// 搜尋
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault()  //取消預設事件
  nowPage = 1
  const keyword = searchInput.value.trim().toLowerCase()
  filteredMovies = movies.filter( movie => movie.title.toLowerCase().includes(keyword) )
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }
  renderPaginator(filteredMovies.length)
  switchMode()
})

searchForm.addEventListener("input", function (event) {
  if (searchInput.value === ''){
    filteredMovies = []
    renderPaginator(movies.length)
    switchMode()
  }
})




// 判斷按鈕
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 監聽頁數
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return //如果被點擊的不是 a 標籤，結束
  nowPage = Number(event.target.dataset.page) //透過 dataset 取得被點擊的頁數
  switchMode()
})

// 切割頁數
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE //計算起始 index
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE) //回傳切割後的新陣列
}

// 設定總頁數
function renderPaginator (amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE) //計算總頁數
  let rawHTML = ""  //製作 template
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML;
}

//收藏
function addToFavorite (id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []
  const movie = movies.find( movie => movie.id === id)
  if (list.some( movie => movie.id === id)) {
    return alert("此電影已經在收藏清單中！")
  }
  list.push(movie)
  localStorage.setItem("favoriteMovies", JSON.stringify(list))
}

//彈出視窗電影介紹
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalImage = document.querySelector("#movie-modal-image")
  const modalDate = document.querySelector("#movie-modal-date")
  const modalDescription = document.querySelector("#movie-modal-description")
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = "Release date: " + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`
  });
}

// 渲染 Card模式
function renderMovieCard (data) {
  let rawHTML = ""
  data.forEach( item => {
    // title, image
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${
          POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-user='text' data-toggle="modal" data-target="#movie-modal" data-id="${
            item.id
          }">More</button>
          <button class="btn btn-info btn-add-favorite" data-user='text' data-id="${
            item.id
          }">+</button>
        </div>
      </div>
    </div>
  </div>`;
  });
  dataPanel.innerHTML = rawHTML;
}

// 渲染 List模式
function renderModalList (data) {
  let rawHTML = ""
  rawHTML += '<table class="table"><tbody>'
  data.forEach((item) => {
    rawHTML += `
    <tr>
      <td>
          <h5 class="card-title">${item.title}</h5>
      </td>
      <td>
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
      </td>
    </tr>
    `
  })
  rawHTML += '</tbody></table>'
  dataPanel.innerHTML = rawHTML;
}
