Vue.component('nav-bar', function (resolve, reject) {
    loadTemplate('nav-bar').then(template => {
        resolve({
            template: template,
            props: ['current'],
            data: () => {
                return {
                    menus: [
                        { url: '#/dashboard', text: 'Dashboard' },
                        { url: '#/storage', text: 'Estoque' },
                        { url: '#/order', text: 'Pedidos' },
                        {
                            url: '#/', text: 'Cadastros', submenus: [
                                { url: '#/customer', text: 'Clientes' },
                                {},
                                { url: '#/category', text: 'Categorias' },
                                { url: '#/product', text: 'Produtos' },
                            ]
                        },
                        { 
                            url: '#/', text: 'Configurações', submenus: [
                                { url: '#/config', text: 'Sistema' },
                                {},
                                { url: '#/user/0', text: 'Usuários' },
                            ]
                        },
                    ],
                }
            },
            computed: {
                currentPath: function () {
                    return `#${this.current}`;
                }
            }
        });
    });
});
