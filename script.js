// Configuration du scanner
let scannerActive = false;
const video = document.getElementById('preview');
const result = document.getElementById('scanned-value');

// Démarrer la caméra
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        video.srcObject = stream;
        video.play();
        scannerActive = true;
        startScanning();
    } catch (error) {
        alert("Erreur d'accès à la caméra : " + error.message);
    }
}

// Scanner les codes barres avec QuaggaJS
function startScanning() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: video,
            constraints: {
                width: 640,
                height: 480,
                facingMode: "environment"
            },
            area: { // Définir la zone de scan
                top: "25%",
                right: "25%",
                left: "25%",
                bottom: "25%"
            }
        },
        decoder: {
            readers: ["code_128_reader"],
            debug: {
                drawBoundingBox: true,
                showFrequency: false,
                drawScanline: true,
                showPattern: false
            }
        },
        locate: true
    }, function(err) {
        if (err) {
            console.error("Erreur d'initialisation:", err);
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(function(result) {
        const code = result.codeResult.code;
        if (code && scannerActive) {
            displayResult(code);
            saveToHistory(code);
            scannerActive = false;
            setTimeout(() => scannerActive = true, 2000);
        }
    });
}

// Afficher le résultat
function displayResult(code) {
    result.textContent = code;
    result.classList.add('text-green-400');
    setTimeout(() => result.classList.remove('text-green-400'), 1000);
}

// Gestion de l'historique
function saveToHistory(code) {
    const history = JSON.parse(localStorage.getItem('scanHistory') || '[]');
    history.unshift({
        code: code,
        date: new Date().toLocaleString('fr-FR'),
        type: code.length === 17 ? 'Châssis' : 'Code barre'
    });
    localStorage.setItem('scanHistory', JSON.stringify(history));
    updateHistoryUI();
}

function updateHistoryUI() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    const history = JSON.parse(localStorage.getItem('scanHistory') || '[]');
    historyList.innerHTML = history.map(item => `
        <div class="p-3 bg-gray-800 rounded-lg">
            <p class="font-bold">${item.type}: <span class="text-blue-400">${item.code}</span></p>
            <p class="text-sm text-gray-400">${item.date}</p>
        </div>
    `).join('');
}

function clearHistory() {
    if (confirm("Voulez-vous vraiment effacer tout l'historique ?")) {
        localStorage.removeItem('scanHistory');
        updateHistoryUI();
    }
}

// Événements
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('preview')) {
        startCamera();
    }
    updateHistoryUI();
});

document.getElementById('clear')?.addEventListener('click', function() {
    result.textContent = '';
});