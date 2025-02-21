class TicketBooking {
    constructor() {
        this.TICKET_PRICE = 220.00;
        this.DOUBLE_SEAT_PRICE = 440.00;
        this.selectedSeats = new Set();
        this.occupiedSeats = new Set();
        this.doubleSeats = new Set(['A7-8', 'B7-8', 'C7-8', 'D7-8', 'E7-8', 'F7-8', 'G7-8', 'H7-8']);
        this.selectedTheater = null;
        this.selectedSession = null;

        this.initializeElements();
        this.loadMovieInfo();
        this.setupEventListeners();
    }

    generateRandomOccupiedSeats() {
        this.occupiedSeats.clear(); // Önceki dolu koltukları temizle
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const occupiedCount = Math.floor(Math.random() * 15) + 10; // 10-25 arası rastgele koltuk
        const availableSeats = [];

        // Tüm müsait koltukları diziye ekle
        rows.forEach(row => {
            for (let i = 1; i <= 8; i++) {
                const seatNumber = `${row}${i}`;
                if (i === 7) {
                    // Çift koltuk durumu
                    availableSeats.push(`${row}7-8`);
                } else if (i !== 8) { // 8 numaralı koltuğu atla çünkü 7 ile birlikte işleniyor
                    availableSeats.push(seatNumber);
                }
            }
        });

        // Rastgele koltukları seç
        for (let i = 0; i < occupiedCount && availableSeats.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableSeats.length);
            const selectedSeat = availableSeats.splice(randomIndex, 1)[0];
            
            if (selectedSeat.includes('-')) {
                // Çift koltuk seçildiyse
                const row = selectedSeat.charAt(0);
                this.occupiedSeats.add(`${row}7`);
                this.occupiedSeats.add(`${row}8`);
            } else {
                this.occupiedSeats.add(selectedSeat);
            }
        }
    }

    initializeElements() {
        // Film bilgisi elementleri
        this.movieBackdrop = document.getElementById('movie-backdrop');
        this.movieTitle = document.getElementById('movie-title');
        this.movieDuration = document.getElementById('movie-duration');

        // Koltuk ve fiyat elementleri
        this.seatsContainer = document.getElementById('seats-container');
        this.selectedSeatsList = document.getElementById('selected-seats-list');
        this.selectedSeatCount = document.getElementById('selected-seat-count');
        this.totalPrice = document.getElementById('total-price');
        this.completeBookingBtn = document.getElementById('complete-booking');

        // Salon ve seans elementleri
        this.theaterItems = document.querySelectorAll('.theater-item');
        this.sessionBtns = document.querySelectorAll('.session-btn');
    }

    loadMovieInfo() {
        // URL'den film ID'sini al
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');

        // LocalStorage'dan film bilgilerini al
        const movieInfo = JSON.parse(localStorage.getItem(`movie_${movieId}`));
        
        if (movieInfo) {
            this.movieBackdrop.src = movieInfo.backdrop;
            this.movieTitle.textContent = movieInfo.title;
            this.movieDuration.textContent = `${movieInfo.duration} dakika`;
        } else {
            // Film bilgisi bulunamadıysa ana sayfaya yönlendir
            window.location.href = 'index.html';
        }
    }

    loadSavedSeats() {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        const storageKey = `${movieId}_${this.selectedTheater}_${this.selectedSession}`;

        // Kaydedilmiş koltukları yükle
        const savedSeats = JSON.parse(localStorage.getItem(`selected_seats_${storageKey}`)) || [];
        this.selectedSeats = new Set(savedSeats);

        // Her seans için yeni rastgele dolu koltuklar oluştur
        this.generateRandomOccupiedSeats();
    }

    createSeats() {
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const seatsPerHalf = 4; // Her yarıda 4 koltuk

        this.seatsContainer.innerHTML = '';

        rows.forEach(row => {
            const rowElement = document.createElement('div');
            rowElement.className = 'seat-row';

            // Sıra harfi
            const rowNumber = document.createElement('div');
            rowNumber.className = 'row-number';
            rowNumber.textContent = row;
            rowElement.appendChild(rowNumber);

            // Sol grup koltuklar
            const leftGroup = document.createElement('div');
            leftGroup.className = 'seats-group';
            for (let i = 1; i <= seatsPerHalf; i++) {
                const seatNumber = `${row}${i}`;
                const seat = this.createSeat(seatNumber, i);
                leftGroup.appendChild(seat);
            }
            rowElement.appendChild(leftGroup);

            // Koridor
            const corridor = document.createElement('div');
            corridor.className = 'corridor';
            rowElement.appendChild(corridor);

            // Sağ grup koltuklar
            const rightGroup = document.createElement('div');
            rightGroup.className = 'seats-group';
            for (let i = seatsPerHalf + 1; i <= seatsPerHalf * 2; i++) {
                const seatNumber = `${row}${i}`;
                const seat = this.createSeat(seatNumber, i);
                rightGroup.appendChild(seat);
            }
            rowElement.appendChild(rightGroup);

            this.seatsContainer.appendChild(rowElement);
        });
    }

    createSeat(seatNumber, number) {
        const seat = document.createElement('div');
        seat.className = 'seat';
        seat.dataset.seat = seatNumber;

        const row = seatNumber.charAt(0);

        // Çift koltuk kontrolü ve gösterimi
        if (number === 7) {
            if (this.doubleSeats.has(`${row}7-8`)) {
                seat.classList.add('double');
                seat.textContent = `${row}-7,8`;
                seat.dataset.double = 'true';
                
                // Çift koltuklardan herhangi biri doluysa ikisi de dolu gösterilecek
                if (this.occupiedSeats.has(`${row}7`) || this.occupiedSeats.has(`${row}8`)) {
                    seat.classList.add('occupied');
                } else if (this.selectedSeats.has(`${row}7`) && this.selectedSeats.has(`${row}8`)) {
                    seat.classList.add('selected');
                } else {
                    seat.classList.add('available');
                }
                
                return seat;
            }
        } else if (number === 8) {
            // 8 numaralı koltuğu gizle
            seat.style.display = 'none';
            return seat;
        }

        seat.textContent = seatNumber;

        if (this.occupiedSeats.has(seatNumber)) {
            seat.classList.add('occupied');
        } else if (this.selectedSeats.has(seatNumber)) {
            seat.classList.add('selected');
        } else {
            seat.classList.add('available');
        }

        return seat;
    }

    setupEventListeners() {
        // Salon seçimi
        this.theaterItems.forEach(theater => {
            theater.addEventListener('click', () => {
                this.theaterItems.forEach(t => t.classList.remove('active'));
                theater.classList.add('active');
                this.selectedTheater = theater.dataset.theater;
                
                // Seans seçim bölümünü göster
                document.getElementById('session-times').style.display = 'block';
                
                // Seansları sıfırla
                this.sessionBtns.forEach(b => b.classList.remove('active'));
                this.selectedSession = null;
                
                // Koltukları gizle
                this.seatsContainer.innerHTML = '<div class="select-session-message">Lütfen bir seans seçiniz</div>';
                this.updateUI();
            });
        });

        // Seans seçimi
        this.sessionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.selectedTheater) {
                    alert('Lütfen önce salon seçimi yapınız.');
                    return;
                }

                this.sessionBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedSession = btn.dataset.time;
                
                // Koltukları göster ve rastgele dolu koltukları oluştur
                this.loadSavedSeats();
                this.createSeats();
                this.updateUI();
            });
        });

        // Koltuk seçimi
        this.seatsContainer.addEventListener('click', (e) => {
            if (!this.selectedTheater || !this.selectedSession) {
                alert('Lütfen önce salon ve seans seçimi yapınız.');
                return;
            }

            if (e.target.classList.contains('seat') && !e.target.classList.contains('occupied')) {
                const seatNumber = e.target.dataset.seat;
                const isDouble = e.target.dataset.double === 'true';
                const row = seatNumber.charAt(0);
                
                // Çift koltuk kontrolü
                if (isDouble) {
                    // Eğer çift koltuklardan biri doluysa seçime izin verme
                    if (this.occupiedSeats.has(`${row}7`) || this.occupiedSeats.has(`${row}8`)) {
                        return;
                    }
                    
                    if (this.selectedSeats.has(`${row}7`) && this.selectedSeats.has(`${row}8`)) {
                        // Seçili ise seçimi kaldır
                        this.selectedSeats.delete(`${row}7`);
                        this.selectedSeats.delete(`${row}8`);
                        e.target.classList.remove('selected');
                        e.target.classList.add('available');
                    } else {
                        // Seçili değilse seç
                        this.selectedSeats.add(`${row}7`);
                        this.selectedSeats.add(`${row}8`);
                        e.target.classList.remove('available');
                        e.target.classList.add('selected');
                    }
                } else {
                    // Normal tekli koltuk seçimi
                    if (this.selectedSeats.has(seatNumber)) {
                        this.selectedSeats.delete(seatNumber);
                        e.target.classList.remove('selected');
                        e.target.classList.add('available');
                    } else {
                        this.selectedSeats.add(seatNumber);
                        e.target.classList.remove('available');
                        e.target.classList.add('selected');
                    }
                }

                this.saveSeats();
                this.updateUI();
            }
        });

        // Rezervasyon tamamlama
        this.completeBookingBtn.addEventListener('click', () => {
            if (!this.selectedTheater || !this.selectedSession) {
                alert('Lütfen salon ve seans seçimi yapınız.');
                return;
            }

            if (this.selectedSeats.size === 0) {
                alert('Lütfen en az bir koltuk seçiniz.');
                return;
            }

            this.saveSeats();
            this.completeBooking();
        });
    }

    isPartOfDoubleSeat(seatNumber) {
        const row = seatNumber.charAt(0);
        const number = parseInt(seatNumber.slice(1));
        const doubleSeatNumber = `${row}${number}-${row}${number + 1}`;
        const doubleSeatNumberPrev = `${row}${number - 1}-${row}${number}`;
        return this.doubleSeats.has(doubleSeatNumber) || this.doubleSeats.has(doubleSeatNumberPrev);
    }

    calculateTotalPrice() {
        let total = 0;
        const processedSeats = new Set();

        this.selectedSeats.forEach(seat => {
            if (processedSeats.has(seat)) return;

            const row = seat.charAt(0);
            const number = parseInt(seat.slice(1));

            if (number === 7 && this.selectedSeats.has(`${row}8`)) {
                // Çift koltuk fiyatı
                total += this.DOUBLE_SEAT_PRICE;
                processedSeats.add(seat);
                processedSeats.add(`${row}8`);
            } else if (number === 8 && this.selectedSeats.has(`${row}7`)) {
                // 8 numaralı koltuğu atla, 7 ile birlikte hesaplanacak
                processedSeats.add(seat);
            } else if (!processedSeats.has(seat)) {
                // Tekli koltuk fiyatı
                total += this.TICKET_PRICE;
                processedSeats.add(seat);
            }
        });

        return total;
    }

    saveSeats() {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        const storageKey = `${movieId}_${this.selectedTheater}_${this.selectedSession}`;

        localStorage.setItem(`selected_seats_${storageKey}`, JSON.stringify([...this.selectedSeats]));
        localStorage.setItem(`occupied_seats_${storageKey}`, JSON.stringify([...this.occupiedSeats]));
    }

    updateUI() {
        if (!this.selectedTheater || !this.selectedSession) {
            this.selectedSeatCount.textContent = '0';
            this.totalPrice.textContent = '0.00 ₺';
            this.selectedSeatsList.innerHTML = '';
            this.completeBookingBtn.disabled = true;
            return;
        }

        // Seçili koltuk sayısını güncelle
        let displayCount = 0;
        const processedSeats = new Set();

        this.selectedSeats.forEach(seat => {
            if (processedSeats.has(seat)) return;

            const row = seat.charAt(0);
            const number = parseInt(seat.slice(1));

            if (number === 7 && this.selectedSeats.has(`${row}8`)) {
                displayCount++; // Çift koltuğu tek koltuk olarak say
                processedSeats.add(seat);
                processedSeats.add(`${row}8`);
            } else if (number === 8 && this.selectedSeats.has(`${row}7`)) {
                processedSeats.add(seat);
            } else if (!processedSeats.has(seat)) {
                displayCount++;
                processedSeats.add(seat);
            }
        });

        this.selectedSeatCount.textContent = displayCount;

        // Toplam fiyatı güncelle
        const total = this.calculateTotalPrice();
        this.totalPrice.textContent = `${total.toFixed(2)} ₺`;

        // Seçili koltuklar listesini güncelle
        this.selectedSeatsList.innerHTML = '';
        processedSeats.clear();

        [...this.selectedSeats].sort((a, b) => {
            const rowA = a.charAt(0);
            const rowB = b.charAt(0);
            const numA = parseInt(a.slice(1));
            const numB = parseInt(b.slice(1));
            return rowA === rowB ? numA - numB : rowA.localeCompare(rowB);
        }).forEach(seat => {
            if (processedSeats.has(seat)) return;

            const row = seat.charAt(0);
            const number = parseInt(seat.slice(1));
            const seatTag = document.createElement('div');
            seatTag.className = 'selected-seat-tag';

            if (number === 7 && this.selectedSeats.has(`${row}8`)) {
                seatTag.textContent = `${row}-7,8`;
                processedSeats.add(seat);
                processedSeats.add(`${row}8`);
            } else if (number === 8 && this.selectedSeats.has(`${row}7`)) {
                return;
            } else {
                seatTag.textContent = seat;
            }

            this.selectedSeatsList.appendChild(seatTag);
        });

        // Rezervasyon butonunu güncelle
        this.completeBookingBtn.disabled = this.selectedSeats.size === 0;
    }

    completeBooking() {
        const movieId = new URLSearchParams(window.location.search).get('id');
        const movieInfo = JSON.parse(localStorage.getItem(`movie_${movieId}`));
        const selectedTheaterName = document.querySelector('.theater-item.active h4').textContent;
        
        // Koltukları formatla
        const formattedSeats = [];
        const processedSeats = new Set();
        
        [...this.selectedSeats].sort().forEach(seat => {
            if (processedSeats.has(seat)) return;
            
            const row = seat.charAt(0);
            const number = parseInt(seat.slice(1));
            
            if (number === 7 && this.selectedSeats.has(`${row}8`)) {
                formattedSeats.push(`${row}-7,8 (Çift Koltuk)`);
                processedSeats.add(seat);
                processedSeats.add(`${row}8`);
            } else if (number === 8 && this.selectedSeats.has(`${row}7`)) {
                return;
            } else {
                formattedSeats.push(seat);
            }
        });
        
        const ticketInfo = {
            movieTitle: movieInfo.title,
            theater: selectedTheaterName,
            session: this.selectedSession,
            date: new Date().toLocaleDateString('tr-TR'),
            seats: formattedSeats,
            totalPrice: this.calculateTotalPrice(),
            ticketNumber: Math.random().toString(36).substr(2, 9).toUpperCase()
        };

        localStorage.setItem('lastTicketInfo', JSON.stringify(ticketInfo));
        window.location.href = 'bilet-yazdir.html';
    }
}

// Sayfa yüklendiğinde TicketBooking sınıfını başlat
document.addEventListener('DOMContentLoaded', () => {
    new TicketBooking();
}); 