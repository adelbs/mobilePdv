
routes.push({
    path: '/user/:id',
    component: defaultCrudApp(
        {
            componentName: 'user',
            title: 'Usuários',
            labelNew: 'Novo Usuário',
            labelNotFound: 'Usuário não encontrado',
            msgNoRecords: 'Não há usuários cadastrados',
            data: {
                listTableColumns: [
                    { name: 'codUser', label: 'Código' },
                    { name: 'name', label: 'Nome' },
                    { name: 'inactive', label: 'Status', handle: status },
                ],
                crudFields: [
                    { type: 'cod', name: 'codUser', label: 'Código' },
                    { type: 'text', name: 'strDtCreate', label: 'Data Cadastro', class: ['col-sm-4'], readonly: true },
                    { type: 'text', name: 'name', label: 'Nome', class: ['col-sm-8'], required: true },
                ]
            }
        }
    )
});
