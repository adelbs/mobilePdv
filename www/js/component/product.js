
function addItems(data, e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    for (let i = 0; i < data.itemsAdd; i++)
        data.currentItem.productItem.push({ place: 'STORAGE' });
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
}

async function loadCategories(data) {
    data.categories = await request('POST', '/api/category/filter',
        { $or: [{ inactive: '' }, { codCategory: data.currentItem.codCategory }] });
}

routes.push({
    path: '/product/:id',
    component: defaultCrudApp(
        {
            componentName: 'product',
            title: 'Produtos',
            template: 'product',
            data: {
                categories: [],
                itemsAdd: 0,
                itemsMove: 0,
                itemsMoveTo: 'SHELF',
                barcodeImg: '',
                listTableColumns: [
                    { name: 'codProduct', label: 'Código' },
                    { name: 'name', label: 'Produto' },
                    { name: 'productItem', label: 'Est.', handle: v => this.countItems(v, 'STORAGE') },
                    { name: 'productItem', label: 'Exp.', handle: v => this.countItems(v, 'SHELF') },
                    { name: 'productItem', label: 'Res.', handle: v => this.countItems(v, 'RESERVED') },
                    { name: 'productItem', label: 'Ven.', handle: v => this.countItems(v, 'SOLD') },
                    { name: 'productItem', label: 'Can.', handle: v => this.countItems(v, 'CANCELED') },
                    { name: 'value', label: 'Valor', handle: v => strCurrency(v, true) },
                    { name: 'inactive', label: 'Status', handle: status },
                ],
                crudFields: [],

                moveItemsModalActions: [],
                addItemsModalActions: []
            }
        },
        async (data) => {
            data.moveItemsModalActions = [
                { class: 'btn-secondary', text: 'Cancelar' },
                { class: 'btn-primary', text: 'Mover', action: () => moveItems(data) },
            ];

            data.addItemsModalActions = [
                { class: 'btn-secondary', text: 'Cancelar' },
                { class: 'btn-primary', text: 'Adicionar', action: () => addItems(data) },
            ];

            data.barcodeImg = '';
            if (data.currentItem.codProduct) {
                data.barcodeImg = `<img class="barcode" 
                        jsbarcode-value="${data.currentItem.codProduct}" 
                        jsbarcode-format="code128"
                        jsbarcode-height="50"
                        jsbarcode-fontSize="12"
                        jsbarcode-text="${data.currentItem.name} (${data.currentItem.codProduct})" />`;

                setTimeout(() => JsBarcode(".barcode").init(), 1000);
            }

            data.itemsAdd = 0;
            data.itemsMove = 0;
            data.itemsMoveTo = 'SHELF';

            if (!data.currentItem.productItem) Vue.set(data.currentItem, 'productItem', []);
            data.currentItem.cost = strCurrency(data.currentItem.cost, false);
            data.currentItem.value = strCurrency(data.currentItem.value, false);

            await loadCategories(data);
            data.crudFields = [
                { type: 'cod', name: 'codProduct', label: 'Código' },
                { type: 'text', name: 'strDtCreate', label: 'Data Cadastro', class: ['col-sm-4'], readonly: true },
                { type: 'text', name: 'name', label: 'Nome', class: ['col-sm-8'], required: true },
                { type: 'description', name: 'desc', label: 'Descrição', class: ['col-sm-8'] },
                {
                    type: 'select', name: 'codCategory', label: 'Categoria', options: {
                        list: data.categories,
                        id: 'codCategory',
                        text: 'name'
                    }, class: ['col-sm-8'], required: true
                },
                { type: 'currency', name: 'cost', label: 'Custo Produto', class: ['col-sm-2'], required: true },
                { type: 'currency', name: 'value', label: 'Valor Venda', class: ['col-sm-2'], required: true }
            ]
        }
    )
});