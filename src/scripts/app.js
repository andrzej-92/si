define(['jquery', 'canvas'], function ($, canvas) {

    "use strict";

    var App = {};

    var run = function () {

        canvas.run();

        $('#add-filed').on('click', function () {
            var inputsWrapper = $(this).parent().prev('li.data-inputs');

            inputsWrapper.after(inputsWrapper.clone());
        });

        $('#run').on('click', function () {

            canvas.run();

            var N = parseFloat($('#eta').val());
            var weights = $('#base_weights');
            var inputs = $('.data-inputs');

            var baseWeights = {};
            var baseData = [];
            var x = {};

            var i = 0;
            var j = 0;

            weights.find('input').each(function () {
                baseWeights[i] = parseFloat($(this).val());
                i++;
            });

            inputs.each(function () {

                baseData[j] = {};
                x = {};

                $(this).find('input[name="d"]').each(function() {
                    baseData[j].d = parseInt($(this).val());
                });

                i = 1;
                $(this).find('input[name="x"]').each(function() {
                    x[i] = parseFloat($(this).val());
                    i++;
                });

                baseData[j].x = x;
                j++;
            });

            console.log(N);
            console.log(baseWeights);
            console.log(baseData);

            require(['neuron'], function (neuron) {
                new neuron(baseData, baseWeights, N);
            });
        });


    };

    App.run = function () {
        $(function () {
            run();
        });
    };


    return App;
});