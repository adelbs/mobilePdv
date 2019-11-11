
routes.push({
    path: '/config',
    component: Vue.component('config', function (resolve, reject) {
        loadTemplate('config').then(template => {
            resolve({
                template: template,
                data: () => {
                    return {
                        currentMenu: '',
                        menus: [
                            { name: 'usuarios', text: 'Usuários' },
                            { name: 'configuracoes', text: 'Configurações' },
                        ],
                        alerts: [{}],
                        alertMessage: {
                            title: '',
                            message: '',
                            type: '' //ALERT, CONFIRM
                        }
                    };
                },
                mounted: async function () {
                },
            });
        });
    })
});
