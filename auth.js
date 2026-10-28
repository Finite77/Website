document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('otherPage').addEventListener('click', () => {
        window.location.href = 'login.html'
    })
    let username;
    let password;

    async function signUp(email, password) {
    const { data, error } = await window.supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
        emailRedirectTo: 'http://127.0.0.1:5500/dashboard.html',
        },  
    })

    document.getElementById('feedbackBox').textContent = '';

    console.log(data);
    console.log(error.code);
    if(error) {
        if (error.code === 'email_not_confirmed') {
            document.getElementById('feedbackBox').textContent = 'Email has not been confirmed. Please, confirm email to log in.'
        } else if (error.code === 'email_rate_limit_exceeded') {
            document.getElementById('feedbackBox').textContent = 'Too many requests from this device in a short time. Try again later.'
        } else if (error.code === 'weak_password') {
            document.getElementById('feedbackBox').textContent = 'Password is too weak! For best results, make the password at least 8 characters long.'
        } else if (error.code === 'validation_failed') {
            document.getElementById('feedbackBox').textContent = 'Invalid email/ password! Try again.'
        }
    }
    /*
    if(data.session == null) {
        document.getElementById('feedbackBox').textContent = 'i h8 my life but nevertheless you already signed up before so go login'
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000)
        
    } */
    };

    document.getElementById('submitDetails').addEventListener('click', () => {
        username = document.getElementById('emailInput').value;
        password = document.getElementById('passwordInput').value;
        signUp(username, password);
    });

    
    
});