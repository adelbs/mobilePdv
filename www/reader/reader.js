
// console.log(window.innerHeight);

const readerApp = new Vue({
    el: '#readerApp',
    data: {
        loading: true,
        reading: false,
        orderList: [],
        currentScreen: 'consult',
        consultProduct: {}
    },
    methods: {
        updateOrderList: async () => {
            readerApp.orderList = await request('POST', '/order/filter', { status: 'OPEN' });
        },
        startReader: () => {
            readerApp.reading = true;
            $('.reader').show();
        },
        stopReader: () => {
            readerApp.reading = false;
            $('.reader').hide();
        },
        read: async (data) => {
            if (readerApp.reading) {
                readerApp.loading = true;
                readerApp.stopReader();

                if (readerApp.currentScreen == 'consult') {

                    let resultList = [];

                    try {
                        resultList = await request('POST', `/order/productItem/filter`, {
                            codProduct: data.codeResult.code
                        });
                    }
                    catch (err) { }

                    if (resultList.length > 0) {
                        readerApp.consultProduct = {
                            codProduct: resultList[0].codProduct,
                            category: '',
                            name: resultList[0].name,
                            value: resultList[0].value,
                            productItems: resultList[0].productItems
                        };

                        resultList = await request('POST', `/category/filter`, {
                            codCategory: resultList[0].codCategory
                        });

                        readerApp.consultProduct.category = resultList[0].name;
                    }
                    else {
                        readerApp.consultProduct = {
                            codProduct: -1,
                            category: 'NÃO ENCONTRADO',
                            name: 'NÃO ENCONTRADO',
                            value: 0,
                            productItems: []
                        };
                    }

                    readerApp.navigate('consultResult');
                }

                readerApp.loading = false;
            }
        },
        addItem: async (idOrder) => {

            readerApp.loading = true;

            let order = await request('GET', `/order/${idOrder}`);

            let newItem = {
                codProduct: readerApp.consultProduct.codProduct,
                name: readerApp.consultProduct.name,
                value: readerApp.consultProduct.value,
                codProductitem: []
            };

            let found = false;
            let index;
            for (index = 0; index < order.productItemList.length; index++) {
                if (order.productItemList[index].codProduct == readerApp.consultProduct.codProduct) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                order.productItemList.push(newItem);
                index = order.productItemList.length - 1;
            }

            //Adicionando os itens ao produto
            let qtdAdd = 0;
            let itemQtdAdd = 1;
            for (let i = 0; i < readerApp.consultProduct.productItems.length; i++) {
                order.productItemList[index].codProductitem.push(readerApp.consultProduct.productItems[i].codProductitem);
                qtdAdd++;
                if (qtdAdd == itemQtdAdd) break;
            }

            await request('PUT', '/order', order);

            readerApp.loading = false;
            setTimeout(() => readerApp.navigate('consult'), 250);
        },
        navigate: screen => {
            readerApp.currentScreen = screen;
            if (screen == 'consult') readerApp.startReader();
        }
    }
});

Quagga.init({
    inputStream: {
        name: "Live",
        type: "LiveStream",
        target: document.querySelector('.reader'),
        constraints: {
            width: window.innerWidth
        }
    }
}, function (err) {
    if (err) {
        console.log(err);
        return;
    }

    Quagga.onDetected(data => readerApp.read(data));
    Quagga.start();

    readerApp.startReader();
    readerApp.loading = false;
});

setInterval(() => readerApp.updateOrderList(), 500);