
this.contentApp = new Vue({
    el: '#content',
    data: {
        items: [],
        categories: [],
        filter: {
            codCategory: '',
            status: ''
        }
    },
    methods: {
        init: async () => {
            this.contentApp.categories = await request('POST', '/category/filter', { inactive: '' });
            this.contentApp.loadItems();
        },
        loadItems: async () => {
            this.contentApp.items = await request('POST', '/productitem/filter', this.contentApp.filter);
        },
        editItem: async (open, id) => {

        }
    },
    watch: {
        filter: (val) => {
            // this.contentApp.loadItems();
            console.log('alo');
        }
    }
});
