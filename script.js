// Product list
const productList = [
    { id: 1, name: "Rice (1 kg)", price: 60 },
    { id: 2, name: "Milk (1 L)", price: 30 },
    { id: 3, name: "Bread", price: 40 },
    { id: 4, name: "Sugar (1 kg)", price: 45 },
    { id: 5, name: "Cooking Oil (1 L)", price: 140 },
    { id: 6, name: "Biscuits", price: 20 },
    { id: 7, name: "Eggs (6 pcs)", price: 42 },
    { id: 8, name: "Soap", price: 35 }
];

// Shopping cart
let cart = [];

// Get HTML elements
const searchInput = document.getElementById("search");
const productsElement = document.getElementById("products");
const cartElement = document.getElementById("cart");
const messageElement = document.getElementById("message");

// Event listeners
searchInput.addEventListener("input", showProducts);

document.getElementById("generate-bill")
    .addEventListener("click", checkout);

document.getElementById("clear-cart")
    .addEventListener("click", clearCart);


// Display products
function showProducts() {

    const search = searchInput.value.trim().toLowerCase();

    const filtered = productList.filter(product =>
        product.name.toLowerCase().includes(search)
    );

    productsElement.innerHTML = filtered.map(product => `
        <div class="product">

            <div>
                <strong>${escapeHTML(product.name)}</strong><br>
                ₹${product.price.toFixed(2)}
            </div>

            <button type="button" data-add="${product.id}">
                Add +
            </button>

        </div>
    `).join("") || '<p class="empty">No products found.</p>';

}


// Add products to cart
productsElement.addEventListener("click", event => {

    const button = event.target.closest("[data-add]");

    if (!button) return;

    addToCart(Number(button.dataset.add));

});


function addToCart(id) {

    const product = productList.find(item => item.id === id);

    if (!product) return;

    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    messageElement.textContent =
        ${product.name} added to the bill.;

    renderCart();

}


// Change product quantity
function changeQty(id, value) {

    const item = cart.find(product => product.id === id);

    if (!item) return;

    const qty = Number(value);

    if (!Number.isInteger(qty) || qty < 1) {

        messageElement.textContent =
            "Please enter a whole-number quantity of at least 1.";

        renderCart();

        return;
    }

    item.qty = qty;

    renderCart();

}


// Remove product from cart
function removeItem(id) {

    cart = cart.filter(item => item.id !== id);

    renderCart();

}


// Detect quantity changes
cartElement.addEventListener("change", event => {

    const input = event.target.closest("[data-qty]");

    if (!input) return;

    changeQty(Number(input.dataset.qty), input.value);

});


// Detect remove button clicks
cartElement.addEventListener("click", event => {

    const button = event.target.closest("[data-remove]");

    if (!button) return;

    removeItem(Number(button.dataset.remove));

});


// Display cart and calculate totals
function renderCart() {

    if (cart.length === 0) {

        cartElement.innerHTML =
            '<p class="empty">No products added yet.</p>';

    } else {

        cartElement.innerHTML = cart.map(item => `

            <div class="bill-item">

                <div>
                    <strong>${escapeHTML(item.name)}</strong><br>
                    ₹${item.price.toFixed(2)} each
                </div>

                <input
                    class="qty"
                    type="number"
                    min="1"
                    step="1"
                    value="${item.qty}"
                    aria-label="Quantity for ${escapeHTML(item.name)}"
                    data-qty="${item.id}"
                >

                <div>
                    ₹${(item.price * item.qty).toFixed(2)}

                    <button
                        type="button"
                        class="remove"
                        data-remove="${item.id}"
                        aria-label="Remove ${escapeHTML(item.name)}"
                    >×</button>
                </div>

            </div>

        `).join("");

    }

    // Calculate subtotal
    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
    );

    // Calculate GST at the demonstration rate of 5%
    const gst = subtotal * 0.05;

    // Calculate final amount
    const total = subtotal + gst;

    // Display totals
    document.getElementById("subtotal").textContent =
        subtotal.toFixed(2);

    document.getElementById("gst").textContent =
        gst.toFixed(2);

    document.getElementById("total").textContent =
        total.toFixed(2);

}


// Clear the cart
function clearCart() {

    cart = [];

    document.getElementById("customer").value = "";

    document.getElementById("payment").value = "Cash";

    messageElement.textContent = "";

    renderCart();

}


// Generate and print the bill
function checkout() {

    if (cart.length === 0) {

        messageElement.textContent =
            "Please add products before generating a bill.";

        return;
    }

    const customer =
        document.getElementById("customer").value.trim()
        || "Walk-in Customer";

    const payment =
        document.getElementById("payment").value;

    const billNumber =
        Date.now().toString().slice(-8);

    // Calculate bill amounts
    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
    );

    const gst = subtotal * 0.05;

    const total = subtotal + gst;

    // Create product rows for the receipt
    const rows = cart.map(item => `
        <tr>
            <td>${escapeHTML(item.name)}</td>
            <td>${item.qty}</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>₹${(item.price * item.qty).toFixed(2)}</td>
        </tr>
    `).join("");

    // Open receipt in a new window
    const billWindow = window.open("", "_blank");

    if (!billWindow) {

        messageElement.textContent =
            "Pop-up blocked. Allow pop-ups to print the bill.";

        return;
    }

    // Display receipt
    billWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <title>Daymart Receipt</title>

            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 25px;
                    color: #222;
                }

                h2, p {
                    text-align: center;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th, td {
                    padding: 9px 4px;
                    border-bottom: 1px solid #ddd;
                    text-align: left;
                }

                .summary {
                    text-align: right;
                    line-height: 1.8;
                }

                button {
                    padding: 10px 16px;
                    background: #147d58;
                    color: white;
                    border: 0;
                    border-radius: 6px;
                    cursor: pointer;
                }

                @media print {
                    button {
                        display: none;
                    }

                    body {
                        padding: 0;
                    }
                }
            </style>

        </head>

        <body>

            <h2>DAYMART SUPERMARKET</h2>

            <p>Customer: ${escapeHTML(customer)}</p>

            <p>Bill No: ${billNumber}</p>

            <p>Date: ${new Date().toLocaleString()}</p>

            <table>

                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Amount</th>
                    </tr>
                </thead>

                <tbody>
                    ${rows}
                </tbody>

            </table>

            <div class="summary">

                <p>Subtotal: ₹${subtotal.toFixed(2)}</p>

                <p>GST (5% demo rate): ₹${gst.toFixed(2)}</p>

                <h3>Total: ₹${total.toFixed(2)}</h3>

                <p>Payment: ${escapeHTML(payment)}</p>

            </div>

            <p>Thank you for shopping with us!</p>

            <p style="text-align:center">
                <button onclick="window.print()">Print Bill</button>
            </p>

        </body>
        </html>
    `);

    billWindow.document.close();

}


// Escape special HTML characters
function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"

    })[character]);

}


// Load products and empty cart when page opens
showProducts();

renderCart();