// Firebase SDK-larını import edirik
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { 
    getAuth, 
    RecaptchaVerifier, 
    signInWithPhoneNumber, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getDatabase, 
    ref, 
    push, 
    onValue, 
    remove 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Sənin Konfiqurasiyan
const firebaseConfig = {
    apiKey: "AIzaSyDv17YRPC7TZUao-2XbPWjVXK8IxptRrmE",
    authDomain: "westtour-eaf31.firebaseapp.com",
    databaseURL: "https://westtour-eaf31-default-rtdb.firebaseio.com",
    projectId: "westtour-eaf31",
    storageBucket: "westtour-eaf31.firebasestorage.app",
    messagingSenderId: "786901991695",
    appId: "1:786901991695:web:6e58cbf0b36985ba96be7a",
    measurementId: "G-PQX6J66NCC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);

// Xüsusi Admin Nömrəsi
const ADMIN_PHONE = "+994509795781";

// DOM Elementləri
const toursContainer = document.getElementById('tours-container');
const adminPanel = document.getElementById('admin-panel');
const addTourForm = document.getElementById('add-tour-form');
const loginBtn = document.getElementById('login-btn');
const userInfo = document.getElementById('user-info');
const userPhoneSpan = document.getElementById('user-phone');

// ==========================================
// 1. REALTIME DATABASE: Turları Oxumaq
// ==========================================
const toursRef = ref(db, 'tours');

onValue(toursRef, (snapshot) => {
    toursContainer.innerHTML = ""; // Köhnələri təmizlə
    const data = snapshot.val();

    if (data) {
        Object.keys(data).forEach(key => {
            const tour = data[key];
            const isUserAdmin = auth.currentUser && auth.currentUser.phoneNumber === ADMIN_PHONE;
            
            // Kartın yaradılması
            const cardHTML = `
                <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300 relative group">
                    <div class="h-56 overflow-hidden relative">
                        <img src="${tour.image}" alt="${tour.title}" class="w-full h-full object-cover transform group-hover:scale-110 transition duration-500">
                        <div class="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-blue-600 font-bold shadow">
                            ${tour.price}
                        </div>
                    </div>
                    
                    <div class="p-6">
                        <h3 class="text-xl font-bold mb-2 text-gray-800">${tour.title}</h3>
                        <div class="flex items-center text-gray-500 text-sm mb-4">
                            <i class="fa-regular fa-calendar mr-2"></i> ${tour.date}
                        </div>
                        
                        <div class="flex justify-between items-center mt-4">
                            <button class="bg-blue-600 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-700 transition">
                                Ətraflı
                            </button>
                            
                            ${isUserAdmin ? `
                                <button onclick="window.deleteTour('${key}')" class="ml-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            toursContainer.innerHTML += cardHTML;
        });
    } else {
        toursContainer.innerHTML = "<p class='text-center col-span-3 text-gray-500'>Hələlik tur yoxdur.</p>";
    }
});

// ==========================================
// 2. ADMIN: Tur Əlavə Etmə və Silmə
// ==========================================

// Tur Silmə Funksiyası (Window obyektinə atırıq ki, HTML-dən əl çatan olsun)
window.deleteTour = (id) => {
    if (confirm("Bu turu silmək istədiyinizə əminsiniz?")) {
        remove(ref(db, `tours/${id}`))
            .then(() => alert("Tur silindi!"))
            .catch((error) => alert("Xəta: " + error.message));
    }
};

// Tur Əlavə Etmə Formu
addTourForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Təhlükəsizlik yoxlaması (Client-side)
    if (auth.currentUser?.phoneNumber !== ADMIN_PHONE) {
        alert("Sizin buna icazəniz yoxdur!");
        return;
    }

    const newTour = {
        title: document.getElementById('tour-title').value,
        price: document.getElementById('tour-price').value,
        image: document.getElementById('tour-img').value,
        date: document.getElementById('tour-date').value,
        createdAt: Date.now()
    };

    push(toursRef, newTour)
        .then(() => {
            alert("Tur uğurla əlavə edildi!");
            addTourForm.reset();
        })
        .catch((error) => {
            alert("Xəta baş verdi: " + error.message);
        });
});

// ==========================================
// 3. AUTHENTICATION: Telefon Girişi
// ==========================================

// ReCaptcha Hazırlığı
window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    'size': 'normal',
    'callback': (response) => {
        // ReCAPTCHA solved
    }
});

// OTP Göndərmə
window.sendOTP = () => {
    const phoneNumber = document.getElementById('phone-input').value;
    const appVerifier = window.recaptchaVerifier;

    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
        .then((confirmationResult) => {
            window.confirmationResult = confirmationResult;
            document.getElementById('step-phone').classList.add('hidden');
            document.getElementById('step-otp').classList.remove('hidden');
            alert("Kod göndərildi!");
        }).catch((error) => {
            document.getElementById('login-error').innerText = error.message;
            document.getElementById('login-error').classList.remove('hidden');
        });
};

// OTP Təsdiqləmə
window.verifyOTP = () => {
    const code = document.getElementById('otp-input').value;
    window.confirmationResult.confirm(code).then((result) => {
        const user = result.user;
        document.getElementById('login-modal').classList.add('hidden');
        alert("Xoş gəldiniz!");
    }).catch((error) => {
        alert("Kod səhvdir!");
    });
};

// Çıxış etmək
window.logoutUser = () => {
    signOut(auth).then(() => {
        alert("Çıxış edildi");
        window.location.reload();
    });
};

// İstifadəçi Statusunu İzləmə
onAuthStateChanged(auth, (user) => {
    if (user) {
        // İstifadəçi giriş edib
        loginBtn.classList.add('hidden');
        userInfo.classList.remove('hidden');
        userPhoneSpan.innerText = user.phoneNumber;

        // Admin Yoxlaması
        if (user.phoneNumber === ADMIN_PHONE) {
            adminPanel.classList.remove('hidden');
        }
    } else {
        // Çıxış edilib
        loginBtn.classList.remove('hidden');
        userInfo.classList.add('hidden');
        adminPanel.classList.add('hidden');
    }
});
