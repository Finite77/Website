function moveButtonsToMenu() {
    document.querySelector(".menu-container").replaceChildren(...document.querySelector('.div-in-navbar').children);
    document.querySelector('.div-in-navbar').innerHTML = '';

    let menuButton = document.createElement('button');
    menuButton.id = 'menuButton'
    menuButton.textContent = "Menu";
    menuButton.addEventListener('click', () => {
        document.querySelector(".menu-container").classList.remove("hidden1");
    });

    let removeButton = document.createElement('button');
    removeButton.id = 'removeButton'
    removeButton.textContent = 'Remove'
    removeButton.addEventListener('click', () => {
        document.querySelector('.menu-container').classList.add('hidden1')
    })

    document.querySelector('.div-in-navbar').appendChild(menuButton);
    document.querySelector('.menu-container').appendChild(removeButton);
}

function moveButtonsBack() {
    document.getElementById('removeButton').remove();
    document.getElementById('menuButton').remove();
    document.querySelector('.div-in-navbar').replaceChildren(...document.querySelector('.menu-container').children)
    document.querySelector('.menu-container').innerHTML = '';
    

    document.querySelector(".menu-container").classList.add("hidden1");
}


let madeSmallOnce;
let madeBigOnce;

if (window.innerWidth < 600) {
    moveButtonsToMenu(); 
    madeBigOnce = false;
    madeSmallOnce = true;
}

if (window.innerWidth > 600) {
    madeBigOnce = true;
    madeSmallOnce = false;
}

window.addEventListener("resize", () => {
    if (window.innerWidth < 600 && (madeSmallOnce === false)) {
        moveButtonsToMenu();
        madeSmallOnce = true;
        madeBigOnce = false;
    } else if (window.innerWidth >= 600  && (madeBigOnce === false)) {
        moveButtonsBack();
        madeBigOnce = true;
        madeSmallOnce = false;
    }
});