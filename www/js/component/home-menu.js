routes.push({
    path: '/',
    component: Vue.component('home-menu', function (resolve, reject) {
        loadTemplate('home-menu').then(template => {
            resolve({
                template: template,
                data: () => {
                    return {
                        menus: [
                            [
                                {},
                                { icon: 'img/icon/erp.png', url: '#/dashboard', name: 'ERP' },
                                { icon: 'img/icon/pdv.png', url: '#/pdv/0', name: 'PDV' },
                                {},
                            ],
                            [
                                {},
                                { icon: 'img/icon/mobile.png', url: '#/reader', name: 'Leitor' },
                                { icon: 'img/icon/config.png', url: '#/config', name: 'Configurações' },
                                {},
                            ],
                        ]
                    };
                }
            });
        });
    })
});