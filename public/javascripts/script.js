let menuBar = document.querySelector('#menuBar')
let mobileMenu = document.querySelector('#mobileMenu')
let closeMenu = document.querySelector('#closeMenu')
let closeIcon = document.querySelector('#close-icon');
let filter = document.querySelector('#filter-category');
let categoryDiv = document.querySelector('#category-div');

menuBar.addEventListener('click', function () {
    mobileMenu.classList.remove('hidden')
})

closeMenu.addEventListener('click', function () {
    mobileMenu.classList.add('hidden')
})

let categoryBar = document.querySelector('#categoryBar')
let mobileCategory = document.querySelector('#mobileCategory')
let closeCategory = document.querySelector('#closeCategory')

categoryBar.addEventListener('click', function () {
    mobileCategory.classList.remove('hidden')
})

closeCategory.addEventListener('click', function () {
    mobileCategory.classList.add('hidden')
})

// let the user when click to filter: the relative div appear, and when the user either click to filter or closeIcon: the relative div will disappear.
let divOpen = false;
filter.addEventListener('click', function () {
    if (divOpen) {
        categoryDiv.classList.add("hidden");
    } else {
        categoryDiv.classList.remove("hidden");
    }
    divOpen = !divOpen;
})

closeIcon.addEventListener('click', function () {
    categoryDiv.classList.add("hidden");
})

function updateSort(value) {
    const [sortBy, sortOrder] = value.split('_');
    const url = new URL(window.location.href);
    url.searchParams.set('sortBy', sortBy);
    url.searchParams.set('sortOrder', sortOrder);
    window.location = url.toString();
}

function toggleElement(id) {
    const element = document.getElementById(id);
    const icon = document.querySelector(`[data-target="${id}"] i`);
    if (element && icon) {
        element.classList.toggle('hidden');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-bars');
    }
}


// Cart
function updateQuantity(btn, change) {
    const form = btn.closest('form');
    const input = form.querySelector('.quantity-input');
    let newVal = parseInt(input.value) + change;

    // Enforce min/max values
    newVal = Math.max(1, Math.min(10, newVal));
    input.value = newVal;
}

// Enquiry

function enquiry(id){
    var userInput = prompt('Please enter your number & proceed:'); 
    if (userInput) { 
        window.location.href = `/products/enquiry/single/${id}?query=` + encodeURIComponent(userInput); 
    }

}

function enquiryBulk(){
    var userInput = prompt('Please enter your number & proceed:'); 
    if (userInput) { 
        window.location.href = `/products/enquiry/multiple?query=` + encodeURIComponent(userInput); 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const scrollPosition = localStorage.getItem("scrollPosition");
    if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition, 10));
    }
    const saveScrollPosition = () => {
        localStorage.setItem("scrollPosition", window.scrollY);
    };

    window.addEventListener("beforeunload", saveScrollPosition);
    return () => window.removeEventListener("beforeunload", saveScrollPosition);
});