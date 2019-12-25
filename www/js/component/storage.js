
routeComponent('storage', {
    data: () => {
        return {
            productList: [],
            categories: [],
            filterFields: {
                filterStr: '',
                categoryFilter: '',
            },
            addItemsModal: {
                qtdItemAdd: 1,
                itemAdd: {},
            },
            moveItemsModal: {
                itemMove: {},
                itemsMove: 1,
                itemsMoveTo: '',
            },
            cancelItemsModal: {
                itemCancel: {},
                itemsCancelFrom: 'storage',
                qtdItemCancel: 1,
                cancelObs: '',
            },
            printOptions: {
                itemsFrom: 'both',
                howMany: 'all',
                printSpace: 1,
                border: 0
            },

            moveItemsModalActions: [],
            printModalActions: [],
            addItemsModalActions: [],
            cancelItemsModalActions: [],

            //Pagination
            firstItem: 0,
            lastItem: 0,
            totalPages: 0,
            currentPage: 1,
            pageSize: 9,
        };
    },
    mounted: function () {
        this.moveItemsModalActions = [
            { class: 'btn-secondary', text: 'Cancelar' },
            { class: 'btn-primary', text: 'Mover', action: this.moveItems },
        ];

        this.printModalActions = [
            { class: 'btn-secondary', text: 'Cancelar' },
            { class: 'btn-primary', text: 'Imprimir', action: this.print },
        ];

        this.addItemsModalActions = [
            { class: 'btn-secondary', text: 'Cancelar' },
            { class: 'btn-primary', text: 'Adicionar', action: this.addItems },
        ];

        this.cancelItemsModalActions = [
            { class: 'btn-secondary', text: 'Cancelar' },
            { class: 'btn-primary', text: 'Confirmar', action: this.cancelItems },
        ];

        this.init();
    },
    methods: {
        init: async function () {
            mainApp.loading = true;
            this.productList = await request('POST', '/api/productitem/filter');
            this.categories = await request('POST', '/api/category/filter', { inactive: '' });
            this.initPagination();

            mainApp.loading = false;
        },
        initPagination: function () {
            if (!this.pageSize) this.lastItem = (this.productList.filter(this.filter).length - 1);
            else {
                this.lastItem = (Number(this.pageSize) - 1);
                this.totalPages = Math.ceil(this.productList.filter(this.filter).length / Number(this.pageSize));
            }
            if (this.lastItem == -1) this.lastItem = 0;
            this.gotoPage(1);
        },
        filter: function (item, index) {
            let result = true;
            if (this.filterFields.categoryFilter) result = (item.codCategory == this.filterFields.categoryFilter);
            result = (result && (item.name.toLowerCase().indexOf(this.filterFields.filterStr.toLowerCase()) > -1));

            return result;
        },
        gotoPage: function (page) {
            this.currentPage = page;
            this.firstItem = (page - 1) * Number(this.pageSize);
            this.lastItem = (this.firstItem + Number(this.pageSize) - 1);
        },
        pagination: function (item, index) {
            return (index >= this.firstItem && index <= this.lastItem);
        },
        openMoveModal: function (item, moveTo) {
            this.moveItemsModal.itemMove = item;
            this.moveItemsModal.itemsMoveTo = moveTo;
            this.moveItemsModal.itemsMove = 1;
            this.$refs.moveItemsModal.show();
        },
        moveItems: async function () {
            mainApp.loading = true;
            let itemsMoved = [];
            const from = (this.moveItemsModal.itemsMoveTo == 'SHELF' ? 'storage' : 'shelf');
            const to = this.moveItemsModal.itemsMoveTo;

            for (let i = 0; i < this.moveItemsModal.itemMove[from].length; i++) {
                this.moveItemsModal.itemMove[from][i].place = to;
                itemsMoved.push(this.moveItemsModal.itemMove[from][i]);
                if (itemsMoved.length == this.moveItemsModal.itemsMove) break;
            }

            await request('POST', '/api/productitem/move', { data: itemsMoved });
            await this.init();
        },
        openAddItemModal: function (item) {
            this.addItemsModal.itemAdd = item;
            this.$refs.addItemsModal.show();
        },
        openCancelItemsModal: function (item) {
            this.cancelItemsModal.itemCancel = item;
            this.$refs.cancelItemsModal.show();
        },
        cancelItems: async function () {
            mainApp.loading = true;
            let itemsCanceled = [];

            for (let i = 0; i < this.cancelItemsModal.itemCancel[this.cancelItemsModal.itemsCancelFrom].length; i++) {
                this.cancelItemsModal.itemCancel[this.cancelItemsModal.itemsCancelFrom][i].place = 'CANCELED';
                this.cancelItemsModal.itemCancel[this.cancelItemsModal.itemsCancelFrom][i].obs = this.cancelItemsModal.cancelObs;
                itemsCanceled.push(this.cancelItemsModal.itemCancel[this.cancelItemsModal.itemsCancelFrom][i]);
                if (itemsCanceled.length == this.cancelItemsModal.qtdItemCancel) break;
            }

            if (itemsCanceled.length > 0) {
                await request('POST', '/api/productitem/move', { data: itemsCanceled });
                await this.init();
                showAlert('Estoque', 'Perda registrada com sucesso', 'success');
            }
            else {
                showAlert('Estoque', 'Nenhum item foi registrado', 'success');
                mainApp.loading = false;
            }
        },
        addItems: async function () {
            mainApp.loading = true;
            await request('POST', '/api/productitem/add', { codProduct: this.addItemsModal.itemAdd.codProduct, qtd: this.addItemsModal.qtdItemAdd });
            await this.init();
        },
        print: function () {
            window.open(`#/print/${this.printOptions.itemsFrom}/${this.printOptions.howMany}/${this.printOptions.printSpace}/${this.printOptions.border}`);
        },
        totalProducts: function () {
            return this.productList.filter(this.filter).length;
        },
        totalItems: function () {
            let result = 0;
            if (this.productList.filter(this.filter).length > 0)
                result = this.productList.filter(this.filter).reduce((total, item) => {
                    return total + item.storage.length + item.shelf.length;
                }, 0);

            return result;
        },
        totalValue: function () {
            let result = 0;
            if (this.productList.filter(this.filter).length > 0)
                result = this.productList.filter(this.filter).reduce((total, item) => {
                    return total + (item.value * (item.storage.length + item.shelf.length));
                }, 0);

            return result;
        }
    },
    watch: {
        'filterFields.filterStr': function () {
            this.initPagination();
        },
        'filterFields.categoryFilter': function () {
            this.initPagination();
        }
    }
})
