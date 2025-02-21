document.addEventListener('DOMContentLoaded', () => {
    try {
        const ticketInfo = JSON.parse(localStorage.getItem('lastTicketInfo'));
        
        if (!ticketInfo) {
            console.error('Bilet bilgisi bulunamadı');
            window.location.href = 'index.html';
            return;
        }

        console.log('Bilet bilgisi:', ticketInfo);

        // AVM adını ayarla
        const avmName = ticketInfo.theater.includes('Forum') ? 'Forum İstanbul' : 'Mall of İstanbul';
        document.querySelector('.avm-name').textContent = avmName;

        // Bilet bilgilerini doldur
        document.querySelector('.movie-title').textContent = ticketInfo.movieTitle;
        document.querySelector('.theater').textContent = ticketInfo.theater;
        document.querySelector('.date').textContent = ticketInfo.date;
        document.querySelector('.time').textContent = ticketInfo.session;
        document.querySelector('.seats').textContent = ticketInfo.seats.join(', ');
        document.querySelector('.total').textContent = `${ticketInfo.totalPrice.toFixed(2)} ₺`;
        document.querySelector('.ticket-number').textContent = `Bilet No: ${ticketInfo.ticketNumber}`;

        // Bilet verisini sıkıştırılmış formata dönüştür
        const venue = ticketInfo.theater.includes('Forum') ? 'F' : 'M';
        const dateParts = ticketInfo.date.split('-');
        const compactDate = dateParts[2] + dateParts[1] + dateParts[0].slice(2); // GGAAYY formatı
        const time = ticketInfo.session.replace(':', '');
        const seats = ticketInfo.seats.join(',');
        
        // Kompakt bilet kodu oluştur
        const ticketCode = `${venue}${ticketInfo.ticketNumber}${compactDate}${time}${seats}`;
        
        // Base64 URL-safe kodlama yap
        const base64Code = btoa(ticketCode)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

        // Doğrulama URL'i oluştur
        const verifyUrl = `https://cinego.com/verify/${base64Code}`;
        console.log('Doğrulama URL:', verifyUrl);

        // QR kod oluştur
        setTimeout(() => {
            try {
                const qrElement = document.getElementById('qr-code');
                qrElement.innerHTML = ''; // Önceki içeriği temizle

                // QR kod container oluştur
                const qrContainer = document.createElement('div');
                qrContainer.style.backgroundColor = '#ffffff';
                qrContainer.style.padding = '8px';
                qrContainer.style.borderRadius = '8px';
                qrContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                qrContainer.style.width = 'fit-content';
                qrContainer.style.margin = '0 auto';
                qrElement.appendChild(qrContainer);

                const qr = new QRCode(qrContainer, {
                    text: verifyUrl,
                    width: 80,
                    height: 80,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.L,
                    margin: 0
                });

                // QR kod oluşturulduktan sonra stil ayarlamaları
                const qrImg = qrContainer.querySelector('img');
                if (qrImg) {
                    qrImg.style.display = 'block';
                }

                // QR kod açıklaması ekle
                const qrCaption = document.createElement('div');
                qrCaption.style.textAlign = 'center';
                qrCaption.style.marginTop = '8px';
                qrCaption.style.fontSize = '10px';
                qrCaption.style.color = '#666';
                qrCaption.style.lineHeight = '1.4';
                qrCaption.innerHTML = `Bilet Kodu: ${base64Code}<br>Gişe görevlisi tarafından taranacaktır`;
                qrElement.appendChild(qrCaption);

                console.log('QR kod başarıyla oluşturuldu');
            } catch (qrError) {
                console.error('QR kod oluşturma hatası:', qrError);
                const qrElement = document.getElementById('qr-code');
                qrElement.innerHTML = `
                    <div style="text-align: center; padding: 1rem;">
                        <p style="color: #dc3545; margin-bottom: 0.5rem;">QR kod oluşturulamadı</p>
                        <small style="color: #6c757d;">Lütfen daha sonra tekrar deneyin</small>
                    </div>
                `;
            }
        }, 100);

        // LocalStorage'ı temizle
        localStorage.removeItem('lastTicketInfo');
    } catch (error) {
        console.error('Genel hata:', error);
        document.body.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h2>Bir hata oluştu</h2>
                <p>Lütfen ana sayfaya dönün ve tekrar deneyin.</p>
                <a href="index.html" style="display: inline-block; padding: 1rem 2rem; background: #ff4081; color: white; text-decoration: none; border-radius: 8px; margin-top: 1rem;">Ana Sayfaya Dön</a>
            </div>
        `;
    }
}); 