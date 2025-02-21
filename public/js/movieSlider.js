const TMDB_API_KEY = 'ea8745e7cda115f54dfe1c07c35a3f08';
const YOUTUBE_API_KEY = 'AIzaSyDHDQz06GG6B9HfhwNjsaHuXSZxBgTmqVU'; // YouTube Data API v3 anahtarı
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

class MovieManager {
    constructor() {
        this.initSlider();
        this.initMovieGrid();
        this.initLightbox();
    }

    initSlider() {
        this.slider = new MovieSlider();
    }

    initLightbox() {
        // Lightbox elementini oluştur
        const lightbox = document.createElement('div');
        lightbox.className = 'movie-lightbox';
        lightbox.innerHTML = `
            <div class="movie-lightbox__overlay"></div>
            <div class="movie-lightbox__content">
                <button class="movie-lightbox__close">&times;</button>
                <div class="movie-lightbox__body"></div>
            </div>
        `;
        document.body.appendChild(lightbox);

        // Lightbox kapatma olayları
        const overlay = lightbox.querySelector('.movie-lightbox__overlay');
        const closeBtn = lightbox.querySelector('.movie-lightbox__close');
        overlay.addEventListener('click', () => this.closeLightbox());
        closeBtn.addEventListener('click', () => this.closeLightbox());
    }

    async initMovieGrid() {
        const moviesGrid = document.querySelector('.movies-grid');
        if (!moviesGrid) return;

        try {
            const movies = await this.fetchAllNowPlayingMovies();
            this.renderMovieGrid(movies, moviesGrid);
        } catch (error) {
            console.error('Filmler yüklenirken hata oluştu:', error);
        }
    }

    async fetchAllMovies() {
        let allMovies = [];
        let page = 1;
        const totalPages = 5; // Daha fazla film almak için sayfa sayısını artırdım

        try {
            while (page <= totalPages) {
                // Türk filmlerini al
                const response = await fetch(
                    `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=tr-TR&region=TR&with_original_language=tr&sort_by=release_date.desc&page=${page}&include_adult=false`
                );
                const data = await response.json();
                allMovies = [...allMovies, ...data.results];
                page++;
            }

            // Resimleri olan filmleri filtrele
            let filteredMovies = allMovies.filter(movie => 
                movie.backdrop_path && movie.poster_path && 
                movie.overview && movie.overview.trim() !== ''
            );

            // Tarihe göre filtreleme yap
            const startDate = new Date('2025-01-01'); // Daha fazla film görmek için tarihi güncelledim
            filteredMovies = filteredMovies.filter(movie => {
                const releaseDate = new Date(movie.release_date);
                return releaseDate >= startDate;
            });

            // Tarihe göre sırala (en yeniden en eskiye)
            return filteredMovies.sort((a, b) => {
                const dateA = new Date(a.release_date);
                const dateB = new Date(b.release_date);
                return dateB - dateA;
            });

        } catch (error) {
            console.error('Filmler yüklenirken hata oluştu:', error);
            return [];
        }
    }

    async fetchAllNowPlayingMovies() {
        let allMovies = [];
        let page = 1;
        const totalPages = 5;

        try {
            while (page <= totalPages) {
                // Türk filmlerini al
                const response = await fetch(
                    `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=tr-TR&region=TR&with_original_language=tr&sort_by=primary_release_date.desc&page=${page}&include_adult=false`
                );
                const data = await response.json();
                allMovies = [...allMovies, ...data.results];
                page++;
            }

            // Resimleri olan filmleri filtrele
            let filteredMovies = allMovies.filter(movie => 
                movie.backdrop_path && movie.poster_path && 
                movie.overview && movie.overview.trim() !== ''
            );

            // Tarihe göre filtreleme yap
            const startDate = new Date('2025-01-01');
            filteredMovies = filteredMovies.filter(movie => {
                const releaseDate = new Date(movie.release_date);
                return releaseDate >= startDate;
            });

            // Tarihe göre sırala (en yeniden en eskiye)
            return filteredMovies.sort((a, b) => {
                const dateA = new Date(a.release_date)-10;
                const dateB = new Date(b.release_date);
                return dateB - dateA;
            });

        } catch (error) {
            console.error('Filmler yüklenirken hata oluştu:', error);
            return [];
        }
    }

    async showMovieDetails(movieId) {
        try {
            const [movieDetails, videos] = await Promise.all([
                this.fetchMovieDetails(movieId),
                this.fetchMovieVideos(movieId)
            ]);

            const trailer = videos.results.find(video => 
                video.type === 'Trailer' && video.site === 'YouTube'
            );

            const lightboxBody = document.querySelector('.movie-lightbox__body');
            lightboxBody.innerHTML = `
                <div class="movie-detail">
                    <div class="movie-detail__header" style="background-image: url('${IMAGE_BASE_URL}${movieDetails.backdrop_path}')">
                        <div class="movie-detail__overlay"></div>
                        <div class="movie-detail__poster">
                            <img src="${POSTER_BASE_URL}${movieDetails.poster_path}" alt="${movieDetails.title}">
                        </div>
                        <div class="movie-detail__info">
                            <h2>${movieDetails.title}</h2>
                            <div class="movie-detail__meta">
                                <span class="year">${new Date(movieDetails.release_date).getFullYear()}</span>
                                <span class="runtime">${movieDetails.runtime} dakika</span>
                                <span class="rating">
                                    <i class="fas fa-star"></i>
                                    ${(movieDetails.vote_average / 2).toFixed(1)}
                                </span>
                            </div>
                            <div class="movie-detail__genres">
                                ${movieDetails.genres.map(genre => 
                                    `<span class="genre">${genre.name}</span>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="movie-detail__body">
                        <p class="overview">${movieDetails.overview}</p>
                        <div class="movie-detail__actions">
                            <button class="btn btn-ticket" onclick="movieManager.bookTicket(${movieDetails.id}, '${movieDetails.title}', '${IMAGE_BASE_URL}${movieDetails.backdrop_path}', ${movieDetails.runtime})">
                                <i class="fas fa-ticket-alt"></i>
                                Bilet Al
                            </button>
                            ${trailer ? `
                                <button class="btn btn-trailer" onclick="movieManager.playTrailer('${trailer.key}')">
                                    <i class="fas fa-play"></i>
                                    Fragmanı İzle
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;

            document.body.classList.add('lightbox-open');
            document.querySelector('.movie-lightbox').classList.add('active');
        } catch (error) {
            console.error('Film detayları yüklenirken hata oluştu:', error);
        }
    }

    closeLightbox() {
        document.body.classList.remove('lightbox-open');
        document.querySelector('.movie-lightbox').classList.remove('active');
    }

    async fetchMovieDetails(movieId) {
        try {
            // Film detaylarını al
            const response = await fetch(
                `${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=tr-TR`
            );
            const movieData = await response.json();
            return movieData;
        } catch (error) {
            console.error('Film detayları yüklenirken hata oluştu:', error);
            return null;
        }
    }

    async fetchMovieVideos(movieId) {
        try {
            // Film detaylarını al (hem Türkçe hem orijinal başlık için)
            const movieResponse = await fetch(
                `${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=tr-TR`
            );
            const movieData = await movieResponse.json();

            // Orijinal dildeki başlığı al
            const originalResponse = await fetch(
                `${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
            );
            const originalData = await originalResponse.json();

            // Önce TMDB'den Türkçe fragman ara
            const trResponse = await fetch(
                `${BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=tr-TR`
            );
            const trData = await trResponse.json();
            
            let trailer = trData.results.find(video => 
                video.type === 'Trailer' && video.site === 'YouTube'
            );

            // Türkçe fragman bulunamadıysa YouTube'da ara
            if (!trailer) {
                // Önce Türkçe başlık + "fragman" ile ara
                const turkishSearchQuery = `${movieData.title} ${movieData.release_date.substring(0, 4)} fragman resmi`;
                const turkishTrailer = await this.searchYouTubeTrailer(turkishSearchQuery);

                if (turkishTrailer) {
                    trailer = {
                        key: turkishTrailer,
                        site: 'YouTube',
                        type: 'Trailer'
                    };
                } else {
                    // Türkçe bulunamazsa orijinal başlık + "trailer" ile ara
                    const originalSearchQuery = `${originalData.original_title} ${originalData.release_date.substring(0, 4)} official trailer`;
                    const originalTrailer = await this.searchYouTubeTrailer(originalSearchQuery);

                    if (originalTrailer) {
                        trailer = {
                            key: originalTrailer,
                            site: 'YouTube',
                            type: 'Trailer'
                        };
                    }
                }
            }

            return {
                results: trailer ? [trailer] : []
            };
        } catch (error) {
            console.error('Film fragmanı yüklenirken hata oluştu:', error);
            return { results: [] };
        }
    }

    async searchYouTubeTrailer(searchQuery) {
        try {
            // YouTube Data API v3 kullanarak arama yap
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&videoDuration=short&videoEmbeddable=true&maxResults=5&key=${YOUTUBE_API_KEY}`
            );
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                // Başlığında "fragman" veya "trailer" geçen videoları öncelikle seç
                const trailerVideo = data.items.find(item => 
                    item.snippet.title.toLowerCase().includes('fragman') || 
                    item.snippet.title.toLowerCase().includes('trailer') ||
                    item.snippet.channelTitle.toLowerCase().includes('official')
                ) || data.items[0];

                return trailerVideo.id.videoId;
            }
            return null;
        } catch (error) {
            console.error('YouTube araması sırasında hata oluştu:', error);
            return null;
        }
    }

    playTrailer(trailerKey) {
        const trailerLightbox = document.createElement('div');
        trailerLightbox.className = 'trailer-lightbox active';
        trailerLightbox.innerHTML = `
            <div class="trailer-lightbox__overlay"></div>
            <div class="trailer-lightbox__content">
                <button class="trailer-lightbox__close">&times;</button>
                <div class="trailer-lightbox__video">
                    <iframe width="100%" height="100%"
                        src="https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&showinfo=0&modestbranding=1&fs=1&playsinline=1"
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" 
                        allowfullscreen>
                    </iframe>
                </div>
            </div>
        `;
        document.body.appendChild(trailerLightbox);

        const closeTrailer = () => {
            document.body.removeChild(trailerLightbox);
        };

        trailerLightbox.querySelector('.trailer-lightbox__close').addEventListener('click', closeTrailer);
        trailerLightbox.querySelector('.trailer-lightbox__overlay').addEventListener('click', closeTrailer);
    }

    renderMovieGrid(movies, container) {
        if (movies.length === 0) {
            container.innerHTML = `
                <div class="no-movies">
                    <h3>Şu anda gösterimde film bulunmamaktadır.</h3>
                </div>
            `;
            return;
        }

        container.innerHTML = movies.map(movie => {
            const rating = (movie.vote_average / 2).toFixed(1);
            const releaseDate = new Date(movie.release_date);
            
            return `
            <div class="movie-card">
                <div class="movie-card__image">
                    <img src="${POSTER_BASE_URL}${movie.poster_path}" alt="${movie.title}"
                         onerror="this.src='img/no-poster.jpg'" loading="lazy">
                    <div class="movie-rating">
                        <i class="fas fa-star"></i>
                        <span>${rating}</span>
                    </div>
                </div>
                <div class="movie-card__info">
                    <h3 title="${movie.title}">${movie.title}</h3>
                    <div class="movie-meta">
                        <span class="release-date">${releaseDate.toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</span>
                        <div class="movie-buttons">
                            <button class="btn btn-ticket" onclick="movieManager.bookTicket(${movie.id}, '${movie.title}', '${IMAGE_BASE_URL}${movie.backdrop_path}', ${movie.runtime})">
                                Bilet Al
                            </button>
                            <button class="btn btn-info" onclick="movieManager.showMovieDetails(${movie.id})">
                                <i class="fas fa-info-circle"></i>
                                Detaylar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `}).join('');
    }

    async bookTicket(movieId, title, backdrop, duration) {
        try {
            // Film detaylarını al
            const movieDetails = await this.fetchMovieDetails(movieId);
            
            // Film bilgilerini LocalStorage'a kaydet
            const movieInfo = {
                title,
                backdrop,
                duration: movieDetails.runtime
            };
            localStorage.setItem(`movie_${movieId}`, JSON.stringify(movieInfo));

            // Bilet sayfasına yönlendir
            window.location.href = `bilet.html?id=${movieId}`;
        } catch (error) {
            console.error('Film bilgileri yüklenirken hata oluştu:', error);
        }
    }
}

class MovieSlider {
    constructor() {
        this.currentIndex = 0;
        this.sliderContainer = document.querySelector('.slider-container');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.movies = [];
        this.autoSlideInterval = null;
        
        this.init();
    }

    async init() {
        await this.fetchNowPlayingMovies();
        this.setupEventListeners();
        this.startAutoSlide();
    }

    async fetchNowPlayingMovies() {
        try {
            let allMovies = [];
            let page = 1;
            const totalPages = 5;

            while (page <= totalPages) {
                const response = await fetch(
                    `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=tr-TR&region=TR&with_original_language=tr&sort_by=popularity.desc&page=${page}&include_adult=false`
                );
                const data = await response.json();
                allMovies = [...allMovies, ...data.results];
                page++;
            }

            // Resimleri olan filmleri filtrele
            let filteredMovies = allMovies.filter(movie => 
                movie.backdrop_path && movie.poster_path && 
                movie.overview && movie.overview.trim() !== ''
            );

            // Tarihe göre filtreleme yap
            const startDate = new Date('2024-01-01');
            filteredMovies = filteredMovies.filter(movie => {
                const releaseDate = new Date(movie.release_date);
                return releaseDate >= startDate;
            });

            // Popülerliğe göre sırala
            filteredMovies = filteredMovies.sort((a, b) => b.popularity - a.popularity);

            if (filteredMovies.length > 0) {
                this.movies = filteredMovies.slice(0, 3); // En popüler 8 filmi al
                await this.renderMovies();
                this.updateSliderPosition(); // İlk slide'ı göster
            } else {
                console.log('Gösterilecek film bulunamadı');
                this.sliderContainer.innerHTML = `
                    <div class="no-movies-message">
                        <h2>Şu anda gösterimde film bulunmamaktadır.</h2>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Filmler yüklenirken hata oluştu:', error);
            this.sliderContainer.innerHTML = `
                <div class="error-message">
                    <h2>Filmler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.</h2>
                </div>
            `;
        }
    }

    async renderMovies() {
        if (!this.sliderContainer) return;
        
        // Önce film detaylarını al
        const moviesWithDetails = await Promise.all(
            this.movies.map(async (movie) => {
                try {
                    const details = await movieManager.fetchMovieDetails(movie.id);
                    return { ...movie, runtime: details.runtime };
                } catch (error) {
                    console.error(`Film detayları alınamadı (ID: ${movie.id}):`, error);
                    return { ...movie, runtime: 120 }; // Varsayılan süre
                }
            })
        );

        this.sliderContainer.innerHTML = moviesWithDetails.map(movie => {
            const rating = (movie.vote_average / 2).toFixed(1);
            const movieTitle = movie.title.replace(/'/g, "\\'"); // Tırnak işaretlerini escape et
            const movieOverview = (movie.overview || 'Film açıklaması bulunmamaktadır.').replace(/'/g, "\\'");
            
            return `
            <div class="movie-slide">
                <img src="${IMAGE_BASE_URL}${movie.backdrop_path}" alt="${movieTitle}"
                     onerror="this.src='img/no-backdrop.jpg'" loading="lazy">
                <div class="movie-info">
                    <h2>${movieTitle}</h2>
                    <p>${movieOverview}</p>
                    <div class="movie-meta">
                        <div class="movie-rating">
                            <i class="fas fa-star"></i>
                            <span>${rating}</span>
                        </div>
                        <div class="movie-buttons">
                            <button class="btn btn-ticket" onclick="movieManager.bookTicket(${movie.id}, '${movieTitle}', '${IMAGE_BASE_URL}${movie.backdrop_path}', ${movie.runtime})">
                                <i class="fas fa-ticket-alt"></i>
                                Bilet Al
                            </button>
                            <button class="btn btn-info" onclick="movieManager.showMovieDetails(${movie.id})">
                                <i class="fas fa-info-circle"></i>
                                Detaylar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `}).join('');
    }

    setupEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.slide('prev');
                this.resetAutoSlide();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.slide('next');
                this.resetAutoSlide();
            });
        }

        // Touch events için swipe desteği
        let touchStartX = 0;
        let touchEndX = 0;

        this.sliderContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, false);

        this.sliderContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            this.handleSwipe();
        }, false);

        // Swipe işlemini yönet
        this.handleSwipe = () => {
            const swipeThreshold = 50; // minimum swipe mesafesi
            const swipeLength = touchEndX - touchStartX;

            if (Math.abs(swipeLength) > swipeThreshold) {
                if (swipeLength > 0) {
                    this.slide('prev');
                } else {
                    this.slide('next');
                }
                this.resetAutoSlide();
            }
        };
    }

    slide(direction) {
        if (direction === 'next') {
            this.currentIndex = (this.currentIndex + 1) % this.movies.length;
        } else {
            this.currentIndex = (this.currentIndex - 1 + this.movies.length) % this.movies.length;
        }
        this.updateSliderPosition();
    }

    updateSliderPosition() {
        if (this.sliderContainer) {
            const position = -this.currentIndex * 100;
            this.sliderContainer.style.transform = `translateX(${position}%)`;
        }
    }

    startAutoSlide() {
        this.stopAutoSlide(); // Önceki interval'i temizle
        this.autoSlideInterval = setInterval(() => this.slide('next'), 9000);
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    resetAutoSlide() {
        this.stopAutoSlide();
        this.startAutoSlide();
    }
}

// Global erişim için
let movieManager;

document.addEventListener('DOMContentLoaded', () => {
    movieManager = new MovieManager();
}); 