async function checkSignIn() {
    const {data, error} = await window.supabaseClient.auth.getSession();
    if(data.session) {
        console.log(data);
    } else {
        window.location.href = '../store/login.html';
    }
}
checkSignIn()
