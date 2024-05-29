// ------------------------ V-Models ------------------------
// requet vm
function reqParams(controller, action, queryString, token, method) {
    this.controller = controller;
    this.action = action;
    this.queryString = queryString;
    this.token = token;
    this.method = method;
}
const Method = {
    POST: 'POST',
    GET: 'GET',
    PUT: 'PUT',
    DELETE: 'DELETE'
};
// login-user v_model
function loginUserVM(email, password) {
    this.email = email;
    this.password = password;
}
// register-user v_model
function registerUserVM(name, surname, email, password) {
    this.name = name;
    this.surname = surname;
    this.email = email;
    this.password = password;
}

// ------------------------ Services ------------------------
// request sender service
function request(data, reqParams, successCallBack, errorCallBack) {
    let url = generateUrl(reqParams);
    $.ajax({
        type: reqParams.method,
        url: url,
        data: JSON.stringify(data),
        dataType: "json",
        contentType: "application/json",
        headers: {
            'Authorization': 'Bearer ' + reqParams.token
        },
        success: (response) => {
            successCallBack(response);
        },
        error: (error) => {
            errorCallBack(error.responseText);
        }
    });
}
// url generator service
function generateUrl(reqParams) {
    return "http://localhost:5000/api" +
        (reqParams.controller !== null ? `/${reqParams.controller}` : "") +
        (reqParams.action !== null ? `/${reqParams.action}` : "") +
        (reqParams.queryString !== null ? `?${reqParams.queryString}` : "") +
        (reqParams.token !== null ? (reqParams.queryString !== null ? "&" : "?") + `token=${reqParams.token}` : "");
}




// ----------------------------------------------login page ----------------------------------------------

$('.input').each(function () {
    $(this).on('focus', function () {
        $(this).prev().addClass('input-content-hidden');
    });

    $(this).on('blur', function () {
        $(this).val() === "" ? $(this).prev().removeClass('input-content-hidden') : "";
    });
});


// click register link
$(document).ready(() => {
    $('#register')?.on('click', () => {
        location.href = './register.html';
    });
});


//validation login informations
function loginValidator(email, pass) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/;
    return passwordRegex.test(pass) && emailRegex.test(email);
}



// ----------------------------------------------register page ----------------------------------------------
// click login link
$(document).ready(() => {

    $('#login')?.on('click', () => {
        location.href = './index.html';
    });
});

// registration
$(document).ready(() => {
    $('#register-btn').on('click', () => {
        // register();
        let user = new registerUserVM(
            $('#register-name').val(),
            $('#register-surname').val(),
            $('#register-email').val(),
            $('#register-password').val());

        let req_params = new reqParams('auth', 'register', null, null, Method.POST);

        request(user, req_params,
            (resp) => {
                alertify.success("user registered successdfully");
                location.href = './index.html';
            },
            (error) => {
                alertify.error(error);
            });
    });
});


// login
$(document).ready(() => {

    $('#login-btn')?.on('click', () => {
        let email = $('#login-email').val();
        let pass = $('#login-password').val();
      
        if (!loginValidator(email, pass)) {
            alertify.error("invalid data");
            return;
        }
        let user = new loginUserVM(
            $('#login-email').val(),
            $('#login-password').val());

        let req_params = new reqParams('auth', 'login', null, null, Method.POST);

        request(user, req_params,
            (resp) => {
                setCookie('token', resp.user.token);
                setCookie('userId', resp.user.id);
                alertify.success(resp.msg);
                location.href = './products.html';
            },
            (error) => {
                error === undefined ? alertify.error("server is not responfing") : alertify.error(error);
            });
    });

});

// on page loads
document.addEventListener('DOMContentLoaded', async () => {
    const currentPage = window.location.pathname;

    // products page loading
    if (currentPage.includes('products.html'))
        loadProductContent();

    // orders page loading
    else if (currentPage.includes('orders.html')) {
        loadOrderContent((items) => {
            const uniqueProducts = items.reduce((acc, currentItem) => {
                const productId = currentItem.productId;
                if (!acc[productId]) {
                    acc[productId] = 1;
                } else {
                    acc[productId] += 1;
                }
                return acc;
            }, {});

            $('#totalPrice').text('0');
            $('#totalQuantity').text('0');
            (Object.entries(uniqueProducts)).map(([productId, count]) => {
                generateOrderCard(productId, count);
            });
        },
            (error) => {
                alertify.error(error ? error : "you do not have any order");
            });
    }

    // details page loading
    else if (currentPage.includes('details.html')) {
        var id = window.location.href.substring(window.location.href.indexOf('=') + 1);
        let product = await getSingleProduct(id);
        loadDetailContent(product);
    }
});

// loading order content
function loadOrderContent(callback, errorCallBack) {
    let req_params = new reqParams('orders', null, null, getCookie('token'), Method.GET);
    request(null, req_params,
        (resp) => {
            callback(resp.orderItems);
        },
        (error) => {
            errorCallBack(error);
        });
}

// generation order cards
async function generateOrderCard(orderId, count) {

    let product = await getSingleProduct(orderId);
    $('#totalPrice').text(parseInt($('#totalPrice').text()) + product.price * count);
    $('#totalQuantity').text(parseInt($('#totalQuantity').text()) + count);
    $('#taxResult').text(parseFloat(($('#tax').text().replace('%', '').replace(':', '')).trim().split(' ')[1])
        * $('#totalPrice').text());
    console.log(product);
    // Create the main order component div
    const orderComponent = document.createElement('div');
    orderComponent.className = 'order-component';

    // Create the line div
    const lineDiv = document.createElement('div');
    lineDiv.className = 'line';
    orderComponent.appendChild(lineDiv);

    // Create the component item div
    const componentItem = document.createElement('div');
    componentItem.className = 'component-item';

    // Create the right side part 2 div
    const rightSidePart2 = document.createElement('div');
    rightSidePart2.className = 'right-side-part-2 special-right-side-part-2';

    // Create the content div
    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';
    const p1 = document.createElement('p');
    p1.textContent = product.title;
    const p2 = document.createElement('p');
    p2.textContent = product.description;
    p2.style.width = '250px'
    const price = document.createElement('p');
    price.textContent = product.price + ' $';
    contentDiv.appendChild(p1);
    contentDiv.appendChild(p2);
    contentDiv.appendChild(price);

    rightSidePart2.appendChild(contentDiv);

    // Create the sizes div
    const sizesDiv = document.createElement('div');
    sizesDiv.className = 'sizes-div';
    const sizeP = document.createElement('p');
    sizeP.textContent = 'SIZE';
    sizesDiv.appendChild(sizeP);
    const sizes = document.createElement('div');
    sizes.className = 'sizes';

    for (let i = 0; i < product.size.length; i++) {
        const size = document.createElement('div');
        size.className = 'size-1';
        size.textContent = product.size[i];
        sizes.appendChild(size);

        $(size).hover(function () {
            $('.size-1').css('background-color', 'transparent');
            $(this).css('background-color', 'green');
        });
    }

    sizesDiv.appendChild(sizes);
    rightSidePart2.appendChild(sizesDiv);

    // Create the colors div
    const colorsDiv = document.createElement('div');
    colorsDiv.className = 'colors-div';
    const colorP = document.createElement('p');
    colorP.textContent = 'COLOR';
    colorsDiv.appendChild(colorP);
    const colors = document.createElement('div');
    colors.className = 'colors';

    for (let i = 0; i < product.colors.length; i++) {
        const color = document.createElement('div');
        color.className = 'color-1';
        color.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.5)';
        color.style.backgroundColor = product.colors[i];
        colors.appendChild(color);

        $(color).hover(function () {
            $('.color-1').css('border', '4px solid transparent');
            $(this).css('border', '4px solid white');
        });
    }

    colorsDiv.appendChild(colors);
    rightSidePart2.appendChild(colorsDiv);

    // Create the price div
    const priceDiv = document.createElement('div');
    priceDiv.className = 'price-div';
    const priceP = document.createElement('p');
    priceP.textContent = product.price;
    priceDiv.appendChild(priceP);
    rightSidePart2.appendChild(priceDiv);

    // Create the add to cart button
    const addButton = document.createElement('button');
    addButton.textContent = 'Add to cart';
    rightSidePart2.appendChild(addButton);

    componentItem.appendChild(rightSidePart2);

    // Create the right panel div
    const rightPanel = document.createElement('div');
    rightPanel.className = 'right-panel';

    // Create the left div for increment and decrement buttons
    const leftDiv = document.createElement('div');
    leftDiv.className = 'left';
    const incrementButton = document.createElement('button');
    incrementButton.addEventListener('click', () => {
        incrementItem(product.id);
    });
    incrementButton.id = 'increment-btn';
    const incrementIcon = document.createElement('i');
    incrementIcon.className = 'fa-solid fa-plus';
    incrementButton.appendChild(incrementIcon);

    const quantity = document.createElement('p');
    quantity.textContent = count;
    quantity.id = 'quantity' + product.id;

    const decrementButton = document.createElement('button');
    decrementButton.id = 'decrement-btn';

    decrementButton.addEventListener('click', () => {
        decrementItem(product.id);
    });
    const decrementIcon = document.createElement('i');
    decrementIcon.className = 'fa-solid fa-minus';
    decrementButton.appendChild(decrementIcon);

    leftDiv.appendChild(incrementButton);
    leftDiv.appendChild(quantity);
    leftDiv.appendChild(decrementButton);
    rightPanel.appendChild(leftDiv);

    // Create the image element
    const img = document.createElement('img');
    img.src = product.gallery[0];
    img.alt = '';
    rightPanel.appendChild(img);

    componentItem.appendChild(rightPanel);
    orderComponent.appendChild(componentItem);

    // Append the order component to the container
    document.getElementById('orders-container').appendChild(orderComponent);
}


// loading detail content
function loadDetailContent(product) {
    // Create main detail body
    const detailBody = document.createElement('div');
    detailBody.classList.add('detail-body');

    // Create left side content
    const leftSide = document.createElement('div');
    leftSide.classList.add('left-side');

    // Create images for left side
    product.gallery.forEach(imageUrl => {
        const img = document.createElement('img');
        img.classList.add('left-side-img');
        img.src = imageUrl;

        img.addEventListener('click', function () {
            $('.left-side-img').css('border', '2px solid black');
            $('.right-side-part-1 img').attr('src', imageUrl);
            $(this).css('border', '2.5px solid green');
        });

        leftSide.appendChild(img);
    });

    // Create right side content
    const rightSide = document.createElement('div');
    rightSide.classList.add('right-side');

    // Create right side part 1
    const rightSidePart1 = document.createElement('div');
    rightSidePart1.classList.add('right-side-part-1');
    const img1 = document.createElement('img');
    img1.src = product.gallery[0];
    rightSidePart1.appendChild(img1);

    // Create right side part 2
    const rightSidePart2 = document.createElement('div');
    rightSidePart2.classList.add('right-side-part-2');

    // Create content section
    const content = document.createElement('div');
    content.classList.add('content');
    content.innerHTML = `<p>Apollo</p><p>${product.description}</p>`;
    rightSidePart2.appendChild(content);

    // Create sizes section
    const sizesDiv = document.createElement('div');
    sizesDiv.classList.add('sizes-div');
    sizesDiv.innerHTML = '<p>SIZE</p><div class="sizes"></div>';

    product.size.forEach(size => {
        const sizeDiv = document.createElement('div');
        sizeDiv.classList.add('size-1');
        sizeDiv.textContent = size;
        sizesDiv.querySelector('.sizes').appendChild(sizeDiv);

        $(sizeDiv).hover(function () {
            $('.size-1').css('background-color', 'transparent');
            $(this).css('background-color', 'green');
        });
    });

    rightSidePart2.appendChild(sizesDiv);

    // Create colors section
    const colorsDiv = document.createElement('div');
    colorsDiv.classList.add('colors-div');
    colorsDiv.innerHTML = '<p>COLOR</p><div class="colors"></div>';

    product.colors.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.classList.add('color-1');
        colorDiv.style.backgroundColor = color;
        colorDiv.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.5)';
        colorsDiv.querySelector('.colors').appendChild(colorDiv);

        $(colorDiv).hover(function () {
            $('.color-1').css('border', '4px solid transparent');
            $(this).css('border', '4px solid white');
        });
    });

    rightSidePart2.appendChild(colorsDiv);

    // Create price section
    const priceDiv = document.createElement('div');
    priceDiv.classList.add('price-div');
    priceDiv.innerHTML = `<p>PRICE</p><p>${product.price}$</p>`;
    rightSidePart2.appendChild(priceDiv);

    // Create add to cart button
    const addButton = document.createElement('button');
    addButton.textContent = 'Add to cart';
    rightSidePart2.appendChild(addButton);

    // Create description text
    const description = document.createElement('p');
    description.textContent = 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolorum incidunt ipsam reiciendis';
    rightSidePart2.appendChild(description);

    // Append content of right side part 1 and right side part 2 to right side
    rightSide.appendChild(rightSidePart1);
    rightSide.appendChild(rightSidePart2);

    // Append content of left side and right side to main detail body
    detailBody.appendChild(leftSide);
    detailBody.appendChild(rightSide);

    // Append main detail body to the document body
    document.getElementById('detailBody').appendChild(detailBody);


}


// loading product content
function loadProductContent() {
    let req_params = new reqParams('products', null, null, getCookie('token'), Method.GET);
    request(null, req_params,
        (resp) => {
            resp.product.map((product) => {
                generateProductCard(product);
            });
        },
        (error) => {
            alertify.error(error);
        });
}



// generation product cards
function generateProductCard(product) {
    // Create main card div
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';

    // Create img-div and image element
    const imgDiv = document.createElement('div');
    imgDiv.className = 'img-div';
    const img = document.createElement('img');
    img.src = product.gallery[0];
    imgDiv.appendChild(img);

    // Create content div and paragraphs
    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';
    const productName = document.createElement('p');
    productName.textContent = product.title;
    const productPrice = document.createElement('p');
    productPrice.textContent = product.price;
    contentDiv.appendChild(productName);
    contentDiv.appendChild(productPrice);

    // Create card-shopping-btn link
    const shoppingBtn = document.createElement('a');
    shoppingBtn.className = 'card-shopping-btn';
    shoppingBtn.id = product.id;
    // added event
    cardDiv.addEventListener('click', (e) => {
        location.href = './details.html?id=' + product.id;
    });
    shoppingBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        createOrder(product.id);
    });
    const shoppingIcon = document.createElement('i');
    shoppingIcon.className = 'fa-solid fa-cart-plus';
    shoppingIcon.style.color = 'white';
    shoppingBtn.appendChild(shoppingIcon);

    // Append all parts to the card div
    cardDiv.appendChild(imgDiv);
    cardDiv.appendChild(contentDiv);
    cardDiv.appendChild(shoppingBtn);

    // Append the card to the card container
    document.getElementById('card-container').appendChild(cardDiv);
}



// ----------------------- cookie operations -----------------------
// set cookie
function setCookie(key, value) {
    document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value) + ";path=/";
}

//get cookie
function getCookie(key) {
    var name = key + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(';');
    for (var i = 0; i < cookieArray.length; i++) {
        var cookie = cookieArray[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) == 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return "";
}


// ---------------------- order page ----------------------

// order product 
$(document).ready(() => {
    $('#product-basket').on('click', () => {
        location.href = './orders.html';
    });
});


// get product by id from api
function getSingleProduct(id) {
    return new Promise((resolve, reject) => {
        let req_params = new reqParams(`products/${id}`, null, null, getCookie('token'), Method.GET);
        request(null, req_params,
            (resp) => {
                resolve(resp.product);
            },
            (error) => {
                alertify.error(error);
                reject(error);
            });
    });
}


//creating order
function createOrder(orderId) {
    loadOrderContent((items) => {
        items.push({ productId: orderId });
        const orderBody = {
            orderItems: items,
            userId: getCookie("userId")
        };
        sendOrder(orderBody);
    },
        (error) => {
            const orderBody = {
                orderItems: { productId: orderId },
                userId: getCookie("userId")
            };
            sendOrder(orderBody);
        });
}


// send order
function sendOrder(orderBody) {
    let req_params = new reqParams('orders', null, null, getCookie('token'), Method.PUT);
    request(orderBody, req_params,
        (resp) => {
            alertify.success("Order was successfully");
        },
        (error) => {
            alertify.error(error);
        });
}


//decrement order
function decrementItem(id) {
    loadOrderContent((items) => {
        const index = items.findIndex(item => item.productId === id);

        if (index !== -1)
            items.splice(index, 1);
        const orderBody = {
            orderItems: items,
            userId: getCookie("userId")
        };
        sendOrder(orderBody);
        parseInt(document.getElementById('quantity' + id).textContent) === 1 ? location.reload() : "";
        changeOrderContent(items);
        document.getElementById('quantity' + id).textContent = parseInt(document.getElementById('quantity' + id).textContent) - 1;
    },
        (error) => {
            alertify.error('error => ' + error);
        });
}


// increment order
function incrementItem(id) {
    loadOrderContent((items) => {
        items.push({ productId: id });
        const orderBody = {
            orderItems: items,
            userId: getCookie("userId")
        };
        sendOrder(orderBody);
        changeOrderContent(items);
        document.getElementById('quantity' + id).textContent = parseInt(document.getElementById('quantity' + id).textContent) + 1;
    },
        (error) => {
            alertify.error('error => ' + error);
        });


}


// calcluate orders price
async function calculateAgain(orderId, count) {
    let product = await getSingleProduct(orderId);
    $('#totalPrice').text(parseInt($('#totalPrice').text()) + product.price * count);
    $('#totalQuantity').text(parseInt($('#totalQuantity').text()) + count);
    $('#taxResult').text(parseFloat(($('#tax').text().replace('%', '').replace(':', '')).trim().split(' ')[1])
        * $('#totalPrice').text());
    console.log(product);
}


//change order content
function changeOrderContent(items) {
    const uniqueProducts = items.reduce((acc, currentItem) => {
        const productId = currentItem.productId;
        if (!acc[productId]) {
            acc[productId] = 1;
        } else {
            acc[productId] += 1;
        }
        return acc;
    }, {});

    $('#totalPrice').text('0');
    $('#totalQuantity').text('0');
    (Object.entries(uniqueProducts)).map(([productId, count]) => {
        calculateAgain(productId, count);
    });
}