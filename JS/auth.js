// placeholder function until i implement the button which replaces login and sign up if youre alr logged in

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('otherPage').addEventListener('click', () => {
        window.location.href = '../store/login.html'
    })
    document.getElementById('backHome').addEventListener('click', () => {
        window.location.href = '../store/index.html'
    });
    let username;
    let password;

    async function signUp(email, password) {
    const { data, error } = await window.supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
        emailRedirectTo: 'http://127.0.0.1:5500/store/productslanding.html',
        },  
    })

    document.getElementById('feedbackBox').textContent = '';
    console.log(data);
    if(data.user) {
        document.getElementById('feedbackBox').textContent = 'i h8 my life but nevertheless you already signed up before so go login'
        setTimeout(() => {
            window.location.href = '../store/login.html';
        }, 4000)
        
    } else if(error) {
        console.error(JSON.stringify(error));
        console.log(error.code);
        if (error.code === 'email_not_confirmed') {
            document.getElementById('feedbackBox').textContent = 'Email has not been confirmed. Please, confirm email to log in.'
        } else if (error.code === 'email_rate_limit_exceeded') {
            document.getElementById('feedbackBox').textContent = 'Too many requests from this device in a short time. Try again later.'
        } else if (error.code === 'weak_password') {
            document.getElementById('feedbackBox').textContent = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol.'
        } else if (error.code === 'validation_failed') {
            document.getElementById('feedbackBox').textContent = 'Invalid email/ password! Try again.'
        } else if ((error.message) && error.message === 'Error sending confirmation email') {
            document.getElementById('feedbackBox').textContent = 'Error sending confirmation email. Please check your email address and try again.'
            document.getElementById('emailInput').style.borderColor = 'red';
        } else {
            document.getElementById('feedbackBox').textContent = 'Yeah idk what happened but there have been some errors.'
        }
    } else {
        document.getElementById('feedbackBox').textContent = 'Email sent. Check your email to complete the signup!'
    }

    return error;
    
    
    };

    document.getElementById('submitDetails').addEventListener('click', async () => {
        username = document.getElementById('emailInput').value;
        password = document.getElementById('passwordInput').value;
        passwordCheck = document.getElementById('confirmPasswordInput').value;

            if (password.length < 8) {
                document.getElementById('feedbackBox').textContent = 'Password is too short! Please make it at least 8 characters long.'
                document.getElementById('passwordInput').style.borderColor = 'red';
                document.getElementById('confirmPasswordInput').style.borderColor = 'red';
                return;
            }
            if (password !== passwordCheck) {
                document.getElementById('feedbackBox').textContent = 'Passwords do not match! Please try again.'
                document.getElementById('passwordInput').style.borderColor = 'red';
                document.getElementById('confirmPasswordInput').style.borderColor = 'red';
                return;
            }
            const textRegex = /[a-z]/;
            const capsRegex = /[A-Z]/;
            const numberRegex = /[0-9]/;
            const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
            if (!textRegex.test(password) || !numberRegex.test(password) || !symbolRegex.test(password) || !capsRegex.test(password)) {
                document.getElementById('feedbackBox').textContent = 'Password must contain at least one letter, one number, and one symbol. Please try again.'
                document.getElementById('passwordInput').style.borderColor = 'red';
                document.getElementById('confirmPasswordInput').style.borderColor = 'red';
                return;
            }
        await signUp(username, password);
    });

    
    
});