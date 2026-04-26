import { registerUser } from './api.js';

const MAX_NAME_SYMBOLS = 30;
const MAX_PHONE_DIGITS = 10;

const form = document.getElementById('registerForm');
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const nickname = document.getElementById('nickname');
const phone = document.getElementById('phone');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const passComplexityHint = document.getElementById('passwordComplexity');
const termsLink = document.getElementById('termsLink');
const termsBox = document.getElementById('terms');
const regBtn = document.getElementById('regBtn');

let termsRead = false;

// INPUT MASKS
[firstName, lastName].forEach(input => {
    input.addEventListener('input', () => {
        let value = input.value
        .replace(/[^a-zA-Z\- ]/g, '')
        .replace(/[\- ]{2,}/g, (match) => match[0]) // We collapse consecutive (--, __, -_, _-) into one symbol
        .replace(/^[\- ]+/, '');

        
        if (value.length > MAX_NAME_SYMBOLS) {
            value = value.substring(0, MAX_NAME_SYMBOLS);
        }

        input.value = value
    });
    
    input.addEventListener('blur', (e) => {
        input.value = input.value.replace(/[\- ]+$/, '');
    });
});

nickname.addEventListener('input', () => {
    let value = nickname.value
    .replace(/[^a-zA-Z0-9\-_ ]/g, '') 
    .replace(/[\-_ ]{2,}/g, (match) => match[0]) 
    .replace(/^[0-9\-_ ]+/, '');

    if (value.length > MAX_NAME_SYMBOLS) {
        value = value.substring(0, MAX_NAME_SYMBOLS);
    }

    nickname.value = value;
});

nickname.addEventListener('blur', (e) => {
    nickname.value = nickname.value.replace(/[\-_ ]+$/, '');
});

phone.addEventListener('input', () => {
    phone.value = phone.value
    .replace(/\D/g, '')
    .replace(/^0+/, '0');

    const limit = phone.value.startsWith('0') ? MAX_PHONE_DIGITS : MAX_PHONE_DIGITS - 1;

    phone.value = phone.value.substring(0, limit);
});

phone.addEventListener('blur', (e) => {
    phone.value = phone.value.length >= (MAX_PHONE_DIGITS - 2) && !phone.value.startsWith('0') ? `0${phone.value}` : phone.value;
});

// PASSWORD VALIDATION
const validatePassword = () => {
    const val = password.value;
    if (!val) {
        passComplexityHint.textContent = "";
        return false;
    }

    const rules = [
        { ok: val.length >= 8, label: "8+ chars" },
        { ok: /[A-Z]/.test(val), label: "uppercase" },
        { ok: /[a-z]/.test(val), label: "lowercase" },
        { ok: /[0-9]/.test(val), label: "number" },
        { ok: /[!@#$%^&*()_=+\-.,\\~]/.test(val), label: "special" }
    ];

    const failed = rules.filter(r => !r.ok).map(r => r.label);
    const isStrong = failed.length === 0;

    passComplexityHint.textContent = isStrong ? "Strong password" : "Need: " + failed.join(', ');
    passComplexityHint.style.color = isStrong ? "#28a745" : "#ffa500";
    
    return isStrong;
};

const checkPasswordsMatch = () => {
    if (!confirmPassword.value) {
        confirmPassword.style.borderColor = "#ddd";
        return false;
    }
    const isMatch = password.value === confirmPassword.value;
    confirmPassword.style.borderColor = isMatch ? "#28a745" : "#dc3545";
    return isMatch;
};

// LOGIC TERMS & CONDITIONS
termsLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Security and privacy are our priority.");
    termsRead = true;
    termsBox.disabled = false;
    checkFormValidity();
});

// GENERAL FORM VALIDATION
const checkFormValidity = () => {
    const isFormValid = form.checkValidity();
    const passIsStrong = validatePassword();
    const passMatches = checkPasswordsMatch();
    const isTermsAccepted = termsBox.checked && termsRead;

    regBtn.disabled = !(isFormValid && passIsStrong && passMatches && isTermsAccepted);
};

form.addEventListener('input', checkFormValidity);
termsBox.addEventListener('change', checkFormValidity);

// SENDING DATA
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    document.querySelectorAll('.error-text').forEach(el => el.textContent = '');
    document.querySelectorAll('input').forEach(el => el.classList.remove('invalid-field'));

    const userData = {
        firstName: firstName.value,
        lastName: lastName.value,
        nickname: nickname.value,
        dob: document.getElementById('dob').value,
        phone: phone.value,
        email: document.getElementById('email').value,
        password: password.value,
        notifications: document.getElementById('notifications').checked
    };

    try {
        regBtn.disabled = true;
        regBtn.textContent = "Registering...";
        
        
        const result = await registerUser(userData);

        if (result.success) {
            sessionStorage.setItem('currentUser', JSON.stringify(result.user));
            window.location.href = 'welcome.html';
        } else {
            firstName.value = result.user.firstName;
            lastName.value = result.user.lastName;
            nickname.value = result.user.nickname;
            phone.value = result.user.phone;
            email.value = result.user.email;
            document.getElementById('dob').value = result.user.dob;
            document.getElementById('notifications').checked = result.user.notifications;

            // 2. Отображение ошибок
            Object.entries(result.errors).forEach(([field, message]) => {
                const inputElement = document.getElementById(field);
                const errorElement = document.getElementById(`err-${field}`);
                if (inputElement) inputElement.classList.add('invalid-field');
                if (errorElement) errorElement.textContent = message;
            });

            // Обнуляем пароли для безопасности
            password.value = '';
            confirmPassword.value = '';
            regBtn.textContent = "Sign Up";
            checkFormValidity(); // Пересчитываем активность кнопки
        }
    } catch (error) {
        regBtn.disabled = false;
        regBtn.textContent = "Sign Up";
    }
});
