Vue.component('loading', function (resolve, reject) {
    loadTemplate('loading').then(template => {
        resolve({
            template: template,
            props: ['loading'],
        });
    });
});