const MY_NUMBER = "994509795781";

window.onload = function() {
    const savedPhone = localStorage.getItem('userPhone');
    if (savedPhone) {
        showUser(savedPhone);
    }
};

function openModal() {
    document.getElementById('login-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('login-modal').classList.add('hidden');
}

function saveUser() {
    const phoneInput = document.getElementById('phone-input');
    const phone = phoneInput.value.trim();

    if (phone.length >= 7) {
        localStorage.setItem('userPhone', phone);
        showUser(phone);
        closeModal();
    } else {
        alert("Zəhmət olmasa düzgün nömrə daxil edin!");
    }
}

function showUser(phone) {
    document.getElementById('login-btn').classList.add('hidden');
    document.getElementById('user-info').classList.remove('hidden');
    document.getElementById('user-display').innerText = phone;
}

function logout() {
    localStorage.removeItem('userPhone');
    location.reload();
}

function orderTour(tourName) {
    const phone = localStorage.getItem('userPhone');
    
    if (!phone) {
        alert("Sifariş üçün əvvəlcə qeydiyyatdan keçməlisiniz!");
        openModal();
        return;
    }

    const message = `Salam! Mən ${phone} nömrəsi ilə saytdan qeydiyyat keçdim. ${tourName} üçün rezervasiya etmək istəyirəm. Zəhmət olmasa ətraflı məlumat verərdiniz.`;
    const encodedMsg = encodeURIComponent(message);
    
    window.open(`https://wa.me/${MY_NUMBER}?text=${encodedMsg}`, '_blank');
}
