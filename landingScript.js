document.getElementById('priceRange').value = 6000;
let pagePrice = Number(document.getElementById('priceRange').value);
document.getElementById('priceValue').textContent = '£' + pagePrice;

let initialProducts = 0;
if (window.location.href.split('=')[1]) {
    initialProducts = `${window.location.href.split('=')[1].split('%20').join(' ')}`;
};

let selectedProducts = [];
if (initialProducts) {
    selectedProducts = [initialProducts];
    window.history.replaceState({}, '', window.location.pathname);
};

document.getElementById('priceRange').addEventListener('input', () => {
    pagePrice = Number(document.getElementById('priceRange').value);
    document.getElementById('priceValue').textContent = '£' + document.getElementById('priceRange').value;
    loadProducts();
    
});
document.getElementById('pageTitle').addEventListener('click', () => {
    window.location.href = 'index.html';
});

async function loadCheckboxes() {
     const {data, error} = await window.supabaseClient
        .from('Products')
        .select('product_category');
    
        console.log(data);
        let idIndex = 0;
        let categories = [...new Set(data.map(object => object.product_category))];
        /* add inputs for each category */
        categories.forEach(category => {
            
            let newElement = document.createElement('input');
            Object.assign(newElement, {
                value: `${category}`,
                type: 'checkbox',
                id: idIndex
            });
            newElement.checked = selectedProducts.includes(category);
            newElement.addEventListener('change', () => {
                if (newElement.checked) {
                    selectedProducts.push(newElement.value);
                    
                    loadProducts(selectedProducts);
                } else if (!newElement.checked) {
                    selectedProducts = selectedProducts.filter(item => item !== newElement.value);

                    loadProducts(selectedProducts);
                    }
                }
            )
            

            let label = document.createElement('label');
            Object.assign(label, {
                textContent: `${category}`,
                htmlFor: idIndex
            });

            idIndex += 1;
            
            document.getElementById('typeSelector').appendChild(newElement);
            document.getElementById('typeSelector').appendChild(label);
            return;
            
        });

}

async function loadProducts(selectors = selectedProducts) {
    const productCont = document.getElementById('products');
    
    const { data, error } = await window.supabaseClient
        .from("Products")
        .select("*");

    if (error) {
        console.error(error);
        return;
    }

    productCont.innerHTML = '';


    data.forEach(product => {
    if ((selectors.includes(product.product_category) || selectors.length === 0) &&
        (Number(product.product_price) <= pagePrice)) {
        let card = document.createElement('div');
        card.tabIndex = 0;
        let section1 = document.createElement('div');
        section1.classList.add('section1');
        card.appendChild(section1);
        let section2 = document.createElement('div');
        section2.classList.add('section2');
        card.appendChild(section2);
        
        card.classList.add('product');
        productCont.appendChild(card);
        
        card.addEventListener('click', function () {
            window.location.href = `product.html?id=${product.id}`;
        });

        card.addEventListener('keydown', function (a) {
            if((a.key === 'Enter') || (a.key === ' ')) {
                card.click();               
            }
        });
        
        if (product.product_image1_path) {
            let image = document.createElement('img');
            image.src = product.product_image1_path;
            image.alt = product.product_name;
            section1.appendChild(image);
        };
        

        let text = document.createElement('h2');
        text.textContent = product.product_name;
        section2.appendChild(text);

        let descr = document.createElement('p')
        descr.textContent = product.product_description;
        section2.appendChild(descr);

        let price = document.createElement('h2')
        price.textContent = 'Price: £' + product.product_price;
        section2.appendChild(price);

        return;

}}); 
        /* Now load the selectors */
 
}

/* <input type="checkbox" id="candyMachineBox" name="candyMachineBox"> <label for="candyMachineBox">Candy Machine</label> */

loadProducts();
loadCheckboxes();

 /* <div class='product'> <img src="./Imagees/blank.jpg" alt="Candy machine"> <h2>Candy Machine</h2> </div> */
