document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('otherPage').addEventListener('click', () => {
        window.location.href = 'signup.html'
    })
    let username;
    let password;

    async function signIn(email, password) {
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
        options: {
        emailRedirectTo: 'http://127.0.0.1:5500/dashboard.html',
        },
    })
    console.log(data); 
    
    if(error) {
        console.log(error.code);
        if (error.code === 'email_not_confirmed') {
            document.getElementById('feedbackBox').textContent = 'Email has not been confirmed. Please, confirm email to log in.'
        } else if (error.code === 'email_rate_limit_exceeded') {
            document.getElementById('feedbackBox').textContent = 'Too many requests from this device in a short time. Try again later.'
        }
    }
    /* if(data.session == null) {
        document.getElementById('feedbackBox').textContent = 'i h8 my life but nevertheless you already signed up before so go login'
        setTimeout(() => {
            window.location.href = 'signup.html';
        }, 2000)
        
    } */
    }; 

    document.getElementById('submitDetails').addEventListener('click', () => {
        username = document.getElementById('emailInput').value;
        password = document.getElementById('passwordInput').value;
        signIn(username, password);
    });

    
    
});