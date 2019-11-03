
function addItems() {
    for (let i = 0; i < this.contentApp.itemsAdd; i++)
        this.contentApp.currentItem.productItem.push({ place: 'STORAGE' });

    $('#addItemModal').modal('hide');
}

function countItems(array, filter) {
    let result = [];
    if (array) result = array.filter((el) => { return el.place == filter; });
    return result.length;
}

function moveItems() {
    let itemsMoved = 0;
    const from = (this.contentApp.itemsMoveTo == 'SHELF' ? 'STORAGE' : 'SHELF');
    const to = this.contentApp.itemsMoveTo;

    for (let i = 0; i < this.contentApp.currentItem.productItem.length; i++) {
        if (this.contentApp.currentItem.productItem[i].place == from) {
            this.contentApp.currentItem.productItem[i].place = to;
            itemsMoved++;
            if (itemsMoved == this.contentApp.itemsMove) break;
        }
    }

    $('#moveItemsModal').modal('hide');
}

async function loadCategories() {
    this.contentApp.categories = await request('POST', '/category/filter',
        { $or: [{ inactive: '' }, { codCategory: this.contentApp.currentItem.codCategory }] });
}

this.contentApp = defaultCrudApp('/product', 'Produto',
    {
        categories: [],
        itemsAdd: 0,
        itemsMove: 0,
        itemsMoveTo: 'SHELF',
        barcodeImg: '',
        money: {
            decimal: ',',
            thousands: '.',
            prefix: 'R$ ',
            precision: 2
        }
    });

this.contentApp.initItem = async () => {
    this.contentApp.barcodeImg = '';
    if (this.contentApp.currentItem.codProduct) {
        this.contentApp.barcodeImg = `<img class="barcode" 
            jsbarcode-value="${this.contentApp.currentItem.codProduct}" 
            jsbarcode-format="code128"
            jsbarcode-height="50"
            jsbarcode-fontSize="12"
            jsbarcode-text="${this.contentApp.currentItem.name}" />`;

        setTimeout(() => JsBarcode(".barcode").init(), 1000);
    }

    this.contentApp.itemsAdd = 0;
    this.contentApp.itemsMove = 0;
    this.contentApp.itemsMoveTo = 'SHELF';
    this.contentApp.currentItem.value = strCurrency(this.contentApp.currentItem.value, false);
};

loadCategories();