let confirmAlertAction = () => { };
Vue.component('alert-message', function (resolve, reject) {
    loadTemplate('alert-message').then(template => {
        resolve({
            template: template,
            data: () => {
                return {
                    alerts: [],
                    alertMessage: {
                        title: '',
                        message: '',
                        type: '' //ALERT, CONFIRM
                    }
                }
            },
            methods: {
                showAlert: function (title, text, type) {
                    this.alerts.push({ type: type, title: title, text: text });

                    setTimeout(() => $(".alert").fadeOut(), 3000);
                    setTimeout(() => this.alerts = [], 3200);
                },
                showConfirm: function (title, message, callBack) {
                    this.openModalMessage(title, message, callBack, 'CONFIRM');
                },
                showMessage: function (title, message, callBack) {
                    this.openModalMessage(title, message, callBack, 'ALERT');
                },
                openModalMessage: function (title, message, callBack, type) {
                    this.alertMessage.title = title;
                    this.alertMessage.message = message;
                    this.alertMessage.type = type;

                    confirmAlertAction = (callBack ? callBack : () => { });
                    $('#alertModal').modal();
                }
            }
        });
    });
});