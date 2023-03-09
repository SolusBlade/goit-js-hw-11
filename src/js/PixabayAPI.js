import axios from 'axios';

export default class PixabayAPI {
    #BASE_URL = "https://pixabay.com/api/"
    #API_KEY = "34227694-9569f818613f570b55f9f9223"
    constructor(){
        this.searchInput = '';
        this.page = 1;
    }

    async fetchApi() {
        const params = new URLSearchParams({
            key: this.#API_KEY,
            q: this.searchInput,
            image_type: "photo",
            per_page: 40,
            page: this.page,
            orientation: "horizontal",
            safesearch: true,
        });
        // const options = {
        //     headers:{
        //         "Set-Cookie": {
        //             key: this.#API_KEY,
        //             SameSite: "Strict",
        //             Secure: "Secure"
        //         }
        //     }
        // }
        try {
            const {data} = await axios.get(`${this.#BASE_URL}?${params}`);
            this.incrementPage();
            return data;
          } catch ({response:{status}}) {
            return status;
          }
    }
    incrementPage(){
        this.page++;
    }
    resetPage(){
        this.page = 1;
    }
}


