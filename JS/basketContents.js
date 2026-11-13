async function returnBasketContents() {
    // Check if the user is authenticated.
    const { data: user, error: authError } = await window.supabaseClient.auth.getUser();
    if (authError) {
        console.error(authError)
        return;
    }
    /* Query supabase for the user's basket. This function returns an array called productsDetails, containing a set of objects containing:
        - Each product in the basket's id
        - Each product's quantity.
    */
    async function retrieveBasketContents() {
        const { data, error } = await window.supabaseClient
            .from('User Basket')
            .select('*')
            .order('created_at', { ascending: true })
        let productDetails = [];
        data.forEach((object) => {
            productDetails
                .push({
                    id: object.product_id,
                    qunatity: object.product_quantity
                })
        })
        return productDetails;
    }
    /*  This function takes the above function's return and:
        - Generates a list of product ids
        - Uses this to query supabase regarding the respective products 
        (I used this setup because obviously the user basket and products list are in different tables)
        - Creates a new array which loops over the array returned from the previous function and the array of products matching the products in the basket and:
            - Pushes the product quantity and product details to the same array
        -   This setup lets me associate the quantities with the details
    */

    async function acquireBasket() {
        let productsDetails = await retrieveBasketContents();
        let productsToAdd = productsDetails.map((product) => product.id)
        let valueToReturn = [];
        const { data: itemInBasket, error: itemRetrievalError } = await window.supabaseClient
            .from('Products')
            .select('*')
            .in('id', productsToAdd);
        console.log(itemInBasket)
        for (const product of productsDetails) {
            for (const item of itemInBasket) {
                if (Number(product.id) === Number(item.id)) {
                    valueToReturn.push([product.qunatity, item]);
                }
            }
        }
        console.log(valueToReturn);
        return valueToReturn;


    }
    return acquireBasket();
}

async function displayBasket() {
    const data = await returnBasketContents();
    const { data: user, error: authError } = await window.supabaseClient.auth.getUser();
    console.log(data);
    /*so data is an array, which contains arrays in the format [[quantity of item, iatem],[quantity of item, item(details]] etc */
    if (data[0]?.length > 0) {
            document.getElementById('BasketContainer').innerHTML = '';
            let subtotal = 0;
            let itemscount = 0;
            // Essentially renders the page if there is data in the basket.
        data.forEach((array) => {
            let productCard = document.createElement('div');
            productCard.classList.add('product');
            let section1 = document.createElement('div');
            section1.classList.add('section1');
            let section2 = document.createElement('div');
            section2.classList.add('section2');
            let section3 = document.createElement('div');
            section3.classList.add('section3');
            productCard.appendChild(section1);
            productCard.appendChild(section2);
            productCard.appendChild(section3);
            document.getElementById('BasketContainer').appendChild(productCard);

            let productImage = document.createElement('img');
            productImage.src = array[1].product_image1_path;
            section1.appendChild(productImage);

            let productName = document.createElement('h2');
            productName.textContent = array[1].product_name;
            section2.appendChild(productName);

            let productDescription = document.createElement('p');
            productDescription.textContent = array[1].product_description;
            section2.appendChild(productDescription);

            let productPrice = document.createElement('p');
            productPrice.textContent = '£' + array[1].product_price;
            section2.appendChild(productPrice);

            subtotal += array[1].product_price;
            document.getElementById('subtotalPrice').textContent = `£${subtotal.toFixed(2)}`;
            

            let productQuantity = document.createElement('input');
            productQuantity.value = array[0];
            productQuantity.readOnly = true;
            productQuantity.tabIndex = -1;
            productQuantity.style.pointerEvents = "none";
            section3.appendChild(productQuantity);

            itemscount += array[0];
            if (itemscount === 1) {
                document.getElementById('subtotalText').textContent = `Subtotal (${itemscount} item):`
            } else if (itemscount > 1){
                document.getElementById('subtotalText').textContent = `Subtotal (${itemscount} items):`
            }
            
            /* buttons (code of doom and despair) */
            let increaseButton = document.createElement('button');
            increaseButton.textContent = '+';
            increaseButton.addEventListener('click', async () => {
                const newNumber = Number(array[0]) + 1;
                console.log(array[0], array[1].id)
                console.log(user)
                const {data, error} = await window.supabaseClient
                    .from('User Basket')
                    .update({
                        product_quantity: newNumber
                    })
                    .eq('user_id', user.user.id)
                    .eq('product_id', array[1].id)
                let stockOfItems = array[1].product_stock;
                if (newNumber > stockOfItems) {
                    productQuantity.value = 1 + array[1].product_stock;
                    productQuantity.style.backgroundColor = 'red';
                    setTimeout(() => {
                        productQuantity.style.backgroundColor = 'white';
                        productQuantity.value = array[1].product_stock;
                    }, 200);
                }

                if (error) {
                    console.error(error);
                }

                await displayBasket();
            });
            section3.appendChild(increaseButton);


            let decreaseButton = document.createElement('button');
            decreaseButton.textContent = '-';
            decreaseButton.addEventListener('click', async () => {
                const newNumber = Number(array[0]) - 1;
                console.log(array[0], array[1].id)
                console.log(user)
                const {data, error} = await window.supabaseClient
                    .from('User Basket')
                    .update({
                        product_quantity: newNumber
                    })
                    .eq('user_id', user.user.id)
                    .eq('product_id', array[1].id)


                if (error) {
                    console.error(error);
                }

                await displayBasket();
            });
            section3.appendChild(decreaseButton);

            let removeButton = document.createElement('button')
            removeButton.textContent = 'Remove Item';
            removeButton.addEventListener('click', async () => {
                const {data, error} = await window.supabaseClient
                    .from('User Basket')
                    .update({
                        product_quantity: 0
                    })
                    .eq('user_id', user.user.id)
                    .eq('product_id', array[1].id)


                if (error) {
                    console.error(error);
                }

                await displayBasket();
            });
            section3.appendChild(removeButton);
            async function checkInput() {
                

                const {data, error} = await window.supabaseClient
                .from('Products')
                .select('product_stock')
                .eq('id', array[1].product_id)
                .maybeSingle();

                productQuantity.addEventListener('input', () => {
                    if (productQuantity.value > data.product_stock) {
                        productQuantity.value = 1 + data.product_stock;
                        productQuantity.style.backgroundColor = 'red';
                        setTimeout(() => {
                            productQuantity.style.backgroundColor = 'white';
                            productQuantity.value = data.product_stock;
                        }, 200);
                    }
                })
                
            }
            
            checkInput();
            

        })
    } else {
        document.getElementById('BasketContainer').innerHTML = '<a href="../store/productslanding.html"><h1>Your basket is empty....     Shop Now!</h1></a>';
    }
}

displayBasket(); 
