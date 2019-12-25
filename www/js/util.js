
function replaceAll(txtOriginal, search, replace) {
    let result = txtOriginal;
    while (result.indexOf(search) > -1)
        result = result.replace(search, replace);
    return result;
}

function strNumber(qtdDigits, number) {
    let str = String(number);
    for (let i = str.length; i < qtdDigits; i++)
        str = `0${str}`;
    return str;
}

function vueObjJson(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function strDate(value) {
    let result = '';
    if (value) {
        const dt = new Date(value);
        result = `${strNumber(2, dt.getDate())}/${strNumber(2, dt.getMonth() + 1)}/${strNumber(2, dt.getFullYear())}`;
        result = `${result} ${strNumber(2, dt.getHours())}:${strNumber(2, dt.getMinutes())}`;
    }
    return result;
}

function strCurrency(value, signal) {
    let result = 0;
    try {
        let numberValue = Number(value);
        result = numberValue.toFixed(2);
        result = result.replace('.', ',');
        if (signal) {
            result = String(result);
            if (result.length > 6) {
                result = result.substring(0, result.length - 6) +'.'+ result.substring(result.length - 6, result.length);
            }

            result = `R$ ${result}`;
        }
    }
    catch (err) { }
    return result;
}

function currencyValue(value) {
    let newVal = value.replace('R$ ', '');
    newVal = newVal.replace('.', '');
    newVal = newVal.replace(',', '.');
    return Number(newVal);
}

function strPaymentType(v) {
    if (v == 'CASH') return 'Dinheiro';
    else if (v == 'CREDIT') return 'Cartão de Crédito';
    else if (v == 'DEBIT') return 'Cartão de Débito';
    else if (v == 'CHECK') return 'Cheque';
}

function orderStatus(status) {
    let result = '';
    if (status == 'OPEN') result = 'Aberto';
    else if (status == 'CLOSED') result = 'Fechado';
    else if (status == 'RETURNED') result = 'Cancelado';
    return result;
}

function status(v) {
    return (v ? 'Inativo' : 'Ativo');
}

function request(method, url, data) {
    return new Promise((resolve, reject) => {
        const options = {
            method: method,
            url: url
        };

        if (data) options.data = data;

        $.ajax(options).done((data, textStatus) => resolve(data)).fail((jqxhr, settings, exception) => reject(exception));
    });
}

function loadTemplate(component) {
    return new Promise((resolve, reject) => {
        $.get(`/template/${component}.html`)
            .done((data, textStatus) => {
                resolve(data);
            })
            .fail((jqxhr, settings, exception) => {
                reject(exception);
            });
    });
}

async function loadComponents(components) {
    let componentArr = {};
    for (let i = 0; i < components.length; i++)
        componentArr[components[i]] = await loadComponent(components[i]);
    return componentArr;
}

function loadComponent(url) {
    return new Promise((resolve, reject) => {
        $.getScript(`js/component/${url}.js`)
            .done((data, textStatus) => {
                resolve(data);
            })
            .fail((jqxhr, settings, exception) => {
                reject(exception);
            });
    });
}

function routeComponent(componentName, component, isCrud) {
    let path = `/${componentName}/`;
    if (isCrud) path = `${path}:id`;
    routes.push({
        path: path,
        component: lazyComponent(componentName, component)
    });
}

function lazyComponent(componentName, component) {
    return Vue.component(componentName, function (resolve, reject) {
        loadTemplate(componentName).then(template => {
            component.template = template;
            resolve(component);
        });
    });
}

// Shortcuts *****************************************
function showMessage(config) {
    mainApp.$refs.alertMessage.showMessage(config);
}

function showSimpleMessage(title, message) {
    mainApp.$refs.alertMessage.showSimpleMessage(title, message);
}

function showAlert(title, message, type) {
    mainApp.$refs.alertMessage.showAlert(title, message, type);
}