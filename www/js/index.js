
const VERSION = '0.0.1';
const routes = [];
let mainApp;
let components;

const noMenu = ',/,/print,/pdv,/reader,';

async function init() {

    components = await loadComponents([
        'loading', 'alert-message', 'nav-bar',
        'home-menu', 'dashboard', 'storage', 'order', 'category', 'product', 'customer',
        'pdv', 'reader',
        'print',
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
            Vue.nextTick(async () => {
                this.loading = false;
            });
        },
        watch: {
            $route (to, from) {
                // console.log('from '+ from.path +' to '+ to.path);
                // this.loading = true;

                if (noMenu.indexOf(`,${to.path},`) > -1) {
                    this.showNavBar = false;
                }
                else {
                    this.showNavBar = true;
                }
            }
        }
    });
}

$(init);