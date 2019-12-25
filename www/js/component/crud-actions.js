
lazyComponent('crud-actions', {
    props: ['removeFunction', 'labelNew', 'componentName', 'currentItem'],
    data: () => {
        return { };
    },
    methods: {
        cancel: function () {
            if (window.history.length > 2)
                window.history.back();
            else
                window.open(`#/${this.componentName}/0`, '_self');
        }
    }
});
