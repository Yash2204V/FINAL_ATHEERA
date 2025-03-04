document.getElementById('fileInput').addEventListener('change', function () {
    handleFiles(this.files);
});

function handleFiles(files) {
    const p = document.getElementById("status");
    let count = files.length;
    if (count > 5) {
        alert('You can only upload up to 5 images.');
        count = 5; // Limit to 5 images
        files = Array.from(files).slice(0, 5);
    }
    p.textContent = `Uploaded ${count}, left ${5 - count}`;

    document.getElementById('fileCount').textContent = `Selected ${count} image(s)`;
    // Here you could add code to show thumbnails or image previews if needed
}

document.getElementById('add-variant').addEventListener('click', function () {
    const container = document.getElementById('variants-container');
    const index = container.children.length;

    const newVariant = document.createElement('div');
    newVariant.classList.add('variant-entry', 'bg-gray-50', 'p-4', 'rounded-lg', 'border', 'border-gray-200');

    newVariant.innerHTML = `
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Model No</label>
                                    <input name="variants[${index}][modelno]" type="text" 
                                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                </div>

                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Size</label>
                                        <select name="variants[${index}][size]" 
                                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                            <option value="None">Select Size</option>
                                            <option value="XS">XS</option>
                                            <option value="S">S</option>
                                            <option value="M">M</option>
                                            <option value="L">L</option>
                                            <option value="XL">XL</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Tone</label>
                                        <input name="variants[${index}][tone]" type="text" 
                                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                        <input name="variants[${index}][price]" type="text" 
                                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Discount Price</label>
                                        <input name="variants[${index}][discount]" type="text" 
                                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                        <input name="variants[${index}][quantity]" type="text" 
                                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    </div>
                                </div>
                            </div>
                            `;
    container.appendChild(newVariant);
});

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