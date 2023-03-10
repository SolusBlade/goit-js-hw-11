import './css/styles.css';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import throttle from 'lodash.throttle';

import PixabayAPI from "./js/PixabayAPI";
const pixabayAPI = new PixabayAPI();



const formRef = document.querySelector('.search-form');
const listRef = document.querySelector('.gallery');
const spinnerRef = document.querySelector('.spinner');

let lightbox = new SimpleLightbox('.gallery .photo-card .img-wrap a', { captionDelay: 250 });

let isEnd = false;
let isAvailable = true;

formRef.addEventListener('submit', onSubmit);
spinnerRef.addEventListener('click', onScroll);
// window.addEventListener("scroll", throttle(onScroll, 500));

async function onScroll(e){
    if(!isEnd){
        const docRect = document.documentElement.getBoundingClientRect();
        if(docRect.bottom < document.documentElement.clientHeight + 100){
            // enableBtn();
            isAvailable = false;
            const data = await pixabayAPI.fetchApi();
            if(data === 400 || data.hits.length === 0){
                showAlert();
                disableBtn();
                isEnd = true;
                return;
            }
            drawElements(data.hits);
            // disableBtn();
            onAddItems();
            lightbox.refresh();
            isAvailable = true;
        }
    }
}
function onAddItems(){
    const { height: cardHeight } = listRef.firstElementChild.getBoundingClientRect();
    
    window.scrollBy({
            top: cardHeight * 2,
            behavior: "smooth",
    });
}
async function onSubmit(e){
    e.preventDefault();
    listRef.innerHTML = "";
    isEnd = false;
    const inputData = e.currentTarget.elements.searchQuery.value.trim();
    if(inputData === ''){
        onInfo();
        return;
    }
    pixabayAPI.searchInput = inputData;
    pixabayAPI.resetPage();
    // enableBtn();
    const data = await pixabayAPI.fetchApi();
    if(data.totalHits === 0){
        onError();
        disableBtn();
        return;
    }
    drawElements(data.hits);
    onSuccess(data.totalHits);
    // disableBtn();
    enableBtn();
    lightbox.refresh();
}

function disableBtn(){
    spinnerRef.classList.add("disabled");
}
function enableBtn(){
    spinnerRef.classList.remove("disabled");
}
function drawElements(cards){
    const markup = [];
    for (const {webformatURL, largeImageURL, tags, likes, views, comments, downloads} of cards) {
        markup.push(`
        <div class="photo-card">
            <div class="img-wrap"><a href="${largeImageURL}"><img class="card-photo" src="${webformatURL}" alt="${tags}" loading="lazy" /></a></div>
            <div class="info">
                <p class="info-item">
                <b>Likes</b>
                ${likes}
                </p>
                <p class="info-item">
                <b>Views</b>
                ${views}
                </p>
                <p class="info-item">
                <b>Comments</b>
                ${comments}
                </p>
                <p class="info-item">
                <b>Downloads</b>
                ${downloads}
                </p>
            </div>
        </div>
      `)
    }
    listRef.innerHTML += [...markup].join('');
}

function onSuccess(el){
    Notiflix.Notify.success(
        `Hooray! We found ${el} images`,
        {
          timeout: 2000,
        },
      )
}

function onInfo(){
    Notiflix.Notify.info(
        `Too many matches found. Please enter a more specific name`,
        {
          timeout: 2000,
        },
      )
}

function onError(){
    Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again',
        {
          timeout: 2000,
        },
    )
}

function showAlert(){
    Notiflix.Notify.info(
        `We're sorry, but you've reached the end of search results`,
        {
          timeout: 2000,
        },
    )
}