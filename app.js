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
// user vm
function loginUserVM(email, password) {
    this.email = email;
    this.password = password;
}

function registerUserVM(name, surname, email, password) {
    this.name = name;
    this.surname = surname;
    this.email = email;
    this.password = password;
}

// request service
function request(data, reqParams, successCallBack, errorCallBack) {
    let url = generateUrl(reqParams);
    // alert(url);
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

function generateUrl(reqParams) {
    return "http://localhost:5000/api" +
        (reqParams.controller !== null ? `/${reqParams.controller}` : "") +
        (reqParams.action !== null ? `/${reqParams.action}` : "") +
        (reqParams.queryString !== null ? `?${reqParams.queryString}` : "") +
        (reqParams.token !== null ? (reqParams.queryString !== null ? "&" : "?") + `token=${reqParams.token}` : "");
}


// imports
// import { Method,reqParams } from './Models/requestParams.js';
// import { registerUserVM,loginUserVM } from './Models/UserVM.js';
// import { request} from './Services/requestService.js';

// // ----------------------------------------------login page ----------------------------------------------

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


// click login btn
// $(document).ready(() => {
//     $('#login-btn')?.on('click', () => {
//         let email = $('#login-email').value;
//         let pass = $('#login-password').value;
//         loginValidator(email, pass) ? location.href = './products.html' : alertify.error("invalid data");
//     });
// });

//validation login informations
function loginValidator(email, pass) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const emailRegex = /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])$/;
    return passwordRegex.test(pass) && emailRegex.test(email);
    // return true;

}


// // ----------------------------------------------register page ----------------------------------------------
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
        let email = $('#login-email').value;
        let pass = $('#login-password').value;
        if (loginValidator(email, pass)) {
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
                alertify.error(error);
            });
    });

});

// on page loads
document.addEventListener('DOMContentLoaded', async () => {
    const currentPage = window.location.pathname;
    if (currentPage.includes('products.html'))
        loadProductContent();
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

            (Object.entries(uniqueProducts)).map(([productId, count]) => {
                generateOrderCard(productId, count);
            });

        },
            (error) => {
                alertify.error(error ? error : "you do not have any order");
            });
    }
    else if (currentPage.includes('details.html')) {
        var id = window.location.href.substring(window.location.href.indexOf('=') + 1);
        let product = await getSingleProduct(id);
        loadDetailContent(product);

    }
});


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


async function generateOrderCard(orderId, count) {

    let product = await getSingleProduct(orderId);
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
    contentDiv.appendChild(p1);
    contentDiv.appendChild(p2);

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
        color.className = product.colors[i];
        color.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.5)';
        color.style.backgroundColor = product.colors[i];
        colors.appendChild(color);
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
    quantity.id = 'quantity'+product.id;

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
        img.src = imageUrl;
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


function setCookie(key, value) {
    document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value) + ";path=/";
}

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


// order page
$(document).ready(() => {
    $('#product-basket').on('click', () => {
        location.href = './orders.html';
    });
});


// shopping btn
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


$('#increment-btn').on('click', () => {

});




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
        document.getElementById('quantity'+id).textContent=parseInt(document.getElementById('quantity'+id).textContent) -1; 
    },
        (error) => {
            const orderBody = {
                orderItems: { productId: orderId },
                userId: getCookie("userId")
            };
            sendOrder(orderBody);
        });
}

function incrementItem(id) {
    loadOrderContent((items) => {
        items.push({ productId: id });
        const orderBody = {
            orderItems: items,
            userId: getCookie("userId")
        };
        sendOrder(orderBody);
        document.getElementById('quantity'+id).textContent=parseInt(document.getElementById('quantity'+id).textContent) +1; 
    },
        (error) => {
            const orderBody = {
                orderItems: { productId: orderId },
                userId: getCookie("userId")
            };
            sendOrder(orderBody);
        });


}