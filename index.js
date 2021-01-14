const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

function renderMovieList(data){
    let rawHTML = ''
    data.forEach((item) => {
        //title,image
        console.log(item)
        rawHTML += `
        <div class="col-sm-3">
                <div class="mb-2">
                    <div class="card">
                        <img class="card-img-top" src="${POSTER_URL + item.image}" alt="Card image cap">
                        <div class="card-body">
                          <h5 class="card-title">${item.title}</h5>
                        </div>
                        <div class="card-footer">
                            <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
                            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                          </div>
                    </div>
                </div>
            </div>`
    })

    dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount){
    const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
    let rawHTML = '' 

    for(let page = 1; page <= numberOfPages; page++){
        rawHTML +=`
        <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
        paginator.innerHTML = rawHTML
    }
}

function getMoviesByPage(page){
    //movies? "movies" or "filteredMovies"
    //設定data ＝ 如果filteredMovies是有東西的就給filteredMovies，如果是空的就給movies
    const data = filteredMovies.length ? filteredMovies: movies

    //page 1 >> movies 0~11
    //page 2 >> movies 12~23
    //page 3 >> movies 24~35
    // ...
    const starIndex = (page - 1) * MOVIES_PER_PAGE
    return data.slice(starIndex, starIndex + MOVIES_PER_PAGE)
}



function showMovieModal(id) {
    const modalTitle = document.querySelector('#movie-modal-title')
    const modalImage = document.querySelector('#movie-modal-image')
    const modalDate = document.querySelector('#movie-modal-date')
    const modalDescription = document.querySelector('#movie-modal-description')
    

    axios.get(INDEX_URL + id).then((response) => {
        //response.data.results
        const data = response.data.results
        
        modalTitle.innerText = data.title
        modalDate.innerText = 'Release date: ' + data.release_date
        modalDescription.innerText = data.description
        modalImage.innerHTML = `<img src="${
            POSTER_URL + data.image
        }" alt="movie-poster" class="img-fluid">`
    })
}

function addToFavorite(id){
     //console.log(id) //測試點擊+是否會取出id

    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = movies.find(movie => movie.id === id)
    
    if (list.some((movie) =>movie.id === id)){
        return alert('此電影已在收藏清單中!')
    }

    list.push(movie)
    console.log(list)

    // const jsonString = JSON.stringify(list)
    // console.log('jsonString: ',jsonString)
    // console.log('json object: ',JSON.parse(jsonString))

    localStorage.setItem('favoriteMovies', JSON.stringify(list))


}



dataPanel.addEventListener('click', function onPanelClicked(event){
    if (event.target.matches('.btn-show-movie')) {
        showMovieModal(Number(event.target.dataset.id))
    } else if (event.target.matches('.btn-add-favorite')) {
        addToFavorite(Number(event.target.dataset.id))

    }
})

paginator.addEventListener('click', function onPaginatorClicked(event){
    if(event.target.tagName !== 'A') return
    // console.log(event.target.dataset.page)
    const page = Number(event.target.dataset.page)
    renderMovieList(getMoviesByPage(page))
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
    event.preventDefault()
    console.log('click!')
    
    const keyword = searchInput.value.trim().toLowerCase()
    
    

    //如果沒有輸入值，會顯示;
    // if (!keyword.length){
    //     return alert('Please enter a valid string.')
    // }

    //指派filteredMovies是跟電影名稱一樣的字串
    filteredMovies = movies.filter((movie) =>
        movie.title.toLowerCase().includes(keyword)
    )


    //如果和電影名稱一樣的字串為0就會顯示找不到
    if(filteredMovies.length === 0){
        return alert('Cannot find movie with keyword: ' + keyword)
    }


    // for(const movie of movies){
    //     if (movie.title.toLowerCase().includes(keyword)){
    //         filteredMovies.push(movie)
    //     }
    // }
    renderPaginator(filteredMovies.length)
    renderMovieList(getMoviesByPage(1))
    
    

})


axios
.get(INDEX_URL)
.then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
}
)