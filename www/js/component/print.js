routes.push({
    path: '/print/:itemsFrom/:howMany/:space/:border',
    component: Vue.component('print', function (resolve, reject) {
        loadTemplate('print').then(template => {
            resolve({
                template: template,
                data: () => {
                    return {
                        itemsFrom: '',
                        howMany: 0,
                        space: 0,
                        border: 0,
                        products: [],
                    };
                },
                mounted: async function () {
                    mainApp.loading = true;
                    let productList = await request('POST', '/api/productitem/filter');
                    let resultList = [];

                    if (this.$route.params.itemsFrom == 'shelf') this.itemsFrom = 'Itens do Expositor';
                    else if (this.$route.params.itemsFrom == 'storage') this.itemsFrom = 'Itens do Expositor';
                    else if (this.$route.params.itemsFrom == 'both') this.itemsFrom = 'Itens do Expositor e Estoque';

                    this.howMany = this.$route.params.howMany;
                    this.border = (this.$route.params.border == '1');
                    this.space = this.$route.params.space;

                    productList.forEach(product => {
                        if (!resultList[product.codProduct]) {
                            resultList[product.codProduct] = {};
                            resultList[product.codProduct].name = `${product.name} (${product.codProduct})`;
                            resultList[product.codProduct].nameOriginal = product.name;
                            resultList[product.codProduct].codProduct = product.codProduct;
                            resultList[product.codProduct].qtdPrint = 0;
                        }

                        if (this.$route.params.itemsFrom == 'shelf') resultList[product.codProduct].qtdPrint = product.shelf.length;
                        else if (this.$route.params.itemsFrom == 'storage') resultList[product.codProduct].qtdPrint = product.storage.length;
                        else resultList[product.codProduct].qtdPrint = product.shelf.length + product.storage.length;
                    });

                    resultList.forEach(product => {
                        if (product.qtdPrint > 0) this.products.push(product);
                    });
                    setTimeout(() => {
                        JsBarcode('.barcode').init();
                        mainApp.loading = false;
                        setTimeout(() => window.print(), 500);
                    }, 500);
                },
            });
        });
    })
});
