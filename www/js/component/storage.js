
routes.push({
    path: '/storage',
    component: Vue.component('storage', function (resolve, reject) {
        loadTemplate('storage').then(template => {
            resolve({
                template: template,
                data: () => {
                    return {
                        items: [],
                        categories: [],
                        filter: {
                            codCategory: '',
                            status: ''
                        }
                    };
                },
                mounted: async function () {
                    this.categories = await request('POST', '/api/category/filter', { inactive: '' });
                    this.items = await request('POST', '/api/productitem/filter', this.filter);
                },
                watch: {
                    filter: (val) => {
                        // this.contentApp.loadItems();
                        console.log('alo');
                    }
                }
            });
        });
    })
});
