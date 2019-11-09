
const emptyOrder = {
    codOrder: 0,
    codUser: 0,
    codCustomer: 0,
    productItemList: [],
    paymentList: [],
    totalValue: 0,
    discount: 0
};

const emptyAuxFields = {
    itemFilter: { cod: '', name: '' },
    itemQtdAdd: 1,
    payment: { value: '', tpPayment: 'CASH' },
    customerFilter: { phone: '', email: '' }
};

const paymentType = [];
paymentType['CASH'] = 'Dinheiro';
paymentType['CREDIT'] = 'Cartão de Crédito';
paymentType['DEBIT'] = 'Cartão de Débito';
paymentType['CHECK'] = 'Cheque';

routes.push({
    path: '/pdv',
    component: Vue.component('pdv', function (resolve, reject) {
        loadTemplate('pdv').then(template => {
            resolve({
                template: template,
                data: () => {
                    return {
                        orderList: [],
                        itemFilter: [],
                        userList: [],
                        customerList: [],
                        auxFields: emptyAuxFields,
                        selectedOrder: emptyOrder,
                        alertMessage: {
                            title: '',
                            message: '',
                            type: '' //ALERT, CONFIRM
                        },
                        money: {
                            decimal: ',',
                            thousands: '.',
                            prefix: 'R$ ',
                            precision: 2
                        }
                    };
                },
                mounted: async function () {
                    this.userList = await request('POST', '/api/user/filter', { inactive: '' });
                    setInterval(() => {
                        this.updateOrderList();
                        this.updateItemList();    
                    }, 500);

                    mainApp.loading = false;
                },
                methods: {
                    selectCustomer: function () {
                        this.customerList = [];
                        $('#customerModal').modal();
                        setTimeout(() => $('#customerPhone').focus(), 500);
                        if (this.auxFields.customerFilter.phone || this.auxFields.customerFilter.email)
                            filterCustomer();
                    },
                    selectItem: function () {
                        this.itemFilter = [];
                        $('#itemModal').modal();
                        setTimeout(() => $('#codProductFilter').focus(), 500);
                        this.auxFields.itemQtdAdd = 1;
                        if (this.auxFields.itemFilter.cod || this.auxFields.itemFilter.name)
                            filterItems();
                    },
                    selectPayment: function () {
                        this.updateTotalValues();
                        $('#paymentModal').modal();
                        setTimeout(() => $('#paymentValue').focus(), 500);
                    },
                    filterCustomer: async function (e) {
                        if (e) {
                            e.preventDefault();
                            e.stopPropagation();
                        }

                        mainApp.loading = true;
                        this.customerList = await request('POST', '/api/customer/filter', {
                            $or: [
                                { phone: this.auxFields.customerFilter.phone },
                                { email: this.auxFields.customerFilter.email }
                            ]
                        });

                        mainApp.loading = false;
                    },
                    filterItems: async function (e) {
                        if (e) {
                            e.preventDefault();
                            e.stopPropagation();
                        }

                        mainApp.loading = true;

                        let condition = [];

                        if (this.auxFields.itemFilter.cod || this.auxFields.itemFilter.name)
                            condition = [
                                { codProduct: this.auxFields.itemFilter.cod },
                                { name: this.auxFields.itemFilter.name }]

                        this.itemFilter = await request('POST', '/api/order/productItem/filter',
                            { inactive: '', $or: condition });

                        setTimeout(() => $('.itemQtdAdd').first().focus(), 250);

                        mainApp.loading = false;
                    },
                    updateOrderList: async function () {
                        this.orderList = await request('POST', '/api/order/filter', { status: 'OPEN' });
                    },
                    updateItemList: async function () {
                        if (this.selectedOrder._id) {
                            const order = await request('GET', `/api/order/${this.selectedOrder._id}`);
                            this.selectedOrder.productItemList = order.productItemList;
                        }
                    },
                    newOrder: async function () {
                        mainApp.loading = true;
                        this.selectedOrder = await request('POST', '/api/order', {});
                        mainApp.loading = false;
                    },
                    openOrder: async function (id) {
                        mainApp.loading = true;
                        this.selectedOrder = await request('GET', `/api/order/${id}`);
                        this.selectedOrder.strDtCreate = strDate(this.selectedOrder.dtCreate);
                        mainApp.loading = false;
                    },
                    closeOrder: function () {
                        this.selectedOrder = emptyOrder;
                        this.auxFields = emptyAuxFields;
                    },
                    cancelOrder: function () {
                        this.showConfirm('Cancelar Pedido', 'Tem certeza que deseja cancelar esse pedido?<br>Essa ação não poderá ser desfeita!',
                            async (v) => {
                                if (v) {
                                    mainApp.loading = true;
                                    await request('DELETE', `/api/order/${this.selectedOrder._id}`);
                                    this.closeOrder();
                                    mainApp.loading = false;
                                }
                            });
                    },
                    finishOrder: async function () {
                        if (this.validateOrder()) {
                            this.showFinish('Fechar Pedido', 'Tem certeza que deseja fechar esse pedido?<br>Essa ação não poderá ser desfeita!',
                                async (v) => {
                                    if (v) {
                                        mainApp.loading = true;
                                        await request('POST', `/api/order/closeOrder`, this.selectedOrder);
                                        this.closeOrder();
                                        mainApp.loading = false;
                                    }
                                });
                        }
                    },
                    validateOrder: function () {
                        let isValid = true;

                        if (this.selectedOrder.productItemList.length == 0) {
                            this.showMessage('Pedido Incompleto', 'Não há nenhum item nesse pedido');
                            isValid = false;
                        }
                        else if (this.selectedOrder.paymentList.length == 0) {
                            this.showMessage('Pedido Incompleto', 'É necessário incluir um pagamento');
                            isValid = false;
                        }
                        else if (this.selectedOrder.discount < 0) {
                            this.showMessage('Pedido Inconsistente', 'Há algo errado com os pagamentos.<br>O total pago precisa ser maior que R$ 0,00.<br>Por favor, verifique e tente novamente.');
                            isValid = false;
                        }

                        return isValid;
                    },
                    addCustomer: async function (customer) {
                        this.selectedOrder.codCustomer = customer.codCustomer;
                        this.selectedOrder.customer = customer;
                        await this.saveOrder();
                        $('#customerModal').modal('hide');
                    },
                    addPayment: async function (e) {
                        if (e) {
                            e.preventDefault();
                            e.stopPropagation();
                        }

                        const valuePaid = currencyValue(this.auxFields.payment.value);

                        if (valuePaid > this.selectedOrder.discount) {
                            this.showMessage('Adicionar Pagamento', 'O valor do pagamento não pode ser maior que o valor restante.');
                        }
                        else if (valuePaid <= 0) {
                            this.showMessage('Adicionar Pagamento', 'Insira um valor válido.');
                        }
                        else {
                            this.selectedOrder.paymentList.push({
                                paymentType: this.auxFields.payment.tpPayment,
                                value: valuePaid
                            });

                            await this.updateTotalValues();
                            $('#paymentModal').modal('hide');
                        }
                    },
                    addItem: async function (item, e) {
                        if (e) {
                            e.preventDefault();
                            e.stopPropagation();
                        }

                        //Encontrando o produto na lista, ou adicionando novo caso não esteja ainda na lista
                        let newItem = {
                            codProduct: item.codProduct,
                            name: item.name,
                            value: item.value,
                            codProductitem: []
                        };

                        let found = false;
                        let index;
                        for (index = 0; index < this.selectedOrder.productItemList.length; index++) {
                            if (this.selectedOrder.productItemList[index].codProduct == item.codProduct) {
                                found = true;
                                break;
                            }
                        }

                        if (!found) {
                            this.selectedOrder.productItemList.push(newItem);
                            index = this.selectedOrder.productItemList.length - 1;
                        }

                        //Adicionando os itens ao produto
                        let qtdAdd = 0;
                        for (let i = 0; i < item.productItems.length; i++) {
                            this.selectedOrder.productItemList[index].codProductitem.push(item.productItems[i].codProductitem);
                            qtdAdd++;
                            if (qtdAdd == this.auxFields.itemQtdAdd) break;
                        }

                        await this.updateTotalValues();
                        $('#itemModal').modal('hide');
                    },
                    removeItem: async function (index) {
                        if (this.selectedOrder.productItemList[index].codProductitem.length > 1)
                            this.selectedOrder.productItemList[index].codProductitem.pop();
                        else
                            this.selectedOrder.productItemList.splice(index, 1);

                        await this.updateTotalValues();
                    },
                    removePayment: async function (index) {
                        this.selectedOrder.paymentList.splice(index, 1);
                        await this.updateTotalValues();
                    },
                    saveOrder: async function () {
                        mainApp.loading = true;
                        await request('PUT', '/api/order', this.selectedOrder);
                        mainApp.loading = false;
                    },
                    updateTotalValues: async function () {
                        let totalValue = 0;
                        let totalPaid = 0;

                        for (let i = 0; i < this.selectedOrder.productItemList.length; i++) {
                            totalValue += (this.selectedOrder.productItemList[i].value * this.selectedOrder.productItemList[i].codProductitem.length);
                        }

                        paymentLeft = totalValue;
                        for (let i = 0; i < this.selectedOrder.paymentList.length; i++) {
                            totalPaid += this.selectedOrder.paymentList[i].value;
                        }

                        this.selectedOrder.totalValue = totalValue;
                        this.selectedOrder.discount = totalValue - totalPaid;
                        this.auxFields.payment.value = strCurrency(this.selectedOrder.discount, false);

                        await this.saveOrder();
                    },
                    showConfirm: function (title, message, callBack) {
                        this.openModalMessage(title, message, callBack, 'CONFIRM');
                    },
                    showMessage: function (title, message, callBack) {
                        this.openModalMessage(title, message, callBack, 'ALERT');
                    },
                    showFinish: function (title, message, callBack) {
                        this.openModalMessage(title, message, callBack, 'FINISH');
                    },
                    openModalMessage: function (title, message, callBack, type) {
                        this.alertMessage.title = title;
                        this.alertMessage.message = message;
                        this.alertMessage.type = type;
                        confirmAlertAction = (callBack ? callBack : () => { });
                        $('#alertModalPdv').modal();
                    }
                }
            });
        });
    })
});
