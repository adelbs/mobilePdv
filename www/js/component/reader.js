
routes.push({
    path: '/reader',
    component: Vue.component('reader', function (resolve, reject) {
        loadTemplate('reader').then(template => {
            resolve({
                template: template,
                data: () => {
                    return {
                        reading: false,
                        orderList: [],
                        currentScreen: 'consult',
                        consultProduct: {}                
                    };
                },
                mounted: async function () {
                    Quagga.init({
                        inputStream: {
                            name: "Live",
                            type: "LiveStream",
                            target: document.querySelector('.reader'),
                            constraints: {
                                width: window.innerWidth
                            }
                        }
                    }, (err) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                    
                        Quagga.onDetected(data => this.read(data));
                        Quagga.start();
                    
                        this.startReader();
                        mainApp.loading = false;
                    });
                    
                    setInterval(() => this.updateOrderList(), 500);
                },
                methods: {
                    updateOrderList: async function () {
                        this.orderList = await request('POST', '/api/order/filter', { status: 'OPEN' });
                    },
                    startReader: function () {
                        this.reading = true;
                        $('.reader').show();
                    },
                    stopReader: function () {
                        this.reading = false;
                        $('.reader').hide();
                    },
                    read: async function (data) {
                        if (this.reading) {
                            mainApp.loading = true;
                            this.stopReader();
            
                            if (this.currentScreen == 'consult') {
            
                                let resultList = [];
            
                                try {
                                    resultList = await request('POST', `/api/order/productItem/filter`, {
                                        codProduct: data.codeResult.code
                                    });
                                }
                                catch (err) { }
            
                                if (resultList.length > 0) {
                                    this.consultProduct = {
                                        codProduct: resultList[0].codProduct,
                                        category: '',
                                        name: resultList[0].name,
                                        value: resultList[0].value,
                                        productItems: resultList[0].productItems
                                    };
            
                                    resultList = await request('POST', `/api/category/filter`, {
                                        codCategory: resultList[0].codCategory
                                    });
            
                                    this.consultProduct.category = resultList[0].name;
                                }
                                else {
                                    this.consultProduct = {
                                        codProduct: -1,
                                        category: 'NÃO ENCONTRADO',
                                        name: 'NÃO ENCONTRADO',
                                        value: 0,
                                        productItems: []
                                    };
                                }
            
                                this.navigate('consultResult');
                            }
            
                            mainApp.loading = false;
                        }
                    },
                    addItem: async function (idOrder) {
            
                        mainApp.loading = true;
            
                        let order = await request('GET', `/api/order/${idOrder}`);
            
                        let newItem = {
                            codProduct: this.consultProduct.codProduct,
                            name: this.consultProduct.name,
                            value: this.consultProduct.value,
                            codProductitem: []
                        };
            
                        let found = false;
                        let index;
                        for (index = 0; index < order.productItemList.length; index++) {
                            if (order.productItemList[index].codProduct == this.consultProduct.codProduct) {
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
                        for (let i = 0; i < this.consultProduct.productItems.length; i++) {
                            order.productItemList[index].codProductitem.push(this.consultProduct.productItems[i].codProductitem);
                            qtdAdd++;
                            if (qtdAdd == itemQtdAdd) break;
                        }
            
                        await request('PUT', '/api/order', order);
            
                        mainApp.loading = false;
                        setTimeout(() => this.navigate('consult'), 250);
                    },
                    navigate: function (screen) {
                        this.currentScreen = screen;
                        if (screen == 'consult') this.startReader();
                        if (screen == 'orderList' && this.orderList.length == 1) {
                            this.addItem(this.orderList[0]._id);
                        }
                    }            
                }
            });
        });
    })
});