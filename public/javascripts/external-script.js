const enquiryBtnSing = document.getElementById("enquiry-btn-single");
const enquiryBtnMulti = document.getElementById("enquiry-btn-multiple");

if (enquiryBtnSing) {
    enquiryBtnSing.addEventListener("click", () => {
        const id = enquiryBtnSing.getAttribute("data-value");
        const userInput = prompt('Please enter your number & proceed:');
        if (userInput) {
            window.location.href = `/products/enquiry/single/${id}?query=` + encodeURIComponent(userInput);
        }
    });
}

if (enquiryBtnMulti) {
    enquiryBtnMulti.addEventListener("click", () => {
        const userInput = prompt('Please enter your number & proceed:');
        if (userInput) { 
            window.location.href = `/products/enquiry/multiple?query=` + encodeURIComponent(userInput); 
        }
    });
}

// --------------------------------------------------------------------------------

document.querySelectorAll('.quantity-btn').forEach(button => {
    button.addEventListener("click", () => {
        const productId = button.getAttribute("data-id");
        const input = document.getElementById(`quantity-${productId}`);
        let change = parseInt(button.getAttribute("data-value"));
        let newVal = parseInt(input.value) + change;

        // Enforce min/max values
        newVal = Math.max(1, Math.min(10, newVal));
        input.value = newVal;
    });
});

// --------------------------------------------------------------------------------

const sortType = document.getElementById('sort-type');
if(sortType) {
    sortType.addEventListener('change', (e) => {
        updateSort(e.target.value);
    });
}

function updateSort(value) {
    const [sortBy, sortOrder] = value.split('_');
    const url = new URL(window.location.href);
    url.searchParams.set('sortBy', sortBy);
    url.searchParams.set('sortOrder', sortOrder);
    window.location = url.toString();
}