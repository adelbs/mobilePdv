
function loading(value) {
    if (value) $('.loading').show();
    else $('.loading').hide();
}

function selectCustomer() {
    pdvApp.customerList = [];
    $('#customerModal').modal();
    setTimeout(() => $('#customerPhone').focus(), 500);
    if (pdvApp.auxFields.customerFilter.phone || pdvApp.auxFields.customerFilter.email)
        filterCustomer();
}

function selectItem() {
    pdvApp.itemFilter = [];
    $('#itemModal').modal();
    setTimeout(() => $('#codProductFilter').focus(), 500);
    pdvApp.auxFields.itemQtdAdd = 1;
    if (pdvApp.auxFields.itemFilter.cod || pdvApp.auxFields.itemFilter.name)
        filterItems();
}

function selectPayment() {
    pdvApp.updateTotalValues();
    $('#paymentModal').modal();
    setTimeout(() => $('#paymentValue').focus(), 500);
}

async function filterCustomer(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    loading(true);
    pdvApp.customerList = await request('POST', '/customer/filter', {
        $or: [
            { phone: pdvApp.auxFields.customerFilter.phone },
            { email: pdvApp.auxFields.customerFilter.email }
        ]
    });

    loading(false);
}

async function filterItems(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    loading(true);

    let condition = [];

    if (pdvApp.auxFields.itemFilter.cod || pdvApp.auxFields.itemFilter.name)
        condition = [
            { codProduct: pdvApp.auxFields.itemFilter.cod },
            { name: pdvApp.auxFields.itemFilter.name }]

    pdvApp.itemFilter = await request('POST', '/order/productItem/filter',
        { inactive: '', $or: condition });

    setTimeout(() => $('.itemQtdAdd').first().focus(), 250);

    loading(false);
}

let confirmAlertAction = () => { };

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

const pdvApp = new Vue({
    el: '#pdvApp',
    data: {
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
    },
    methods: {
        updateOrderList: async () => {
            pdvApp.orderList = await request('POST', '/order/filter', { status: 'OPEN' });
        },
        updateItemList: async () => {
            if (pdvApp.selectedOrder._id) {
                const order = await request('GET', `/order/${pdvApp.selectedOrder._id}`);
                pdvApp.selectedOrder.productItemList = order.productItemList;
            }
        },
        newOrder: async () => {
            loading(true);
            pdvApp.selectedOrder = await request('POST', '/order', {});
            loading(false);
        },
        openOrder: async (id) => {
            loading(true);
            pdvApp.selectedOrder = await request('GET', `/order/${id}`);
            pdvApp.selectedOrder.strDtCreate = strDate(pdvApp.selectedOrder.dtCreate);
            loading(false);
        },
        closeOrder: () => {
            pdvApp.selectedOrder = emptyOrder;
            pdvApp.auxFields = emptyAuxFields;
        },
        cancelOrder: async () => {
            pdvApp.showConfirm('Cancelar Pedido', 'Tem certeza que deseja cancelar esse pedido?<br>Essa ação não poderá ser desfeita!',
                async (v) => {
                    if (v) {
                        loading(true);
                        await request('DELETE', `/order/${pdvApp.selectedOrder._id}`);
                        pdvApp.closeOrder();
                        loading(false);
                    }
                });
        },
        finishOrder: async () => {

            console.log(pdvApp.selectedOrder.codUser);

            if (pdvApp.validateOrder()) {
                pdvApp.showFinish('Fechar Pedido', 'Tem certeza que deseja fechar esse pedido?<br>Essa ação não poderá ser desfeita!',
                    async (v) => {
                        if (v) {
                            loading(true);
                            await request('POST', `/order/closeOrder`, pdvApp.selectedOrder);
                            pdvApp.closeOrder();
                            loading(false);
                        }
                    });
            }
        },
        validateOrder: () => {
            let isValid = true;

            if (pdvApp.selectedOrder.productItemList.length == 0) {
                pdvApp.showMessage('Pedido Incompleto', 'Não há nenhum item nesse pedido');
                isValid = false;
            }
            else if (pdvApp.selectedOrder.paymentList.length == 0) {
                pdvApp.showMessage('Pedido Incompleto', 'É necessário incluir um pagamento');
                isValid = false;
            }
            else if (pdvApp.selectedOrder.discount < 0) {
                pdvApp.showMessage('Pedido Inconsistente', 'Há algo errado com os pagamentos.<br>O total pago precisa ser maior que R$ 0,00.<br>Por favor, verifique e tente novamente.');
                isValid = false;
            }

            return isValid;
        },
        addCustomer: async (customer) => {
            pdvApp.selectedOrder.codCustomer = customer.codCustomer;
            pdvApp.selectedOrder.customer = customer;
            await pdvApp.saveOrder();
            $('#customerModal').modal('hide');
        },
        addPayment: async (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            const valuePaid = currencyValue(pdvApp.auxFields.payment.value);

            if (valuePaid > pdvApp.selectedOrder.discount) {
                pdvApp.showMessage('Adicionar Pagamento', 'O valor do pagamento não pode ser maior que o valor restante.');
            }
            else if (valuePaid <= 0) {
                pdvApp.showMessage('Adicionar Pagamento', 'Insira um valor válido.');
            }
            else {
                pdvApp.selectedOrder.paymentList.push({
                    paymentType: pdvApp.auxFields.payment.tpPayment,
                    value: valuePaid
                });

                await pdvApp.updateTotalValues();
                $('#paymentModal').modal('hide');
            }
        },
        addItem: async (item, e) => {
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
            for (index = 0; index < pdvApp.selectedOrder.productItemList.length; index++) {
                if (pdvApp.selectedOrder.productItemList[index].codProduct == item.codProduct) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                pdvApp.selectedOrder.productItemList.push(newItem);
                index = pdvApp.selectedOrder.productItemList.length - 1;
            }

            //Adicionando os itens ao produto
            let qtdAdd = 0;
            for (let i = 0; i < item.productItems.length; i++) {
                pdvApp.selectedOrder.productItemList[index].codProductitem.push(item.productItems[i].codProductitem);
                qtdAdd++;
                if (qtdAdd == pdvApp.auxFields.itemQtdAdd) break;
            }

            await pdvApp.updateTotalValues();
            $('#itemModal').modal('hide');
        },
        removeItem: async (index) => {
            if (pdvApp.selectedOrder.productItemList[index].codProductitem.length > 1)
                pdvApp.selectedOrder.productItemList[index].codProductitem.pop();
            else
                pdvApp.selectedOrder.productItemList.splice(index, 1);

            await pdvApp.updateTotalValues();
        },
        removePayment: async (index) => {
            pdvApp.selectedOrder.paymentList.splice(index, 1);
            await pdvApp.updateTotalValues();
        },
        saveOrder: async () => {
            loading(true);
            await request('PUT', '/order', pdvApp.selectedOrder);
            loading(false);
        },
        updateTotalValues: async () => {
            let totalValue = 0;
            let totalPaid = 0;

            for (let i = 0; i < pdvApp.selectedOrder.productItemList.length; i++) {
                totalValue += (pdvApp.selectedOrder.productItemList[i].value * pdvApp.selectedOrder.productItemList[i].codProductitem.length);
            }

            paymentLeft = totalValue;
            for (let i = 0; i < pdvApp.selectedOrder.paymentList.length; i++) {
                totalPaid += pdvApp.selectedOrder.paymentList[i].value;
            }

            pdvApp.selectedOrder.totalValue = totalValue;
            pdvApp.selectedOrder.discount = totalValue - totalPaid;
            pdvApp.auxFields.payment.value = strCurrency(pdvApp.selectedOrder.discount, false);

            await pdvApp.saveOrder();
        },
        showConfirm: (title, message, callBack) => pdvApp.openModalMessage(title, message, callBack, 'CONFIRM'),
        showMessage: (title, message, callBack) => pdvApp.openModalMessage(title, message, callBack, 'ALERT'),
        showFinish: (title, message, callBack) => pdvApp.openModalMessage(title, message, callBack, 'FINISH'),
        openModalMessage: (title, message, callBack, type) => {
            pdvApp.alertMessage.title = title;
            pdvApp.alertMessage.message = message;
            pdvApp.alertMessage.type = type;
            confirmAlertAction = (callBack ? callBack : () => { });
            $('#alertModal').modal();
        }
    }
});

async function init() {
    pdvApp.userList = await request('POST', '/user/filter', { inactive: '' });
    setInterval(() => {
        pdvApp.updateOrderList();
        pdvApp.updateItemList();
    }, 500);
    loading(false);
}

init();