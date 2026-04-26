import { loginUser } from './api.js';

const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const result = await loginUser(email, password);
        if (result.success) {
            sessionStorage.setItem('currentUser', JSON.stringify(result.user));
            window.location.href = 'welcome.html';
        }
    } catch (error) {
        errorMessage.textContent = error.message;
    }
});
