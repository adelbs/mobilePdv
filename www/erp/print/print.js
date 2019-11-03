
const barcodeApp = new Vue({
    el: '#barcodeApp',
    data: {
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
    },
    methods: {}
});

JsBarcode(".barcode").init();
