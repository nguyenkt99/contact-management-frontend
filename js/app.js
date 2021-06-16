// const BASE_URL = 'http://localhost:8080/api';
const BASE_URL = 'http://contact-ptithcm.herokuapp.com/api';
const account = JSON.parse(localStorage.getItem('account'));

start();

function start() {
    // interceptor
    if (localStorage.getItem('account') === null) {
        window.location.href = 'http://127.0.0.1:5500/login.html';
        return;
    }

    // Clear contact id in localStorage
    localStorage.removeItem('id');

    // Show user's info and logout  
    var userElement = document.createElement('a');
    userElement.innerHTML = `
        <span class="btn info-acc">${account.fullName}
        <a href="" onclick="logout()" class="nav-item">Log out</a>
        </span>
        
    `;
    document.querySelector('.navbar').appendChild(userElement);

    handleDisplayContacts();
}

function handleDisplayContacts() {
    // Get user's contacts and display
    getContacts(account.id)
        .then(function (contacts) {
            localStorage.removeItem('contacts');
            var sortedContacts = sortContactsByName(contacts);
            localStorage.setItem('contacts', JSON.stringify(sortedContacts));
            render(sortedContacts);
        })
        .catch(function (error) {
            console.log(error);
        });
}

// Get user's contacts
function getContacts(accountId) {
    return new Promise(function (resolve, reject) {
        fetch(BASE_URL + "/contacts" + "?accountId=" + accountId)
            .then(function (response) {
                resolve(response.json());
            })
            .catch(function (error) {
                reject(error + "\nError get contacts!!!");
            });
    });
}

function createContact(formData) {
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    };

    return new Promise(function (resolve, reject) {
        fetch(BASE_URL + "/contacts" + "/" + account.id, options)
            .then(function (response) {
                resolve(response);
            })
            .catch(function (error) {
                reject(error);
            });
    });
}


function editContact(formData, id) {
    var options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    };

    return new Promise(function (resolve, reject) {
        fetch(BASE_URL + '/contacts' + '/' + account.id + '/' + id, options)
            .then(function (response) {
                resolve(response);
            })
            .catch(function (error) {
                reject(error);
            });
    });

}

function handleDeleteContact(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteContact(id)
                .then(function (response) {
                    console.log(response);
                    Swal.fire(
                        'Deleted!',
                        'Your article has been deleted.',
                        'success'
                    )
                    handleDisplayContacts();
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    })
}

function deleteContact(id) {
    return new Promise(function (resolve, reject) {
        fetch(BASE_URL + "/contacts" + '/' + id, { method: 'DELETE' })
            .then(function () {
                resolve('Xóa thành công!');
            })
            .catch(function () {
                reject('Xóa không thành công!');
            });
    })
}


function findContact() {
    var name = document.querySelector('input[name="find"]').value;
    var contacts = JSON.parse(localStorage.getItem('contacts'));
    var contactsFound = contacts.filter(function (contact) {
        return contact.name.toLowerCase().trim().indexOf(name.toLowerCase().trim()) !== -1;
    });

    render(contactsFound);
}

function getBase64(imgFile) {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.readAsDataURL(imgFile);
        reader.onload = function () {
            resolve(reader.result)
        }
        reader.onerror = function (error) {
            reject('Error: ', error);
        }
    });
}

function logout() {
    localStorage.removeItem('contacts');
    localStorage.removeItem('account');
    window.location.replace('http://127.0.0.1:5500/login.html');
}


function sortContactsByName(contacts) {
    return contacts.sort(function (a, b) {
        return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
    });
}

// Show full info
function showFullInfo(id) {
    openAddContactForm();
    localStorage.setItem('id', id);
    var contacts = JSON.parse(localStorage.getItem('contacts'));
    var contact = contacts.find(function (item) {
        return item.id === id;
    });
    renderInfo(contact);
}

function removeScroll() {
    let body = document.getElementsByTagName('body')[0];
    body.classList.remove('scroll-body');
}

function closeAddContactForm(event) {
    event.preventDefault();
    document.querySelector('.modal-window').remove();
    removeScroll();
}

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            console.log(e.target.result)
            document.getElementById('blah').setAttribute('src', e.target.result);
        };

        reader.readAsDataURL(input.files[0]);
    }
}


function handleSubmit(data) {
    var id = localStorage.getItem('id');
    if (id === null) {
        createContact(data)
            .then(function (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Contact added',
                    showConfirmButton: false,
                    timer: 2000
                })
                removeScroll();
                handleDisplayContacts();
                document.querySelector('.modal-window').remove();
            })
            .catch(function (error) {
                console.log(error)
            });
    } else {
        console.log(data);
        editContact(data, id)
            .then(function (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Contact edited',
                    showConfirmButton: false,
                    timer: 2000
                })
                removeScroll();
                handleDisplayContacts();
                document.querySelector('.modal-window').remove();
            })
            .catch(function (error) {
                console.log(error)
            });
    }
}


// Render contacts
function render(contacts) {
    var listContactBlock = document.querySelector('.list-contact');
    var htmls = contacts.map(function (contact) {
        return `
        <div class="col l-3 m-4 xs-6">
        <div class="contact-item">
        <div class="contact-item__head">
        <span class="contact-item__thumb">
        <img src="${contact.photo}" alt="" class="contact-item__photo img-responsive">
        </span>
                        <h5 class="contact-item__name">${contact.name}</h5>
                    </div>
                    <div class="contact-item__content">
                        <span class="contact-item__email">Email: ${contact.emails[0].emailAddress}</span>
                        <span class="contact-item__phone">Phone: ${contact.phones[0].phoneNumber}</span>
                        <span class="contact-item__address">Address: ${contact.address}</span>
                    </div>
                    <div class="contact-item__footer">
                        <a onclick="showFullInfo(${contact.id})" href="#open-modal" class="contact-item__btn--edit btn"><i
                                class="fas fa-user-edit"></i>Detail</a>
                    </div>
                    <div class="contact-item__footer">
                        <button onclick="handleDeleteContact(${contact.id})" class="contact-item__btn--delete btn"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
    listContactBlock.innerHTML = htmls.join('');
}


// Render full info
function renderInfo(contact) {
    document.querySelector('input[name="name"]').value = contact.name;
    document.querySelector('input[name="address"]').value = contact.address;

    // fill phones
    var modalPhoneElement = document.querySelector('.modal-phone');
    modalPhoneElement.innerHTML = '<label for="phones">Phone</label>';
    contact.phones.forEach(function (phone) {
        var phoneItemElement = document.createElement('div');
        phoneItemElement.className = 'phone-item';
        phoneItemElement.classList.add('form-group');
        phoneItemElement.innerHTML = `
            <div class = "wp-form">
                <select class="form-control phone-type" name="phone-type" rules="required">
                    <option value="">-- Select --</option>
                    <option value="personal">Personal</option>
                    <option value="company">Company</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                </select>
                <input type="text" name="phone-number" rules="required|phone|min:10" class="form-control" value=${phone.phoneNumber}>
                <i class="fas fa-times-circle item__icon btn-remove"></i>
            </div>
            <span class="form-message"></span>                    
        `;
        phoneItemElement.querySelector(".phone-type").value = phone.type;
        // add event remove phone item
        phoneItemElement.querySelector('.btn-remove').addEventListener('click', function () {
            this.parentElement.remove();
        });
        modalPhoneElement.appendChild(phoneItemElement);
    });
    var addMorePhoneElement = document.createElement('span');
    addMorePhoneElement.setAttribute("onclick", "addMorePhone()");
    addMorePhoneElement.className = 'add-more';
    addMorePhoneElement.id = 'add_phone';
    addMorePhoneElement.innerHTML = `<i class="fas fa-plus"></i>Add more`;
    modalPhoneElement.appendChild(addMorePhoneElement);

    // fill emails
    var modalEmailElement = document.querySelector('.modal-email');
    modalEmailElement.innerHTML = '<label for="emails">Email</label>';
    contact.emails.forEach(function (email) {
        var emailItemElement = document.createElement('div');
        emailItemElement.className = 'email-item';
        emailItemElement.classList.add('form-group');
        emailItemElement.innerHTML = `
            <div class = "wp-form">
                <select class="form-control email-type" name="email-type" rules="required">
                    <option value="">-- Select --</option>
                    <option value="personal">Personal</option>
                    <option value="company">Company</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                </select>
                <input type="text" name="email-address" rules="required|email" class="form-control" value=${email.emailAddress}>
                <i class="fas fa-times-circle item__icon btn-remove"></i>
            </div>
            <span class="form-message"></span>                    
        `;
        emailItemElement.querySelector('.email-type').value = email.type;
        // add event remove email item
        emailItemElement.querySelector('.btn-remove').addEventListener('click', function () {
            this.parentElement.remove();
        });
        modalEmailElement.appendChild(emailItemElement);
    });
    var addMoreEmailElement = document.createElement('span');
    addMoreEmailElement.setAttribute("onclick", "addMoreEmail()");
    addMoreEmailElement.className = 'add-more';
    addMoreEmailElement.id = 'add_email';
    addMoreEmailElement.innerHTML = `<i class="fas fa-plus"></i>Add more`;
    modalEmailElement.appendChild(addMoreEmailElement);

    document.querySelector('#blah').src = contact.photo;
}


// Open form add contact
function openAddContactForm() {
    // Scroll  form
    let body = document.getElementsByTagName('body')[0];
    body.classList.add('scroll-body');
    
    if (localStorage.getItem('id') !== null) {
        localStorage.removeItem('id');
    }

    // if form add contact is existing then remove from DOM
    if (document.querySelector('.modal-window')) {
        document.querySelector('.modal-window').remove();
    }

    var formAdd = document.createElement('div');
    formAdd.className = 'modal-window';
    formAdd.id = 'open-modal';
    formAdd.innerHTML = `
        <div class="modal-form">
            <a href="#" title="Close" onclick=closeAddContactForm(event) class="modal-close"><i class="fas fa-window-close"></i></a>
            <form action="" method="POST" id="create-contact-form">
                <div class="modal-name form-group">
                    <label for="name">Name</label>
                    <input id="name" name="name" rules="required" type="text" class="form-control">
                    <span  class="form-message"></span>                    
                </div>
                <div class="modal-phone">
                    <label for="phones">Phone</label>
                    <div class="phone-item form-group">
                        <div class = "wp-form">
                            <select class="form-control phone-type" name="phone-type" id="phone-type" rules="required">
                                <option value="">-- Select --</option>
                                <option value="personal">Personal</option>
                                <option value="company">Company</option>
                                <option value="education">Education</option>
                                <option value="other">Other</option>
                            </select>
                            <input name="phone-number" rules="required|phone|min:10" type="text" class="form-control">
                            <i class="fas fa-times-circle item__icon"></i>
                        </div>
                        <span class="form-message"></span>                    
                    </div>
                    <span onclick="addMorePhone()" class="add-more" id="add_phone"><i class="fas fa-plus"></i>Add
                        more</span>
                </div>

                <div class="modal-email">
                <label for="emails">Email</label>
                    <div class="email-item form-group">
                        <div class = "wp-form">
                            <select class="form-control email-type" name="email-type" id="email-type" rules="required">
                                <option value="">-- Select --</option>    
                                <option value="personal">Personal</option>
                                <option value="company">Company</option>
                                <option value="education">Education</option>
                                <option value="other">Other</option>
                            </select>
                            <input name="email-address" rules="required|email" type="text" class="form-control">
                            <i class="fas fa-times-circle item__icon"></i>
                        </div>
                        <span class="form-message"></span>                    
                    </div>
                    <span onclick="addMoreEmail()" class="add-more" id="add_email"><i class="fas fa-plus"></i>Add
                        more</span>
                </div>
                <div class="modal-address form-group">
                    <label for="address">Address</label>
                    <input id="address" name="address" rules="required" type="text" class="form-control">
                    <span class="form-message"></span>                    
                </div>
                <div class="modal-avatar"> 
                    <label for="img">Select Avatar</label>
                    <input type="file" id="img" name="photo" accept="image/*" onchange="readURL(this);">
                    <img id="blah" src="" alt="your image" />
                </div>
                <!--<button onclick="handleCreateContact()" type="button" class="btn-submit">Submit</button>-->
                <button class="btn-submit">Submit</button>
            </form>
        </div>
    `;
    document.querySelector('body').appendChild(formAdd);

    // Validator
    var form = new Validator('#create-contact-form');
    form.onSubmit = function (formData) {
        handleSubmit(formData);
    }
}


function addMorePhone() {
    var modalPhoneElement = document.querySelector('.modal-phone');
    var phoneItemElement = document.createElement('div');
    phoneItemElement.className = 'phone-item';
    phoneItemElement.classList.add('form-group');
    phoneItemElement.innerHTML = `
    <div class = "wp-form">
        <select class="form-control phone-type" name="phone-type" id="phone-type" rules="required">
            <option value="">-- Select --</option>    
            <option value="personal">Personal</option>
            <option value="company">Company</option>
            <option value="education">Education</option>
            <option value="other">Other</option>
        </select>
        <input name="phone-number" rules="required|phone|min:10" type="text" class="form-control">
        <i class="fas fa-times-circle item__icon btn-remove"></i>
    </div>
        <span class="form-message"></span>
    `;

    // add event remove phone item
    phoneItemElement.querySelector('.btn-remove').addEventListener('click', function () {
        this.parentElement.remove();
    });
    modalPhoneElement.appendChild(phoneItemElement);

    // Validator
    var form = new Validator('#create-contact-form');
    form.onSubmit = function (formData) {
        handleSubmit(formData);
    }

}


function addMoreEmail() {
    var modalEmailElement = document.querySelector('.modal-email');
    var emailItemElement = document.createElement('div');
    emailItemElement.className = 'email-item';
    emailItemElement.classList.add('form-group');
    emailItemElement.innerHTML = `
    <div class = "wp-form">
        <select class="form-control email-type" name="email-type" id="email-type" rules="required">
            <option value="">-- Select --</option>    
            <option value="personal">Personal</option>
            <option value="company">Company</option>
            <option value="education">Education</option>
            <option value="other">Other</option>
        </select>
        <input name="email-address" rules="required|email" type="text" class="form-control">
        <i class="fas fa-times-circle item__icon btn-remove"></i>
    </div>
        <span class="form-message"></span>                    
    `;

    // add event remove email item
    emailItemElement.querySelector('.btn-remove').addEventListener('click', function () {
        this.parentElement.remove();
    });
    modalEmailElement.appendChild(emailItemElement);

    // Validator
    var form = new Validator('#create-contact-form');
    form.onSubmit = function (formData) {
        handleSubmit(formData);
    }

}
