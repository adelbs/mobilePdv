
const VERSION = '0.0.1';

function loading(value) {
    if (value) $('.loading').show();
    else $('.loading').hide();
}

function alert(title, message, type) {
    this.mainApp.alerts.push({ title: title, text: message, type: type });
    setTimeout(() => $(".alert").fadeOut(), 3000);
}

let confirmAlertAction = () => { };

$(async () => {

    this.mainApp = new Vue({
        el: '#mainApp',
        data: {
            currentMenu: '',
            menus: [
                { name: 'dashboard', text: 'Dashboard' },
                { name: 'estoque', text: 'Estoque' },
                { name: 'pedidos', text: 'Pedidos' },
                {
                    name: 'cadastros', text: 'Cadastros', submenus: [
                        { name: 'clientes', text: 'Clientes' },
                        {},
                        { name: 'categorias', text: 'Categorias' },
                        { name: 'produtos', text: 'Produtos' },
                    ]
                }
            ],
            alerts: [{}],
            alertMessage: {
                title: '',
                message: '',
                type: '' //ALERT, CONFIRM
            }
        },
        methods: {
            navigate: async (page) => {
                try {
                    loading(true);
                    $('.mainContent').html(await loadTemplate(page));
                    await loadScript(page);
                    this.mainApp.currentMenu = page;
                    this.contentApp.init();
                }
                catch (err) {
                    alert('Erro', err, 'error');
                }

                loading(false);
            },
            showConfirm: (title, message, callBack) => this.mainApp.openModalMessage(title, message, callBack, 'CONFIRM'),
            showMessage: (title, message, callBack) => this.mainApp.openModalMessage(title, message, callBack, 'ALERT'),
            openModalMessage: (title, message, callBack, type) => {
                this.mainApp.alertMessage.title = title;
                this.mainApp.alertMessage.message = message;
                this.mainApp.alertMessage.type = type;
                confirmAlertAction = (callBack ? callBack : () => { });
                $('#alertModal').modal();
            }
        }
    });

    const urlStr = window.location.href;
    const url = new URL(urlStr);
    const nav = url.searchParams.get('nav');
    const id = url.searchParams.get('id');

    await this.mainApp.navigate(nav ? nav : 'dashboard');
    if (id) await this.contentApp.editItem(true, id);

    loading(false);
});