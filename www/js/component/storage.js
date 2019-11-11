
routes.push({
    path: '/storage',
    component: Vue.component('storage', function (resolve, reject) {
        loadTemplate('storage').then(template => {
            resolve({
                template: template,
                data: () => {
                    return {
                        productList: [],
                        categories: [],
                        filterStr: '',
                        categoryFilter: '',
                        itemMove: {},
                        itemsMove: 1,
                        itemsMoveTo: '',
                        printOptions: {
                            itemsFrom: 'both',
                            howMany: 'all',
                            printSpace: 1,
                            border: 0
                        }
                    };
                },
                mounted: function () {
                    this.init();
                },
                methods: {
                    init: async function () {
                        this.productList = await request('POST', '/api/productitem/filter');
                        this.categories = await request('POST', '/api/category/filter', { inactive: '' });    
                    },
                    filter: function (item) {
                        let result = true;
                        if (this.categoryFilter) result = (item.codCategory == this.categoryFilter);
                        result = (result && (item.name.toLowerCase().indexOf(this.filterStr.toLowerCase()) > -1));
                        return result;
                    },
                    openMoveModal: function (item, moveTo) {
                        this.itemMove = item;
                        this.itemsMoveTo = moveTo;
                        this.itemsMove = 1;
                        $('#moveItemsStorageModal').modal();
                    },
                    moveItems: async function () {
                        let itemsMoved = [];
                        const from = (this.itemsMoveTo == 'SHELF' ? 'storage' : 'shelf');
                        const to = this.itemsMoveTo;

                        for (let i = 0; i < this.itemMove[from].length; i++) {
                            this.itemMove[from][i].place = to;
                            itemsMoved.push(this.itemMove[from][i]);
                            if (itemsMoved.length == this.itemsMove) break;
                        }

                        await request('POST', '/api/productitem/move', { data: itemsMoved });
                        await this.init();

                        $('#moveItemsStorageModal').modal('hide');
                    },
                    print: function () {
                        window.open(`#/print/${this.printOptions.itemsFrom}/${this.printOptions.howMany}/${this.printOptions.printSpace}/${this.printOptions.border}`);
                        $('#printModal').modal('hide');
                    }
                }
            });
        });
    })
});
