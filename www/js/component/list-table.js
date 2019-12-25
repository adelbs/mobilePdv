/**
 * <list-table
 *      items="[{'Array with the data'}]"
 *      columns="{ 
 *          name: 'attribute name in the data row object', 
 *          label: 'title of the column', 
 *          handle: (v, item) => v ,
 *          class: 'class for each row at this column'
 *          style: 'style for each row at this column'
 *      }"
 *      componentName="If passed, when click at a row, redirects to '#/component/{item._id}'"
 *      msgNoRecords="When the table is empty, the message that should appear"
 *      class="class for the entire table"
 *      style="style for the entire table"
 *      click="action on click at some row"
 *      pageSize="If passed, it's considered as the rows number for each page, and the pagination is configured"
 * ></list-table>
 */
lazyComponent('list-table', {
    props: ['items', 'columns', 'componentName', 'msgNoRecords', 'class', 'style', 'click', 'pageSize'],
    data: () => {
        return {
            firstItem: 0,
            lastItem: 0,
            totalPages: 0,
            currentPage: 1,
        };
    },
    mounted: function () {
        this.initTable();
    },
    methods: {
        initTable: function () {
            if (!this.pageSize) this.lastItem = (this.items.length - 1);
            else {
                this.lastItem = (Number(this.pageSize) - 1);
                this.totalPages = Math.ceil(this.items.length / Number(this.pageSize));
            }

            if (this.lastItem == -1) this.lastItem = 0;
        },
        value: function (item, col) {
            let result = '';
            if (col.name) result = item[col.name];
            if (col.handle) result = col.handle(result, item);
            return result;
        },
        open: function (item) {
            if (this.click) this.click(item);
            else if (this.componentName) window.open(`#/${this.componentName}/${item._id}`, '_self');
        },
        colClick: function (item, col) {
            if (col.click) col.click(item);
        },
        gotoPage: function (page) {
            this.currentPage = page;
            this.firstItem = (page - 1) * Number(this.pageSize);
            this.lastItem = (this.firstItem + Number(this.pageSize) - 1);
        },
        pagination: function (item, index) {
            return (index >= this.firstItem && index <= this.lastItem);
        }
    },
    watch: {
        items: function () {
            this.initTable();
        }
    }
});
