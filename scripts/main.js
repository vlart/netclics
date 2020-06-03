const IMAGE_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2'; 
const API_KEY = 'bec2f30924fdeacccc43f4664036f041'; 
const SERVER = 'https://api.themoviedb.org/3'

const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const tvShowList = document.querySelector('.tv-shows__list');
const modal = document.querySelector('.modal');
const cross = document.querySelector('.cross');
const tvShows = document.querySelector('.tv-shows');
const tvShowsHead = document.querySelector('.tv-shows__head');
const tvCardImg = document.querySelector('.tv-card__img');
const modalTitle = document.querySelector('.modal__title');
const genresList = document.querySelector('.genres-list');
const rating = document.querySelector('.rating');
const description = document.querySelector('.description');
const modalLink = document.querySelector('.modal__link');
const searchForm = document.querySelector('.search__form');
const searchFormInput = document.querySelector('.search__form-input');
const loader = document.querySelector('.loader');
const dropdown = document.querySelectorAll('.dropdown');
const pagination = document.querySelector('.pagination');

const loading = document.createElement('div');
loading.className = 'loading'

const DBServise = class {
    getData = async (url) => {
        const res = await fetch(url);
        if (res.ok) {
            return res.json();
        } else {
            throw new Error(`Bad luck from ${url}`)
        } 
    }
    getTestData = () => {
        return this.getData('test.json');
    }

    getTestCard = () => {
        return this.getData('card.json');
    }

    getSearchResult = query => {
        this.temp = `${SERVER}/search/tv?api_key=${API_KEY}&language=en-US&page=1&query=${query}&include_adult=false`
        return this.getData(this.temp);
    }

    getNextPage = page => {
        return this.getData(`${this.temp}&page=${page}`)
    }

    getTvShow = id => {
        return this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=en-US`);
    }

    getTopRated = () => this.getData(`${SERVER}/tv/top_rated?api_key=${API_KEY}&language=en-US`);


    getPopular = () => this.getData(`${SERVER}/tv/popular?api_key=${API_KEY}&language=en-US`);

    getAirToday = () => this.getData(`${SERVER}/tv/airing_today?api_key=${API_KEY}&language=en-US`);

    getAirWeek = () => this.getData(`${SERVER}/tv/on_the_air?api_key=${API_KEY}&language=en-US`);
    
}
const dbservice = new DBServise();


const renderCard = (res, target) => {
    tvShowList.textContent = '';

    if(!res.total_results) {
        loading.remove();
        tvShowsHead.textContent = 'Sorry, we couldn\'t find anything according to your request'; 
        tvShowsHead.style.cssText = 'color: red'; 
        return;
    } else {
        tvShowsHead.textContent = ''; 
        tvShowsHead.style.cssText = ''; 
    }

    tvShowsHead.textContent = target ? target.textContent : 'Search results...'; 
    tvShowsHead.style.cssText = ''; 

    res.results.forEach(item => {

        const {
            backdrop_path: backdrop, 
            name: title, 
            poster_path: poster, 
            id,
            vote_average: vote,
        } = item;

        const posterIMG = poster ? IMAGE_URL + poster : 'img/no-poster.jpg';
        const backdropIMG = backdrop ? IMAGE_URL + backdrop : '';
        const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '' ;


        const card = document.createElement('li')

        card.idTV = id;
        card.classList.add('tv-shows__item');

        card.innerHTML = `
            <a href="#" id="${id}" class="tv-card">
            ${voteElem}
            <img class="tv-card__img"
                src="${posterIMG}"
                data-backdrop="${backdropIMG}"
                alt="${title}">
            <h4 class="tv-card__head">${title}</h4>
        </a>
        `;
        loading.remove();
        tvShowList.append(card)
    })
    pagination.innerHTML = '';
    if (!target && res.total_pages > 1) {
        for (let i = 1; i <= res.total_pages; i ++) {
            pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`
        }
    }
}

searchForm.addEventListener('submit', e => {
    e.preventDefault();
    const value = searchFormInput.value.trim();
    searchFormInput.value = '';
    if (value) {
        tvShows.append(loading);
        dbservice.getSearchResult(value).then(renderCard);
    }
})

const closeDropdown = () => {
    dropdown.forEach(item => {
        console.log(item)
        item.classList.remove('active');
    })
};

hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
    closeDropdown();
});

document.body.addEventListener('click', e => {
    if(!e.target.closest('.left-menu')){
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
        closeDropdown();
    }
});

leftMenu.addEventListener('click', e => {
    e.preventDefault();
    const target = e.target;
    const dropdown = target.closest('.dropdown'); 
    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }
    if(target.closest('#top-rated')) {
        dbservice.getTopRated().then((res) =>renderCard(res, target));
    }
    if(target.closest('#popular')) {
        dbservice.getPopular().then((res) =>renderCard(res, target));
    }
    if(target.closest('#week')) {
        dbservice.getAirWeek().then((res) =>renderCard(res, target));
    }
    if(target.closest('#today')) {
        dbservice.getAirToday().then((res) =>renderCard(res, target));
    }
    if(target.closest('#search')) {
        tvShowList.textContent = '';
        tvShowsHead.textContent = '';
    }
});

//modal opener
tvShowList.addEventListener('click', e => {
    e.preventDefault();
    const target = e.target;
    const card = target.closest('.tv-card'); 
    if(card)  {
        loader.style.display = 'block';
        dbservice.getTvShow(card.id)
        .then(({
                poster_path: posterPath, 
                name: title, 
                genres, 
                vote_average: voteAvg, 
                homepage, 
                overview}) => {

            tvCardImg.src = posterPath? IMAGE_URL + posterPath : 'img/no-poster.jpg';
            modalTitle.textContent = title;
            genresList.textContent = '';
            for (const item of genres){
                genresList.innerHTML += `<li>${item.name}</li>`;
            }
            rating.textContent = voteAvg ? voteAvg : 'Not rated yet';
            description.textContent = overview;
            modalLink.href = homepage;
        }).then(() => {
            document.body.style.overflow = 'hidden';
            modal.classList.remove('hide');
        }).then(() => {
            loader.style.display = '';
            });
        } 
});

modal.addEventListener('click', e => {
    if (e.target.closest('.cross') || 
        e.target.classList.contains('modal')) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
});

changeImage = e => {
    const card = e.target.closest('.tv-shows__item');
    if(card){
        const img = card.querySelector('.tv-card__img');
        const tvCardBDImg = img.dataset.backdrop;
        if(tvCardBDImg) {
            [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src] ;
    };
}};

tvShowList.addEventListener('mouseover', changeImage)
tvShowList.addEventListener('mouseout', changeImage)

pagination.addEventListener('click', e => {
    //e.preventDefault();
    const target = e.target;

    if (target.classList.contains('pages')) {
        dbservice.getNextPage(target.textContent).then(renderCard)
    }
})