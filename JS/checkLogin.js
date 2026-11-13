async function signOut() {
  const { error } = await window.supabaseClient.auth.signOut()
}

async function checkloggedInAndDoStuff() {
    const {data, error} = await window.supabaseClient.auth.getSession();
    if(data.session) {
        let basketButton = document.createElement('button')
        basketButton.textContent = 'Basket';
        basketButton.addEventListener('click', () => {
            window.location.href = '../store/basket.html'
        })
        document.querySelector('.div-in-navbar').appendChild(basketButton);

        let logoutButton = document.createElement('button')
        logoutButton.textContent = 'Logout';
        logoutButton.addEventListener('click', async () => {
            await signOut();
            window.location.href = '../store/index.html'
        })
        document.querySelector('.div-in-navbar').appendChild(logoutButton);
    } else {
        let loginButton = document.createElement('button');
        loginButton.textContent = 'Login';
        loginButton.addEventListener('click', () => {
            window.location.href = '../store/login.html';
        });
        document.querySelector('.div-in-navbar').appendChild(loginButton);
        let signupButton = document.createElement('button');
        signupButton.textContent = 'Signup';
        signupButton.addEventListener('click', () => {
            window.location.href = '../store/signup.html';
        });
        document.querySelector('.div-in-navbar').appendChild(signupButton);
    }
}

checkloggedInAndDoStuff();