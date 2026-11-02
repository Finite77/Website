document.getElementById('numberToBasket').addEventListener('input', () => {
    if (document.getElementById('numberToBasket').value > 10) {
        document.getElementById('numberToBasket').value = 10;
    }
})

async function checkBasketValues(itemId){
    const {data, error: loginError} = await window.supabaseClient.auth.getUser();
    const {data: basketItem, error} = await window.supabaseClient
        .from('User Basket')
        .select('*')
        .eq('user_id', data.user.id)
        .eq('product_id', itemId);
    
    console.log(data);
    console.log(basketItem);
    if(basketItem.length > 0) {
        return [basketItem, basketItem[0].product_quantity];
    } else {
        return ['',''];
    }
}

async function sendBasket() {
    let item = new URLSearchParams(window.location.search).get('id');
    const {data, error: loginError} = await window.supabaseClient.auth.getUser();
    let basketValues;
    let quantity;
    try {
        [basketValues, quantity] = await checkBasketValues(item);
    } catch (e) {
        console.error(e);
        console.log("There has been an error, esteemed customer. I would be, hopefully, somewhat less confused than you are regarding this error (if you aren't and you're reading this i'm worried for the safety of my website). Unfortunately for your probably confused self, I cannot see your screen. Terrible.  ")
    }
    if ((basketValues === '') && (quantity === '')) {
        basketValues = false;
    }
    
    console.log(basketValues);
    if (!basketValues) {
        const {error: basketError} = await window.supabaseClient
        .from('User Basket')
        .insert({
            user_id: data.user.id,
            product_id: item,
            product_quantity: document.getElementById('numberToBasket').value
        })
    } else if (basketValues) {
        const {error: basketError2} = await window.supabaseClient
        .from('User Basket')
        .update({
            product_quantity: (Number(document.getElementById('numberToBasket').value) + quantity)
        })
        .eq('user_id', data.user.id)
        .eq('product_id', item)

        
    }
    
}
async function checkLoginAndAllowAddToBasket() {
        const {data, error} = await window.supabaseClient.auth.getSession();
        if(error) {
            console.log(error);
        }
        if(!data.session) {
            document.getElementById('addToBasket').textContent = 'Login to add items to basket!'
            document.getElementById('addToBasket').addEventListener('click', () => {
                window.location.href = 'login.html';
            })
        } else {
            document.getElementById('addToBasket').addEventListener('click', async () => {
                await sendBasket();
            })
            
        }
}

checkLoginAndAllowAddToBasket();
