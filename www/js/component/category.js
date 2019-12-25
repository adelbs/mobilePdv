routes.push({
    path: '/category/:id',
    component: defaultCrudApp(
        {
            componentName: 'category',
            title: 'Categoria',
            labelNew: 'Nova Categoria',
            labelNotFound: 'Categoria não encontrada',
            msgNoRecords: 'Não há categorias cadastradas',
            data: {
                listTableColumns: [
                    { name: 'codCategory', label: 'Código' },
                    { name: 'name', label: 'Categoria' },
                    { name: 'inactive', label: 'Status', handle: status },
                ],
                crudFields: [
                    { type: 'cod', name: 'codCategory', label: 'Código' },
                    { type: 'text', name: 'strDtCreate', label: 'Data Cadastro', class: ['col-sm-4'], readonly: true },
                    { type: 'text', name: 'name', label: 'Nome', class: ['col-sm-8'], required: true },
                ]
            }
        }
    )
});
