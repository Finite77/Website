async function updateProductPage() {
    const id = new URLSearchParams(window.location.search).get('id')
    const {data , error} = await window.supabaseClient
    .from('Products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

    console.log(data);

    document.getElementById('mainImage').src = data.product_image1_path;
    if(data.product_image2_path) {
        document.getElementById('secondImage').src = data.product_image2_path;
    }
    if(data.product_image3_path) {
        document.getElementById('thirdImage').src = data.product_image3_path;
    }
    if(data.product_image4_path) {
        document.getElementById('fourthImage').src = data.product_image4_path;
    }

    document.querySelector('.descriptionText').innerHTML = data.product_full_description;
    /* document.querySelector('.itemName').textContent = data.product_name;
    document.querySelector('.itemDescription').textContent = data.product_description;
    document.querySelector('.itemPrice').textContent = '£' + data.product_price; */
    const paypalContainer = document.createElement('div');
    paypalContainer.id = `paypal-container-${data.item_paypal_id}`;
    document.getElementById('paypalContainer').appendChild(paypalContainer);
    paypal.HostedButtons({ hostedButtonId: data.item_paypal_id }).render(`#${paypalContainer.id}`);
    
    /* proof of concept if you can call it that */
    
}

document.querySelectorAll('img').forEach(image => {
    image.tabIndex = 0;
    image.addEventListener('click' , () => {
        document.getElementById('imageVisualiser').classList.remove('hidden');
        document.getElementById('visualiserImage').src = image.src;
    });

    image.addEventListener('keydown', (a) => {
        if((a.key === 'Enter') || (a.key === ' ')) {
            image.click();               
        }
    })
    document.getElementById('remove').addEventListener('click', () => {
        document.getElementById('imageVisualiser').classList.add('hidden');
    });


});
document.addEventListener('DOMContentLoaded', () => {
    updateProductPage();
});