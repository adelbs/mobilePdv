lazyComponent('crud-form', {
    props: ['fields', 'item'],
    data: () => {
        return {
            money: {
                decimal: ',',
                thousands: '.',
                prefix: 'R$ ',
                precision: 2
            },
        };
    }
});
