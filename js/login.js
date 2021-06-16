// const BASE_URL = 'http://localhost:8080/api';
const BASE_URL = 'http://contact-ptithcm.herokuapp.com/api';


function handleLogin(formData) {
    login(formData)
        .then(function (response) {
            response.json()
                .then(function (result) {
                    if (response.status === 200) {
                        localStorage.setItem('account', JSON.stringify(result));
                        window.location.href = 'http://127.0.0.1:5500/index.html';
                    } else if (response.status === 401) {
                        document.querySelector('.form-message-login-failed').innerText = result.message;
                    } else {
                        document.querySelector('.form-message-login-failed').innerText = "An unknown error";
                    }
                })
        })
        .catch(function (error) {
            console.log(error);
        });
}

function login(formData) {
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    };

    return new Promise(function (resolve, reject) {
        fetch(BASE_URL + '/login', options)
            .then(function (response) {
                resolve(response);
            })
            .catch(function (error) {
                reject(error);
            });
    });
}

function handleRegister(formData) {
    register(formData)
        .then(function (response) {
            response.json()
                .then(function (result) {
                    if (response.status === 200) {
                        localStorage.setItem('account', JSON.stringify(result));
                        window.location.href = 'http://127.0.0.1:5500/index.html';
                    } else if (response.status === 403) {
                        document.querySelector('.form-message-register-failed').innerText = result.message;
                    } else {
                        document.querySelector('.form-message-register-failed').innerText = "An unknown error";
                    }
                })
        })
        .catch(function (error) {
            console.log(error);
        });
}

function register(formData) {
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    }

    return new Promise(function (resolve, reject) {
        fetch(BASE_URL + '/register', options)
            .then(function (response) {
                resolve(response);
            })
            .catch(function (error) {
                reject(error);
            })
    })
}
