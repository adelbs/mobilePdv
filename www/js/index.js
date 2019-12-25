const VERSION = '0.0.1';
const routes = [];
let mainApp;
let components;

async function init() {

    components = await loadComponents([
        'alert-message', 'modal', 'nav-bar', 'list-table', 'crud-actions', 'crud-form',
        'home-menu', 'dashboard', 'storage', 'order', 'category', 'product', 'customer',
        'config', 'user',
        'pdv', 'reader', 'print',
    ]);
    // routes.push({ path: '*', template: '<p>não encontrado</p>' });

    mainApp = new Vue({
        el: '#mainApp',
        router: new VueRouter({ routes }),
        data: {
            loading: true,
            showNavBar: false
        },
        mounted: function () {
            Vue.nextTick(async () => this.loading = false);
        },
        watch: {
            $route(to, from) {
                this.showNavBar = (to.path != '/'
                    && to.path.indexOf('/reader') == -1
                    && to.path.indexOf('/print') == -1
                    && to.path.indexOf('/pdv') == -1);
            }
        }
    });
}

$(init);