
routes.push({
    path: '/order',
    component: Vue.component('order', function (resolve, reject) {
        loadTemplate('order').then(template => {
            resolve({
                template: template,
                data: () => {
                    return {
                        orders: [],
                    };
                },
                mounted: async function () {
                    this.orders = await request('POST', '/api/order/filter', {});
                },
                methods: {
                    filter: function (order) {
                        return true;
                    },
                    orderStatus: function (status) {
                        let result = '';
                        if (status == 'OPEN') result = 'Aberto';
                        else if (status == 'CLOSED') result = 'Fechado';
                        else if (status == 'RETURNED') result = 'Cancelado';
                        return result;
                    }
                }
            });
        });
    })
});
