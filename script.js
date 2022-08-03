const moviesCard = document.querySelector('.movies');
const buttonPrev = document.querySelector('.btn-prev');
const buttonNext = document.querySelector('.btn-next');
const input = document.querySelector('.input');

//highlight
const highlightVideo = document.querySelector('.highlight__video');
const highlightTitle = document.querySelector('.highlight__title');
const highlightRating = document.querySelector('.highlight__rating');
const highlightGenres = document.querySelector('.highlight__genres');
const highlightLaunch = document.querySelector('.highlight__launch');
const highlightDescription = document.querySelector('.highlight__description');
const videoLink = document.querySelector('.highlight__video-link');

//modal
const modal = document.querySelector('.modal');
const modalTitle = document.querySelector('.modal__title');
const modalImg = document.querySelector('.modal__img');
const modalDescription = document.querySelector('.modal__description');
const modalAverage = document.querySelector('.modal__average');
const modalGenres = document.querySelector('.modal__genres');
const modalClose = document.querySelector('.modal__close');

//theme
const themeButton = document.querySelector('.btn-theme');
const pageBody = document.querySelector('body');
let theme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';

let movies = [];
let moviesSearch = [];

(async () => {
    const response = await fetch('https://tmdb-proxy.cubos-academy.workers.dev/3/movie/436969?language=pt-BR');
    const body = await response.json();

    const videoResponse = await fetch('https://tmdb-proxy.cubos-academy.workers.dev/3/movie/436969/videos?language=pt-BR');
    const videoBody = await videoResponse.json();

    highlightVideo.style.backgroundImage = `url(${body.backdrop_path})`;
    highlightVideo.style.backgroundSize = 'cover'
    highlightTitle.textContent = body.title;
    highlightRating.textContent = body.vote_average;

    let genres = getGenres(body);
    genres = genres.join(', ');
    highlightGenres.textContent = genres;

    const date = `${body.release_date.split('-')[2]}/${body.release_date.split('-')[1]}/${body.release_date.split('-')[0]}`;
    highlightLaunch.textContent = date;

    highlightDescription.textContent = body.overview;
    videoLink.href = `https://www.youtube.com/watch?v=${videoBody.results[0].key}`

})();

const changeTheme = () => {
    themeButton.src = theme === 'dark' ? './assets/dark-mode.svg' : './assets/light-mode.svg';
    pageBody.style.setProperty('--background-color', theme === 'light' ? '#FFF' : '#242424');
    pageBody.style.setProperty('--input-border-color', theme === 'light' ? '#979797' : '#FFF');
    pageBody.style.setProperty('--color', theme === 'light' ? '#000' : '#FFF');
    pageBody.style.setProperty('--shadow-color', theme === 'light' ? '0px 4px 8px rgba(0, 0, 0, 0.15)' : '0px 4px 8px rgba(255, 255, 255, 0.15');
    pageBody.style.setProperty('--highlight-background', theme === 'light' ? '#FFF' : '#454545');
    pageBody.style.setProperty('--highlight-color', theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)');
    pageBody.style.setProperty('--highlight-description', theme === 'light' ? '#000' : '#FFF');
    localStorage.setItem('theme', theme);
};
changeTheme();

themeButton.addEventListener('click', () => {
    theme = localStorage.getItem('theme') === 'dark' ? 'light' : 'dark';
    changeTheme()
});

const getGenres = (body) => {
    let genres = [];
    body.genres.forEach(genre => {
        genres.push(genre.name);
    });
    return genres;
}

const getMovies = async () => {
    const response = await fetch('https://tmdb-proxy.cubos-academy.workers.dev/3/discover/movie?language=pt-BR&include_adult=false');
    const body = await response.json();

    movies = body.results;
    moviesSearch = movies;
};

const buildElements = (movie) => {
    const movieContent = document.createElement('div');
    movieContent.classList.add('movie');

    if (movie.poster_path)
        movieContent.style.backgroundImage = `url(${movie.poster_path})`;
    else {
        const movieAlt = document.createElement('span');
        movieAlt.textContent = movie.title;
        movieContent.append(movieAlt);
        movieContent.style.position = 'relative';
        movieAlt.style.position = 'absolute';
        movieAlt.style.top = '40%';
        movieAlt.style.textAlign = 'center';
        movieAlt.style.alignSelf = 'center';
    }

    const movieInfo = document.createElement('div');
    movieInfo.classList.add('movie__info');

    const movieTitle = document.createElement('span');
    movieTitle.classList.add('movie__title');
    movieTitle.textContent = movie.title;

    const movieRating = document.createElement('span');
    movieRating.classList.add('movie__rating');
    movieRating.textContent = movie.vote_average;

    const image = document.createElement('img');
    image.src = "./assets/estrela.svg";
    image.alt = "Estrela";

    movieRating.append(image);
    movieInfo.append(movieTitle);
    movieInfo.append(movieRating);
    movieContent.append(movieInfo);
    moviesCard.append(movieContent);

    movieContent.addEventListener('click', async () => {
        modal.classList.remove('hidden');
        setTimeout(getModalInfo, 500, movie.id);
    });

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', closeModal)
};

const closeModal = () => {
    modal.classList.add('hidden');
    modalTitle.textContent = '';
    modalImg.src = '';
    modalDescription.textContent = '';
    modalAverage.textContent = '';
    modalGenres.innerHTML = '';
}

const getModalInfo = async (id) => {
    const response = await fetch(`https://tmdb-proxy.cubos-academy.workers.dev/3/movie/${id}?language=pt-BR`)

    const json = await response.json();
    const body = json;
    buildModal(body);
};

const buildModal = (body) => {
    const genres = getGenres(body);
    genres.forEach(genre => {
        const modalGenre = document.createElement('span');
        modalGenre.textContent = genre;
        modalGenres.append(modalGenre);
        modalGenre.style.color = '#FFF';
    });
    console.log(modal);

    modalTitle.textContent = body.title;
    modalImg.src = body.backdrop_path;
    modalDescription.textContent = body.overview;
    modalAverage.textContent = body.vote_average;
}

const makeCardMovies = (start, end) => {
    const page = moviesSearch.slice(start, end);
    moviesCard.innerHTML = '';

    page.forEach(movie => {
        buildElements(movie);
    });
};

let start = 0;
let end = 5;

buttonPrev.addEventListener('click', async () => {
    start -= 5;
    end -= 5;
    if (start < 0) {
        end = moviesSearch.length;
        start = end - 5;
    }
    makeCardMovies(start, end);
});

buttonNext.addEventListener('click', async () => {
    start += 5;
    end += 5;
    if (start > moviesSearch.length - 1) {
        start = 0;
        end = 5;
    }
    makeCardMovies(start, end);
});

input.addEventListener('keydown', async (event) => {
    if (event.code !== 'Enter')
        return;

    if (input.value === '') {
        init();
        return;
    }

    const response = await fetch(`https://tmdb-proxy.cubos-academy.workers.dev/3/search/movie?language=pt-BR&include_adult=false&query=${input.value.toLowerCase()}`);
    const body = await response.json();

    movies = body.results;
    moviesSearch = movies;

    makeCardMovies(0, 5);
    input.value = '';
})

const init = async () => {
    await getMovies();
    makeCardMovies(0, 5);
};

init();