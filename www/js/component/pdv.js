
const emptyOrder = {
    codOrder: 0,
    codUser: 0,
    codCustomer: 0,
    customer: {},
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

const styleCursorDefault = { cursor: 'default' };

routeComponent('pdv', {
    data: () => {
        return {
            itemFilter: [],
            userList: [],

            auxFields: emptyAuxFields,
            selectedOrder: emptyOrder,
            money: {
                decimal: ',',
                thousands: '.',
                prefix: 'R$ ',
                precision: 2
            },

            productItemListColumns: [],
            paymentListColumns: [],

            customerList: [],
            customerListColumns: [
                { name: 'name', label: 'Nome' },
                { name: 'email', label: 'Email' },
                { name: 'phone', label: 'Telefone' },
            ],

            orderList: [],
            orderListColumns: [
                { name: 'codOrder', label: 'Código' },
                { name: 'dtCreate', label: 'Data', handle: strDate },
                { name: 'customer', label: 'Cliente', handle: v => v.name },
            ],

            addItemModalActions: [{ class: 'btn-secondary', text: 'Fechar' }],
            paymentModalActions: [],
            customerModalActions: [{ class: 'btn-secondary', text: 'Fechar' }],
            finishModalActions: [],
            newCustomerModalActions: [],

            newCustomerFields: [
                { type: 'text', name: 'name', label: 'Nome', class: ['col-sm-8'], required: true },
                { type: 'text', name: 'dtBirth', label: 'Aniversário', class: ['col-sm-8'] },
                { type: 'number', name: 'phone', label: 'Telefone', class: ['col-sm-8'] },
                { type: 'email', name: 'email', label: 'Email', class: ['col-sm-8'] },
            ]
        };
    },
    mounted: async function () {
        this.productItemListColumns = [
            { name: 'name', label: 'Item', style: styleCursorDefault },
            { name: 'value', label: 'Valor', style: styleCursorDefault, handle: v => strCurrency(v, true) },
            { name: 'codProductitem', label: 'Qtd', style: styleCursorDefault, handle: v => v.length },
            { name: 'codProductitem', label: 'Total', style: styleCursorDefault, handle: (v, item) => strCurrency(v.length * item.value, true) },
            { label: ' ', handle: v => 'x', click: this.removeItem },
        ];

        this.paymentListColumns = [
            { name: 'paymentType', label: 'Pagamento', style: styleCursorDefault, handle: strPaymentType },
            { name: 'value', label: 'Valor', style: styleCursorDefault, handle: v => strCurrency(v, true) },
            { label: ' ', handle: v => 'x', click: this.removePayment },
        ];

        this.paymentModalActions = [
            { class: 'btn-secondary', text: 'Cancelar' },
            { class: 'btn-primary', text: 'Adicionar', action: this.addPayment },
        ];

        this.finishModalActions = [
            { class: 'btn-secondary', text: 'Cancelar' },
            { class: 'btn-primary', text: 'Ok', action: this.confirmFinishOrder },
        ];

        this.newCustomerModalActions = [
            { class: 'btn-secondary', text: 'Cancelar' },
            { class: 'btn-primary', text: 'Salvar', action: this.addNewCustomer },
        ];

        setInterval(() => {
            this.updateOrderList();
            this.updateItemList();
        }, 500);

        await this.init();
    },
    methods: {
        init: async function () {
            mainApp.loading = true;

            if (this.$route.params.id != '0') {
                this.selectedOrder = await request('GET', `/api/order/${this.$route.params.id}`);
                this.selectedOrder.strDtCreate = strDate(this.selectedOrder.dtCreate);
            }
            else {
                this.selectedOrder = emptyOrder;
                this.auxFields = emptyAuxFields;
                this.userList = await request('POST', '/api/user/filter', { inactive: '' });
            }

            mainApp.loading = false;
        },
        selectCustomer: function () {
            this.customerList = [];
            this.$refs.customerModal.show();
            setTimeout(() => $('#customerPhone').focus(), 500);
            if (this.auxFields.customerFilter.phone || this.auxFields.customerFilter.email)
                filterCustomer();
        },
        selectItem: function () {
            this.itemFilter = [];
            this.$refs.addItemModal.show();
            setTimeout(() => $('.codProductFilter')[0].focus(), 500);
            this.auxFields.itemQtdAdd = 1;
            if (this.auxFields.itemFilter.cod || this.auxFields.itemFilter.name)
                filterItems();
        },
        selectPayment: function () {
            this.updateTotalValues();
            this.$refs.paymentModal.show();
            setTimeout(() => $('#paymentValue').focus(), 500);
        },
        filterCustomer: async function (e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            mainApp.loading = true;

            let condition = { inactive: '' };
            if (this.auxFields.customerFilter.phone != '' || this.auxFields.customerFilter.email != '')
                condition = {
                    inactive: '',
                    $or: [
                        { phone: this.auxFields.customerFilter.phone },
                        { email: this.auxFields.customerFilter.email }
                    ]
                };

            this.customerList = await request('POST', '/api/customer/filter', condition);

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
            window.open(`#/pdv/${this.selectedOrder._id}`, '_self');
        },
        cancelOrder: function () {
            showMessage({
                title: 'Cancelar Pedido',
                message: 'Tem certeza que deseja cancelar esse pedido?<br>Essa ação não poderá ser desfeita!',
                actions: [
                    { class: ['btn-secondary'], text: 'Cancelar' },
                    {
                        class: ['btn-primary'], text: 'Sim', action: async (v) => {
                            mainApp.loading = true;
                            await request('DELETE', `/api/order/${this.selectedOrder._id}`);
                            window.open(`#/pdv/0`, '_self');
                            mainApp.loading = false;
                        }
                    }
                ]
            });
        },
        finishOrder: async function () {
            if (this.validateOrder())
                this.$refs.finishModal.show();
        },
        confirmFinishOrder: async function () {
            mainApp.loading = true;
            await request('POST', `/api/order/closeOrder`, this.selectedOrder);
            window.open(`#/pdv/0`, '_self');
            mainApp.loading = false;
        },
        validateOrder: function () {
            let isValid = true;

            if (this.selectedOrder.productItemList.length == 0) {
                showSimpleMessage('Pedido Incompleto', 'Não há nenhum item nesse pedido');
                isValid = false;
            }
            else if (this.selectedOrder.paymentList.length == 0) {
                showSimpleMessage('Pedido Incompleto', 'É necessário incluir um pagamento');
                isValid = false;
            }
            else if (this.selectedOrder.discount < 0) {
                showSimpleMessage('Pedido Inconsistente', 'Há algo errado com os pagamentos.<br>O total pago precisa ser maior que R$ 0,00.<br>Por favor, verifique e tente novamente.');
                isValid = false;
            }

            return isValid;
        },
        addCustomer: async function (customer) {
            mainApp.loading = true;
            this.selectedOrder.codCustomer = customer.codCustomer;
            this.selectedOrder.customer = customer;
            await this.saveOrder();
            this.$refs.customerModal.hide();
            mainApp.loading = false;
        },
        addNewCustomer: async function () {
            mainApp.loading = true;

            try {
                this.selectedOrder.customer = await request('POST', `/api/customer`, vueObjJson(this.selectedOrder.customer));
                this.selectedOrder.codCustomer = this.selectedOrder.customer.codCustomer;
                await this.saveOrder();
                showAlert('Cliente', 'Cliente salvo com sucesso', 'success');
                this.$refs.newCustomerModal.hide();
            }
            catch (err) {
                mainApp.loading = false;
                showAlert('Erro', err.message, 'error');
            }

            mainApp.loading = false;
        },
        addPayment: async function (e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            const valuePaid = currencyValue(this.auxFields.payment.value);

            if (valuePaid > this.selectedOrder.discount) {
                showSimpleMessage('Adicionar Pagamento', 'O valor do pagamento não pode ser maior que o valor restante.');
            }
            else if (valuePaid <= 0) {
                showSimpleMessage('Adicionar Pagamento', 'Insira um valor válido.');
            }
            else {
                this.selectedOrder.paymentList.push({
                    paymentType: this.auxFields.payment.tpPayment,
                    value: valuePaid
                });

                await this.updateTotalValues();
                this.$refs.paymentModal.hide();
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
            this.$refs.addItemModal.hide();
        },
        removeItem: async function (item) {
            let i = 0;
            let found = false;
            for (; i < this.selectedOrder.productItemList.length; i++) {
                if (this.selectedOrder.productItemList[i].codProduct) {
                    found = true;
                    break;
                }
            }

            if (found) {
                if (this.selectedOrder.productItemList[i].codProductitem.length > 1)
                    this.selectedOrder.productItemList[i].codProductitem.pop();
                else
                    this.selectedOrder.productItemList.splice(i, 1);

                await this.updateTotalValues();
            }
        },
        removePayment: async function (item) {
            let i = 0;
            let found = false;
            for (; i < this.selectedOrder.paymentList.length; i++) {
                if (item.paymentType == this.selectedOrder.paymentList[i].paymentType
                    && item.value == this.selectedOrder.paymentList[i].value) {
                    found = true;
                    break;
                }
            }

            if (found) {
                this.selectedOrder.paymentList.splice(i, 1);
                await this.updateTotalValues();
            }
        },
        saveOrder: async function () {
            await request('PUT', '/api/order', this.selectedOrder);
        },
        updateTotalValues: async function () {
            mainApp.loading = true;

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
            mainApp.loading = false;
        },
    },
    watch: {
        $route(to, from) {
            this.init();
        }
    }
}, true);
