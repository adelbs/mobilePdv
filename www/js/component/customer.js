
routes.push({
    path: '/customer/:id',
    component: defaultCrudApp(
        {
            componentName: 'customer',
            title: 'Cliente',
            labelNew: 'Novo Cliente',
            labelNotFound: 'Cliente não encontrado',
            msgNoRecords: 'Não há clientes cadastrados',
            data: {
                listTableColumns: [
                    { name: 'codCustomer', label: 'Código' },
                    { name: 'name', label: 'Nome' },
                    { name: 'dtBirth', label: 'Aniversário' },
                    { name: 'email', label: 'Email' },
                    { name: 'inactive', label: 'Status', handle: status },
                ],
                crudFields: [
                    { type: 'cod', name: 'codCustomer', label: 'Código' },
                    { type: 'text', name: 'strDtCreate', label: 'Data Cadastro', class: ['col-sm-4'], readonly: true },
                    { type: 'text', name: 'name', label: 'Nome', class: ['col-sm-8'], required: true },
                    { type: 'text', name: 'dtBirth', label: 'Aniversário', class: ['col-sm-8'] },
                    { type: 'number', name: 'phone', label: 'Telefone', class: ['col-sm-8'] },
                    { type: 'email', name: 'email', label: 'Email', class: ['col-sm-8'] },
                ]
            }
        }
    )
});
