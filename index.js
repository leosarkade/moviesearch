const searchPage = document.getElementById("search-page")
const myWatchlistPage = document.getElementById("my-watchlist-page")
const pageTitle = document.getElementById("page-title")
const myWatchlistBtn = document.getElementById('my-watchlist-btn')
let currentPage = "search-page"

localStorage.clear()
console.log("local storage cleared")

document.addEventListener("click", (e) =>{
    
    if(e.target.classList.contains('watchlist-add-btn')){
        updateMyWatchlist(e.target.parentElement.id, 'add')
        renderMyWatchlistPage()
    } else if(e.target.classList.contains('watchlist-remove-btn')){
        updateMyWatchlist(e.target.parentElement.id, 'remove')
        renderMyWatchlistPage()
    }
    
    if(e.target.id == "my-watchlist-btn") {
        changePage()
    }
})

document.addEventListener("search", async (e) => {
    if(e.target.value != ''){
        let movies = await getMovieDetailsBySearch(e.target.value)
        await renderSearchPage(movies)
        if(currentPage == "my-watchlist-page"){
            changePage()
        }
        e.target.value = ''
    }
        
})

async function getMovieDetailsBySearch(search){
    const res = await fetch(`https://www.omdbapi.com/?apikey=4bf9ad2e&s=${search}`)
    const data = await res.json()
    let imdbIds = []
    for (const movie of data.Search){
        imdbIds.push(movie.imdbID)
    }
    return getMovieDetailsByImdbId(imdbIds)
}

async function getMovieDetailsByImdbId(ids){
    let movieArray = []
    for (const id of ids){
        const res = await fetch(`https://www.omdbapi.com/?apikey=4bf9ad2e&i=${id}`)
        const data = await res.json()        
        movieArray.push(data)
    }
    return movieArray
}

function updateMyWatchlist(imdbID, action){
    let oldInfo = JSON.parse(localStorage.getItem('myWatchlist') || '[]');
    if(!oldInfo.includes(imdbID) && action == 'add'){
        oldInfo.push(imdbID)        
    } else if(oldInfo.includes(imdbID) && action == 'remove'){
        const index = oldInfo.indexOf(imdbID);
        oldInfo.splice(index, 1); 
    }
    localStorage.setItem('myWatchlist', JSON.stringify(oldInfo));
}

function changePage(){
    
    searchPage.classList.toggle("hidden")
    myWatchlistPage.classList.toggle("hidden") 
    
    if(currentPage == "search-page"){
        pageTitle.textContent = "My Watchlist"
        currentPage = "my-watchlist-page"
        myWatchlistBtn.value = "Search"
    } else if(currentPage == "my-watchlist-page"){
        pageTitle.textContent = "Find your film"
        currentPage = "search-page"
        myWatchlistBtn.value = "My Watchlist"
    }
}

function renderSearchPage(data) {
    searchPage.innerHTML = buildHtml(data, "add")
}

async function renderMyWatchlistPage() {
    let imdbIds = JSON.parse(localStorage.getItem('myWatchlist') || [])
    let data = await getMovieDetailsByImdbId(imdbIds)   
    myWatchlistPage.innerHTML = buildHtml(data, "remove")
}

function buildHtml(data, addRemove) {
    let html = `` 
    let addRemoveBtn = ``
    if(addRemove == "add") {
        addRemoveBtn = `<button class="watchlist-add-btn"><i class="fa-solid fa-circle-plus"></i>Watchlist</button>`        
    } else if(addRemove == "remove") {
        addRemoveBtn = `<button class="watchlist-remove-btn"><i class="fa-solid fa-circle-minus"></i>Remove</button>`        
    }

    for (let i=0; i<data.length; i++){
        html += 
        `
        <div class="movie-card">
            <img src="${data[i].Poster}">
            <div class="movie-details">
                <div class="movie-header">
                    <div class="movie-title">
                        <h2>${data[i].Title}</h2>
                    </div>
                    <div class="movie-rating">
                        <i class="fa-solid fa-star fa-xs" style="color: #FFD43B;"></i>
                    </div>
                    <p>${data[i].Rated}</p>
                </div>
                <div class="movie-info" id="${data[i].imdbID}">
                    <div class="movie-runtime">${data[i].Runtime}</div>
                    <div class="movie-genre">${data[i].Genre}</div>
                    ${addRemoveBtn}
                </div>
                <div class="movie-description">
                    <p>${data[i].Plot}</p>
                </div>
            </div>
            <hr class="divider">
        </div>
        `
    }
    return html
}