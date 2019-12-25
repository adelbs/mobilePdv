let dtPickerStart;
let dtPickerEnd;

routeComponent('order', {
    data: () => {
        return {
            filterFields: {
                dtFrom: '',
                dtTo: '',
                status: ''
            },
            selectedOrder: {},
            orders: [],
            listTableColumns: [
                { name: 'codOrder', label: 'Código' },
                { name: 'dtCreate', label: 'Data', handle: strDate },
                { name: 'status', label: 'Status', handle: orderStatus },
                { name: 'totalValue', label: 'Valor', handle: v => strCurrency(v, true) },
                { name: 'discount', label: 'Disconto', handle: v => strCurrency(v, true) },
            ],
            itemsTableColumns: [
                { name: 'name', label: 'Item', handle: (v, item) => `<a href='#/product/${item._idProduct}'>${v}</a>` },
                { name: 'value', label: 'Valor', handle: v => strCurrency(v, true) },
                { name: 'codProductitem', label: 'Qtd', handle: v => v.length },
                { name: 'codProductitem', label: 'Total', handle: (v, item) => strCurrency(v.length * item.value, true) },
            ],
            paymentsTableColumns: [
                { name: 'paymentType', label: 'Pagamento', handle: v => strPaymentType(v) },
                { name: 'value', label: 'Valor', handle: v => strCurrency(v, true) },
            ],

            cancelObs: '',
            cancelOrderModalActions: [],

            //Pagination
            firstItem: 0,
            lastItem: 0,
            totalPages: 0,
            currentPage: 1,
            pageSize: 9,
        };
    },
    mounted: async function () {
        this.cancelOrderModalActions = [
            { class: 'btn-secondary', text: 'Cancelar' },
            { class: 'btn-primary', text: 'Confirmar', action: this.cancelOrder },
        ];

        if (dtPickerStart) dtPickerStart.remove();
        if (dtPickerEnd) dtPickerEnd.remove();

        dtPickerStart = datepicker('#filterFrom', { id: 1, onSelect: (instance, date) => this.filterFields.dtFrom = date });
        dtPickerEnd = datepicker('#filterTo', { id: 1, onSelect: (instance, date) => this.filterFields.dtTo = date });

        await this.init();
    },
    methods: {
        init: async function () {
            mainApp.loading = true;
            if (this.$route.params.id != '0') {
                let selectedOrder = await request('GET', `/api/order/${this.$route.params.id}`);
                if (selectedOrder.codUser) {
                    selectedOrder.user = await request('POST', '/api/user/filter', { codUser: selectedOrder.codUser });
                    selectedOrder.user = selectedOrder.user[0];
                }
                selectedOrder.strDtCreate = strDate(selectedOrder.dtCreate);
                this.selectedOrder = selectedOrder;
            }
            else {
                this.orders = await request('POST', '/api/order/filter', {});
            }

            this.initPagination();
            mainApp.loading = false;
        },
        initPagination: function () {
            if (!this.pageSize) this.lastItem = (this.orders.filter(this.filter).length - 1);
            else {
                this.lastItem = (Number(this.pageSize) - 1);
                this.totalPages = Math.ceil(this.orders.filter(this.filter).length / Number(this.pageSize));
            }
            if (this.lastItem == -1) this.lastItem = 0;
            this.gotoPage(1);
        },
        filter: function (order) {
            return true;
        },
        gotoPage: function (page) {
            this.currentPage = page;
            this.firstItem = (page - 1) * Number(this.pageSize);
            this.lastItem = (this.firstItem + Number(this.pageSize) - 1);
        },
        pagination: function (item, index) {
            return (index >= this.firstItem && index <= this.lastItem);
        },
        filterOrders: async function () {
            let filter = {};
            let filterDate = {};

            if (this.filterFields.status) filter.status = this.filterFields.status;
            if (this.filterFields.dtFrom) filterDate.$gt = this.filterFields.dtFrom;
            if (this.filterFields.dtTo) filterDate.$lt = this.filterFields.dtTo;
            if (filterDate) filter.dtCreate = filterDate;

            this.orders = await request('POST', '/api/order/filter', filter);
            this.initPagination();
        },
        cancelOrder: async function () {
            mainApp.loading = true;
            this.orders = await request('POST', '/api/order/cancelOrder', { _id: this.selectedOrder._id, obs: this.cancelObs });
            showAlert('Pedido', 'Pedido cancelado', 'success');
            this.init();
        },
        totalOrders: function () {
            return this.orders.filter(this.filter).length;
        },
        totalValue: function () {
            let result = 0;
            if (this.orders.filter(this.filter).length > 0)
                result = this.orders.filter(this.filter).reduce((total, item) => {
                    return total + item.totalValue;
                }, 0);

            return result;
        }
    },
    watch: {
        $route(to, from) {
            this.init();
        },
        'filterFields.status': function () {
            this.filterOrders();
        },
        'filterFields.dtFrom': function () {
            this.filterOrders();
        },
        'filterFields.dtTo': function () {
            this.filterOrders();
        },
    }
}, true);
