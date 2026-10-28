document.addEventListener('DOMContentLoaded', () => {
    let username;
    let password;
    document.getElementById('submitDetails').addEventListener('click', () => {
        username = document.getElementById('emailInput').value;
        password = document.getElementById('passwordInput').value;
    });

    async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
        email: 'valid.email@supabase.io',
        password: 'example-password',
        options: {
        emailRedirectTo: 'https://example.com/welcome',
        },
    })
    }
    signUp(username, password);
});