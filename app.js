// ----------------------------------------------login page ----------------------------------------------
document.querySelectorAll('.input')?.forEach((input) => {
    input.addEventListener('focus', function () {
        this.previousElementSibling.classList.add('input-content-hidden');
    });
    input.addEventListener('blur', function () {
        this.value === "" ? this.previousElementSibling.classList.remove('input-content-hidden') : "";
    });
});


// click register link
document.getElementById('register')?.addEventListener('click', () => {
    location.href = './register.html';
});
// click login btn
document.getElementById('login-btn')?.addEventListener('click', () => {
    let email = document.getElementById('login-email').value;
    let pass = document.getElementById('login-password').value;
    loginValidator(email, pass) ? location.href = './products.html' : alertify.error("invalid data");
});

//validation login informations
function loginValidator(email, pass) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const emailRegex = /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])$/;
    return passwordRegex.test(pass) && emailRegex.test(email);
    // return true;

}


// ----------------------------------------------register page ----------------------------------------------
document.getElementById('login')?.addEventListener('click', () => {
    location.href = './index.html';
});