routes.push({
    path: '/print',
    component: Vue.component('print', function (resolve, reject) {
        loadTemplate('print').then(template => {
            resolve({
                template: template,
                data: () => {
                    return {
                        products: [
                            { name: 'Vaso Redondo', codProduct: '10' },
                            { name: 'Vaso Redondo', codProduct: '10' },
                            { name: 'Vaso Redondo', codProduct: '10' },
                            { name: 'Vaso Quadrado', codProduct: '20' },
                            { name: 'Vaso Quadrado', codProduct: '20' },
                            { name: 'Vaso Quadrado', codProduct: '20' },
                            { name: 'Vaso Quadrado', codProduct: '20' },
                            { name: 'Vaso Triangular', codProduct: '30' },
                        ],
                    };
                },
                mounted: async function () {
                    JsBarcode(".barcode").init();
                },
            });
        });
    })
});
