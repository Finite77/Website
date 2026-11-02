async function updateProductPage() {
    const id = new URLSearchParams(window.location.search).get('id')
    const {data , error} = await window.supabaseClient
    .from('Products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

    console.log(data);

    document.getElementById('mainImage').src = data.product_image1_path;
    /* document.querySelector('.itemName').textContent = data.product_name;
    document.querySelector('.itemDescription').textContent = data.product_description;
    document.querySelector('.itemPrice').textContent = '£' + data.product_price; */
    const paypalContainerId = `paypal-container-${data.item_paypal_id}`;
    document.getElementById('paypalContainer').insertAdjacentHTML(
        'beforeend',
        `<div id="${paypalContainerId}"></div>`
    );

    const paypalScript = document.createElement('script');
    paypalScript.textContent = `paypal.HostedButtons({ hostedButtonId: ${JSON.stringify(data.item_paypal_id)} }).render("#${paypalContainerId}")`;
    document.body.appendChild(paypalScript);
    
    /* proof of concept if you can call it that */
    
}

document.querySelectorAll('img').forEach(image => {
    image.addEventListener('click' , () => {
        document.getElementById('imageVisualiser').classList.remove('hidden');
        document.getElementById('visualiserImage').src = image.src;
    });
    document.getElementById('remove').addEventListener('click', () => {
        document.getElementById('imageVisualiser').classList.add('hidden');
    });


});
document.addEventListener('DOMContentLoaded', () => {
    updateProductPage();
});