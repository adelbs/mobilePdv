lazyComponent('alert-message', {
    data: () => {
        return {
            alerts: [],
            alertMessage: {
                title: '',
                message: '',
                actions: []
            }
        };
    },
    methods: {
        showAlert: function (title, text, type) {
            this.alerts.push({ type: type, title: title, text: text });

            setTimeout(() => $(".alert").fadeOut(), 3000);
            setTimeout(() => this.alerts = [], 3200);
        },
        showSimpleMessage: function (title, message) {
            let alertMessage = {
                title: title,
                message: message,
                actions: [{ class: ['btn-primary'], text: 'Ok' }]
            };

            this.showMessage(alertMessage);
        },
        showMessage: function (alertMessage) {
            this.alertMessage = alertMessage;
            $('#alertModal').modal();
        },
        messageAction: function (action) {
            if (action) action();
            $('#alertModal').modal('hide');
        }
    }
});
