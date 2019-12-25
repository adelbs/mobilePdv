
routeComponent('dashboard', {
    mounted: function () {
        const gaugeEstoque = this.createGauge('gaugeEstoque', 'GAUGE');
        // gaugeEstoque.percentColors = [[0.0, "#a9d70b" ], [0.50, "#f9c802"], [1.0, "#ff0000"]];
        gaugeEstoque.set(1021); // set actual value

        const gaugeExpositor = this.createGauge('gaugeExpositor', 'GAUGE');
        gaugeExpositor.set(89); // set actual value

        const gaugeMeta = this.createGauge('gaugeMeta', 'DONUT');
        gaugeMeta.set(2670); // set actual value

        const gaugeFaturamento = this.createGauge('gaugeFaturamento', 'DONUT');
        gaugeFaturamento.set(2189); // set actual value

        this.createChart('chartFaturamento', 'line',
            ['25/11', '26/11', '27/11', '28/11', '29/11', '30/11', '01/12', '02/12', '03/12', '04/12', '05/12', '06/12'],
            [5, 2, 3, 5, 3, 7, 8, 9, 10, 8, 8, 6, 10]);

        this.createChart('chartCategoria', 'bar',
            ['Vasos', 'Arranjos', 'Aromas', 'Velas', 'Pratos', 'Kits'],
            [12, 19, 3, 5, 2, 3]);
    },
    methods: {
        createGauge: function (name, type) {
            const opts = {
                angle: 0, // The span of the gauge arc
                lineWidth: 0.1, // The line thickness
                radiusScale: 1, // Relative radius
                pointer: {
                    length: 0.5, // // Relative to gauge radius
                    strokeWidth: 0.035, // The thickness
                    color: '#000000' // Fill color
                },
                limitMax: false,     // If false, max value increases automatically if value > maxValue
                limitMin: false,     // If true, the min value of the gauge will be fixed
                colorStart: '#6F6EA0',   // Colors
                colorStop: '#C0C0DB',    // just experiment with them
                strokeColor: '#EEEEEE',  // to see which ones work best for you
                generateGradient: true,
                highDpiSupport: true,     // High resolution support
                percentColors: [[0.0, "#a9d70b"], [0.50, "#f9c802"], [1.0, "#ff0000"]],
                staticLabels: {
                    font: "10px sans-serif",  // Specifies font
                    labels: [500, 1000, 1500, 2000, 2500, 3000],  // Print labels at these values
                    color: "#000000",  // Optional: Label text color
                    fractionDigits: 0  // Optional: Numerical precision. 0=round off.
                },
                staticZones: [
                    { strokeStyle: "#F03E3E", min: 0, max: 500 }, // Red from 100 to 130
                    { strokeStyle: "#FFDD00", min: 500, max: 1000 }, // Yellow
                    { strokeStyle: "#30B32D", min: 1000, max: 2000 }, // Green
                    { strokeStyle: "#FFDD00", min: 2000, max: 2500 }, // Yellow
                    { strokeStyle: "#F03E3E", min: 2500, max: 3000 }  // Red
                ],
            };

            let gauge;
            if (type == 'GAUGE')
                gauge = new Gauge($(`#${name}`)[0]).setOptions(opts);
            else if (type == 'DONUT')
                gauge = new Donut($(`#${name}`)[0]).setOptions(opts);

            gauge.maxValue = 3000; // set max gauge value
            gauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
            gauge.animationSpeed = 32; // set animation speed (32 is default value)
            gauge.setTextField($(`#${name}-value`)[0]);

            return gauge;
        },
        createChart: function (name, type, labels, data) {
            var ctx = document.getElementById(name).getContext('2d');
            var myChart = new Chart(ctx, {
                type: type,
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Faturamento',
                        data: data,

                        // backgroundColor: 'rgb(255, 99, 132)',
                        // borderColor: 'rgb(255, 99, 132)',

                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1,
                        fill: false
                    }]
                },
                options: {
                    label: { display: false },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }
    }
});
