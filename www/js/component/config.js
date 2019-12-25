
routeComponent('config', {
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
    }
});
