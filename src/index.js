import './css/styles.css';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import throttle from 'lodash.throttle';

import PixabayAPI from "./js/PixabayAPI";
const pixabayAPI = new PixabayAPI();



const formRef = document.querySelector('.search-form');
const inputRef = document.querySelector('.search__input');
const listRef = document.querySelector('.gallery');
const alertRef = document.querySelector('.alert-box');
const spinnerRef = document.querySelector('.spinner');

let lightbox = new SimpleLightbox('.gallery .photo-card .img-wrap a', { captionDelay: 250 });

let isEnd = false;

formRef.addEventListener('submit', onSubmit);
// btnRef.addEventListener("click", onBtnClick);
window.addEventListener("scroll", throttle(onScroll, 300));
    

async function onScroll(e){
    if(!isEnd){
        enableBtn();
        const docRect = document.documentElement.getBoundingClientRect();
        if(docRect.bottom < document.documentElement.clientHeight + 100){
            const data = await pixabayAPI.fetchApi();
            if(data === "ERR_BAD_REQUEST" || data.hits.length === 0){
                drawAlert();
                const spin = await disableBtn();
                isEnd = true;
                return;
            }
            const draw = await drawElements(data.hits);
            const spin = await disableBtn();
            const scroll = await onAddItems();
            lightbox.refresh();
        }
    }
}
async function onAddItems(){
    const { height: cardHeight } = listRef.firstElementChild.getBoundingClientRect();
    window.scrollBy({
            top: cardHeight * 2,
            behavior: "smooth",
    });
}
async function onSubmit(e){
    e.preventDefault();
    listRef.innerHTML = "";
    alertRef.innerHTML = "";
    isEnd = false;
    const inputData = e.currentTarget.elements.searchQuery.value.trim();
    if(inputData === ''){
        onInfo();
        return;
    }
    pixabayAPI.searchInput = inputData;
    pixabayAPI.resetPage();
    enableBtn();
    const data = await pixabayAPI.fetchApi();
    if(data.totalHits === 0){
        onError();
        const spin = await disableBtn();
        return;
    }
    const draw = await drawElements(data.hits);
    onSuccess(data.totalHits);
    const spin = await disableBtn();
    lightbox.refresh();
}
function drawAlert(){
    const markup = `
        <p class="alert-msg">We're sorry, but you've reached the end of search results</p>
      `;
    alertRef.innerHTML = markup;
}
async function disableBtn(){
    spinnerRef.classList.add("disabled");
}
async function enableBtn(){
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
