// COMPONENTS *****************************************************************************
// let options = {
//     componentName: 'category',
//     title: 'Categoria',
//     labelNew: 'Nova Categoria',
//     labelNotFound: 'Categoria não encontrada',
//     msgNoRecords: 'Não há categorias cadastradas',
//     template: '',
//     data: {
//         listTableColumns: [],
//         crudFields: []
//     }
// }
function defaultCrudApp(options, initItem) {

    let appData = { options };
    for (let attr in options.data) appData[attr] = options.data[attr];

    appData.items = [];
    appData.currentItem = {};

    return Vue.component(options.componentName, function (resolve, reject) {
        loadTemplate((options.template ? options.template : 'default-crud')).then(template => {
            resolve({
                template: template,
                data: () => {
                    return appData;
                },
                mounted: function () {
                    this.init();
                },
                methods: {
                    init: async function () {
                        mainApp.loading = true;
                        if (this.$route.params.id != '0') {
                            await this.editItem(this.$route.params.id);
                        }
                        else {
                            this.items = await request('GET', `/api/${options.componentName}`);
                        }
                        mainApp.loading = false;
                    },
                    editItem: async function (id) {

                        if (id != '-1') {
                            try {
                                this.currentItem = await request('GET', `/api/${options.componentName}/${id}`);
                            } catch (err) { this.currentItem = { notFound: true }; }
                        }
                        else this.currentItem = {};

                        // Tratamento checkbox inativo e Dt Create
                        this.currentItem.isInactive = (!this.currentItem.inactive ? false : true);
                        this.currentItem.strDtCreate = strDate(this.currentItem.dtCreate);

                        await this.initItem();
                    },
                    initItem: async function () {
                        // Espaço para inicializações especificas
                        if (initItem) await initItem(this.$data);
                    },
                    saveItem: async function (e) {
                        mainApp.loading = true;

                        try {
                            // Tratamento Checkbox Inativo
                            if (this.currentItem.inactive && !this.currentItem.isInactive)
                                this.currentItem.inactive = null;
                            else if (!this.currentItem.inactive && this.currentItem.isInactive)
                                this.currentItem.inactive = Date.now();

                            delete this.currentItem.isInactive;
                            delete this.currentItem.strDtCreate;
                            // Fim tratamento checkbox inativo

                            const method = (this.currentItem._id ? 'PUT' : 'POST');
                            await request(method, `/api/${options.componentName}`, vueObjJson(this.currentItem));
                            showAlert(options.title, 'Item salvo com sucesso', 'success');

                            window.open(`#/${options.componentName}/0`, '_self');
                        }
                        catch (err) {
                            mainApp.loading = false;
                            showAlert('Erro', err.message, 'error');
                        }

                        e.preventDefault();
                        e.stopPropagation();
                    },
                    removeItem: async function () {
                        try {
                            showMessage({
                                title: 'Excluir item',
                                message: 'Tem certeza que deseja excluir?<br>Essa ação não poderá ser desfeita!',
                                actions: [
                                    { class: ['btn-secondary'], text: 'Cancelar' },
                                    {
                                        class: ['btn-primary'], text: 'Sim', action: async () => {
                                            mainApp.loading = true;
                                            await request('DELETE', `/api/${options.componentName}/${this.currentItem._id}`);
                                            showAlert(options.title, 'Item removido com sucesso', 'success');
                                            window.open(`#/${options.componentName}/0`, '_self');
                                        }
                                    }
                                ]
                            });
                        }
                        catch (err) {
                            mainApp.loading = false;
                            showAlert('Erro', err.message, 'error');
                        }
                    },
                },
                watch: {
                    $route(to, from) {
                        this.init();
                    }
                }
            });
        });
    });
}