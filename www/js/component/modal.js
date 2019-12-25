lazyComponent('modal', {
    props: ['id', 'title', 'actions', 'fluid'],
    data: () => {
        return { };
    },
    methods: {
        show: function () {
            $('#'+ this.id).modal();
        },
        hide: function () {
            $('#'+ this.id).modal('hide');
        },
        messageAction: function (action) {
            if (action) action();
            this.hide();
        }
    }
});
