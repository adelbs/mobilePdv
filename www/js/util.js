
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


// COMPONENTS *****************************************************************************

function defaultCrudApp(componentName, title, data, initItem) {

    let appData = { isEditing: false };
    for (let attr in data) appData[attr] = data[attr];

    appData.items = [];
    appData.currentItem = {};

    return Vue.component(componentName, function (resolve, reject) {
        loadTemplate(componentName).then(template => {
            resolve({
                template: template,
                data: () => {
                    return appData;
                },
                mounted: async function () {
                    this.openEdit(false);
                    await this.loadItems();
                },
                methods: {
                    loadItems: async function () {
                        this.items = await request('GET', `/api/${componentName}`);
                    },
                    editItem: async function (open, id) {
        
                        if (id != undefined) this.currentItem = await request('GET', `/api/${componentName}/${id}`);
                        else this.currentItem = {};
        
                        // Tratamento checkbox inativo e Dt Create
                        this.currentItem.isInactive = (!this.currentItem.inactive ? false : true);
                        this.currentItem.strDtCreate = strDate(this.currentItem.dtCreate);
        
                        this.openEdit(open);
                        if (!open) await this.loadItems();
        
                        await this.initItem();
        
                    },
                    initItem: async function () {
                        // Espaço para inicializações especificas
                        if (initItem) await initItem(this.$data);
                    },
                    openEdit: async function (value) {
                        this.isEditing = value;
        
                        if (value) {
                            $('.listItems').hide();
                            $('.itemEdit').show();
                        }
                        else {
                            $('.listItems').show();
                            $('.itemEdit').hide();
                        }
                    },
                    saveItem: async function (e) {
                        try {
                            this.openEdit(false);
        
                            // Tratamento Checkbox Inativo
                            if (this.currentItem.inactive && !this.currentItem.isInactive)
                                this.currentItem.inactive = null;
                            else if (!this.currentItem.inactive && this.currentItem.isInactive)
                                this.currentItem.inactive = Date.now();
        
                            delete this.currentItem.isInactive;
                            delete this.currentItem.strDtCreate;
                            // Fim tratamento checkbox inativo
        
                            const method = (this.currentItem._id ? 'PUT' : 'POST');
                            await request(method, `/api/${componentName}`, vueObjJson(this.currentItem));
                            await this.loadItems();
        
                            mainApp.$refs.alertMessage.showAlert(title, 'Item salvo com sucesso', 'success');
                        }
                        catch (err) {
                            mainApp.$refs.alertMessage.showAlert('Erro', err.message, 'error');
                        }
        
                        e.preventDefault();
                        e.stopPropagation();
        
                    },
                    removeItem: async function () {
                        try {
                            mainApp.$refs.alertMessage.showConfirm('Excluir item', 'Tem certeza que deseja excluir?<br>Essa ação não poderá ser desfeita!',
                                async (v) => {
                                    if (v) {
                                        await request('DELETE', `/api/${componentName}/${this.currentItem._id}`);
                                        await this.loadItems();
                                        mainApp.$refs.alertMessage.showAlert(title, 'Item removido com sucesso', 'success');
                                        this.openEdit(false);
                                    }
                                });
                        }
                        catch (err) {
                            mainApp.$refs.alertMessage.showAlert('Erro', err.message, 'error');
                        }
                    }
                }        
            });
        });
    });
}