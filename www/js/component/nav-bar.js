lazyComponent('nav-bar', {
    props: ['current'],
    data: () => {
        return {
            menus: [
                { url: '#/dashboard', text: 'Dashboard' },
                { url: '#/storage', text: 'Estoque' },
                { url: '#/order/0', text: 'Pedidos' },
                {
                    url: '#/', text: 'Cadastros', submenus: [
                        { url: '#/customer/0', text: 'Clientes' },
                        {},
                        { url: '#/category/0', text: 'Categorias' },
                        { url: '#/product/0', text: 'Produtos' },
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