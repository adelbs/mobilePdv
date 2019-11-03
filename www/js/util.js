
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
        if (signal) result = `R$ ${result}`;
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

function loadTemplate(url) {
    return new Promise((resolve, reject) => {
        $.get(`pages/html/${url}.html`)
            .done((data, textStatus) => {
                resolve(data);
            })
            .fail((jqxhr, settings, exception) => {
                reject(exception);
            });
    });
}

function loadScript(url) {
    return new Promise((resolve, reject) => {
        $.getScript(`pages/js/${url}.js`)
            .done((data, textStatus) => {
                resolve(data);
            })
            .fail((jqxhr, settings, exception) => {
                reject(exception);
            });
    });
}


// COMPONENTS *****************************************************************************

function defaultCrudApp(baseUrl, title, data) {

    let appData = { isEditing: false };
    for (let attr in data) appData[attr] = data[attr];

    appData.items = [];
    appData.currentItem = {};

    return new Vue({
        el: '#content',
        data: appData,
        methods: {
            init: async () => {
                this.contentApp.openEdit(false);
                await this.contentApp.loadItems();
                loading(false);
            },
            loadItems: async () => {
                this.contentApp.items = await request('GET', baseUrl);
            },
            editItem: async (open, id) => {
                loading(true);

                if (id != undefined) this.contentApp.currentItem = await request('GET', `${baseUrl}/${id}`);
                else this.contentApp.currentItem = {};

                // Tratamento checkbox inativo e Dt Create
                this.contentApp.currentItem.isInactive = (!this.contentApp.currentItem.inactive ? false : true);
                this.contentApp.currentItem.strDtCreate = strDate(this.contentApp.currentItem.dtCreate);

                this.contentApp.openEdit(open);
                if (!open) await this.contentApp.loadItems();

                await this.contentApp.initItem();

                loading(false);
            },
            initItem: async () => {
                // Espaço para inicializações especificas
            },
            openEdit: async (value) => {
                this.contentApp.isEditing = value;

                if (value) {
                    $('.listItems').hide();
                    $('.itemEdit').show();
                }
                else {
                    $('.listItems').show();
                    $('.itemEdit').hide();
                }
            },
            saveItem: async (e) => {
                try {
                    loading(true);
                    this.contentApp.openEdit(false);

                    // Tratamento Checkbox Inativo
                    if (this.contentApp.currentItem.inactive && !this.contentApp.currentItem.isInactive)
                        this.contentApp.currentItem.inactive = null;
                    else if (!this.contentApp.currentItem.inactive && this.contentApp.currentItem.isInactive)
                        this.contentApp.currentItem.inactive = Date.now();

                    delete this.contentApp.currentItem.isInactive;
                    delete this.contentApp.currentItem.strDtCreate;
                    // Fim tratamento checkbox inativo

                    const method = (this.contentApp.currentItem._id ? 'PUT' : 'POST');
                    await request(method, baseUrl, vueObjJson(this.contentApp.currentItem));
                    await this.contentApp.loadItems();

                    alert(title, 'Item salvo com sucesso', 'success');
                }
                catch (err) {
                    alert('Erro', err.message, 'error');
                }

                e.preventDefault();
                e.stopPropagation();

                loading(false);
            },
            removeItem: async () => {
                try {
                    this.mainApp.showConfirm('Excluir item', 'Tem certeza que deseja excluir?<br>Essa ação não poderá ser desfeita!',
                        async (v) => {
                            if (v) {
                                loading(true);
                                await request('DELETE', `${baseUrl}/${this.contentApp.currentItem._id}`);
                                await this.contentApp.loadItems();
                                alert(title, 'Item removido com sucesso', 'success');
                                this.contentApp.openEdit(false);
                                loading(false);
                            }
                        });
                }
                catch (err) {
                    alert('Erro', err.message, 'error');
                }
            }
        }
    });
}