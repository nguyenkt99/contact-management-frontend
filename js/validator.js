function Validator(formSelector) {
    var _this = this;
    var formRules = {};

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }


    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'This field cannot be blank';
        },
        email: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Email is not valid';
        },
        phone: function (value) {
            var regex = /[0-9]{10}/
            return regex.test(value) ? undefined : 'Phone number is not valid';
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Please enter at least ${min} characters`;
            }
        }
    };


    var formElement = document.querySelector(formSelector);
    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]');
        for (var input of inputs) {

            var rules = input.getAttribute('rules').split('|');
            for (var rule of rules) {
                var ruleInfo;
                var isRuleHasValue = rule.includes(':');

                if (isRuleHasValue) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                }

                var ruleFunc = validatorRules[rule];
                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                } else {
                    formRules[input.name] = [ruleFunc];
                }
            }


            // Lắng nghe sự kiện để validate    
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }

        function handleValidate(event) {
            var rules = formRules[event.target.name];
            var errorMessage;

            for (var rule of rules) {
                errorMessage = rule(event.target.value);
                if (errorMessage !== undefined) {
                    break;
                }
            }

            if (errorMessage) {
                var formGroup = getParent(event.target, '.form-group');
                if (formGroup) {
                    formGroup.classList.add('invalid');
                    var formMessage = formGroup.querySelector('.form-message');
                    if (formMessage) {
                        formMessage.innerText = errorMessage;
                    }
                }
            }

            return !errorMessage;
        }


        function handleClearError(event) {
            var formGroup = getParent(event.target, '.form-group');
            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid');

                var formMessage = formGroup.querySelector('.form-message');
                if (formMessage) {
                    formMessage.innerText = '';
                }
            }
        }

    }


    // Xử lí sự kiện submit 
    formElement.onsubmit = async function (event) {
        event.preventDefault();

        var inputs = formElement.querySelectorAll('[name][rules]');
        var isValid = true;

        for (var input of inputs) {
            if (!handleValidate({ target: input })) {
                isValid = false;
            }
        }

        // Nếu không có lỗi thì submit form
        if (isValid) {
            if (typeof _this.onSubmit === 'function') {
                var enableInputs = formElement.querySelectorAll('[name]');
                formValues = {};
                for (var i = 0; i < enableInputs.length; i++) {
                    if (enableInputs[i].type === 'select-one') {
                        if (enableInputs[i].classList.contains('phone-type')) {
                            if (Array.isArray(formValues['phones'])) {
                                formValues['phones'].push({ phoneNumber: enableInputs[i + 1].value, type: enableInputs[i].value })
                            } else {
                                formValues['phones'] = [{ phoneNumber: enableInputs[i + 1].value, type: enableInputs[i].value }];
                            }
                        } else if (enableInputs[i].classList.contains('email-type')) {
                            if (Array.isArray(formValues['emails'])) {
                                formValues['emails'].push({ emailAddress: enableInputs[i + 1].value, type: enableInputs[i].value })
                            } else {
                                formValues['emails'] = [{ emailAddress: enableInputs[i + 1].value, type: enableInputs[i].value }];
                            }
                        }
                        ++i;
                    } else if (enableInputs[i].type === 'file') {
                        const imgFile = enableInputs[i].files[0];
                        if (imgFile !== undefined) {
                            formValues[enableInputs[i].name] = await getBase64(imgFile);
                        } else {
                            formValues[enableInputs[i].name] = "";
                        }                        
                    } else {
                        formValues[enableInputs[i].name] = enableInputs[i].value;
                    }
                }
                
                _this.onSubmit(formValues);
            } else {
                formElement.submit();
            }
        }
    }
}

