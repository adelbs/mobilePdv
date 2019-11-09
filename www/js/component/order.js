
routes.push({
    path: '/order',
    component: Vue.component('order', function (resolve, reject) {
        loadTemplate('order').then(template => {
            resolve({
                template: template,
                data: () => {
                    return {
                    };
                },
                mounted: async function () {
                },
            });
        });
    })
});
