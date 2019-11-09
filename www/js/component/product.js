
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

function moveItems(data) {
    let itemsMoved = 0;
    const from = (data.itemsMoveTo == 'SHELF' ? 'STORAGE' : 'SHELF');
    const to = data.itemsMoveTo;

    for (let i = 0; i < data.currentItem.productItem.length; i++) {
        if (data.currentItem.productItem[i].place == from) {
            data.currentItem.productItem[i].place = to;
            itemsMoved++;
            if (itemsMoved == data.itemsMove) break;
        }
    }

    $('#moveItemsModal').modal('hide');
}

async function loadCategories(data) {
    data.categories = await request('POST', '/api/category/filter',
        { $or: [{ inactive: '' }, { codCategory: data.currentItem.codCategory }] });
}

routes.push({
    path: '/product',
    component: defaultCrudApp('product', 'Produto', {
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
    }, async (data) => {
        data.barcodeImg = '';
        if (data.currentItem.codProduct) {
            data.barcodeImg = `<img class="barcode" 
            jsbarcode-value="${data.currentItem.codProduct}" 
            jsbarcode-format="code128"
            jsbarcode-height="50"
            jsbarcode-fontSize="12"
            jsbarcode-text="${data.currentItem.name}" />`;

            setTimeout(() => JsBarcode(".barcode").init(), 1000);
        }

        data.itemsAdd = 0;
        data.itemsMove = 0;
        data.itemsMoveTo = 'SHELF';
        data.currentItem.value = strCurrency(data.currentItem.value, false);

        await loadCategories(data);
    })
});
