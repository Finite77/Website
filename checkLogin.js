async function signOut() {
  const { error } = await window.supabaseClient.auth.signOut()
}

async function checkloggedInAndDoStuff() {
    const {data, error} = await window.supabaseClient.auth.getSession();
    if(data.session) {
        let dashboardButton = document.createElement('button')
        dashboardButton.textContent = 'Dashboard';
        dashboardButton.addEventListener('click', () => {
            window.location.href = 'dashboard.html'
        })
        document.querySelector('.div-in-navbar-2').appendChild(dashboardButton);

        let logoutButton = document.createElement('button')
        logoutButton.textContent = 'Logout';
        logoutButton.addEventListener('click', async () => {
            await signOut();
            window.location.href = 'index.html'
        })
        document.querySelector('.div-in-navbar-2').appendChild(logoutButton);
    } else {
        let loginButton = document.createElement('button');
        loginButton.textContent = 'Login';
        loginButton.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
        document.querySelector('.div-in-navbar-2').appendChild(loginButton);
        let signupButton = document.createElement('button');
        signupButton.textContent = 'Signup';
        signupButton.addEventListener('click', () => {
            window.location.href = 'signup.html';
        });
        document.querySelector('.div-in-navbar-2').appendChild(signupButton);
    }
}

checkloggedInAndDoStuff();