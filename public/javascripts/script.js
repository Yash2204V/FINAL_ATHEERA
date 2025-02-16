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

let page = '<%= currentPage + 1 %>';
let loading = false;
let hasMore = true; // Assume there are more products initially
const productsContainer = document.getElementById('products-container');
const loadingElement = document.getElementById('loading');
const noMoreProductsElement = document.getElementById('no-more-products');

function loadMoreProducts() {
    if (loading || !hasMore) return; // Stop if already loading or no more products
    loading = true;
    loadingElement.style.display = 'block';

    fetch(`/products/shop?page=${page}&category=<%= onlyCategory %>&query=<%= searchQuery %>&sortBy=<%= sortBy %>&sortOrder=<%= sortOrder %>`)
        .then(response => response.json())
        .then(data => {
            if (data.products.length > 0) {
                data.products.forEach(product => {
                    const productHTML = `
                        <div class="group rounded bg-white shadow overflow-hidden">
                            <div class="relative">
                                <img class="w-full h-64 object-cover" src="data:${product.images[0].contentType};base64,${product.images[0].imageBuffer.toString('base64')}" alt="Uploaded Image">
                                <a href="/products/product/${product._id}" class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition"></a>
                            </div>
                            <div class="pt-4 pb-3 px-4">
                                <a href="/products/product/${product._id}">
                                    <h4 class="capitalize font-medium text-xl mb-2 text-gray-800 hover:text-primary transition">${product.title}</h4>
                                    <div class="flex items-baseline mb-1 space-x-2">
                                        <p class="text-xl text-primary font-roboto font-semibold">₹${product.variants[0].price}</p>
                                        <p class="text-sm text-gray-400 font-roboto line-through">₹${product.variants[0].price + 10}</p>
                                    </div>
                                    <div class="flex items-center">
                                        <div class="flex gap-1 text-sm text-yellow-400">
                                            <span><i class="fas fa-star"></i></span>
                                            <span><i class="fas fa-star"></i></span>
                                            <span><i class="fas fa-star"></i></span>
                                            <span><i class="fas fa-star"></i></span>
                                            <span><i class="fas fa-star"></i></span>
                                        </div>
                                    </div>
                                </a>
                            </div>
                            <a href="/products/addtocart/${product._id}?direct=true" class="block w-full py-1 text-center text-white bg-primary border border-primary rounded-b hover:bg-transparent hover:text-primary transition">Add to Cart</a>
                        </div>
                    `;
                    productsContainer.insertAdjacentHTML('beforeend', productHTML);
                });
                page++;
                hasMore = data.hasMore; // Update hasMore based on server response
            } else {
                hasMore = false; // No more products to load
            }

            loading = false;
            loadingElement.style.display = 'none';

            // Show "No more products" message if there are no more products
            if (!hasMore) {
                noMoreProductsElement.style.display = 'block';
            }
        });
}

window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && hasMore) {
        loadMoreProducts();
    }
});