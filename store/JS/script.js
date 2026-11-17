document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('ProductSelector').selectedIndex = 0;
});
document.getElementById("ProductSelector").addEventListener("change", function() {
    if (document.getElementById("ProductSelector").value) {
        window.location.href = document.getElementById("ProductSelector").value;
    }
});

document.getElementById('pageTitle').addEventListener('click', () => {
    window.location.href = '../store/index.html';
});