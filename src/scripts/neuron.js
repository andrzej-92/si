define(['canvas'], function (canvas) {

    "use strict";

    var colors = [
        '#008080',
        '#00cc00',
        '#669900',
        '#cccc00',
        '#cc6600',
        '#ff5050',
        '#cc3399',
        '#ff66ff',
        '#6699ff',
        '#009999',
        '#66ff33',
        '#ff6699',
        '#ffcc99',
        '#e67300',
        '#000099',
        '#339966',
        '#cc9900',
        '#993333'
    ];

    /**
     *
     * @param n
     * @param vector
     * @returns {{}}
     */
    var vectorMultiplication = function (n, vector) {

        var scalar = {};

        for (var i in vector) {
            scalar[i] = n * vector[i];
        }

        return scalar;
    };

    /**
     *
     * @param vecA
     * @param vecB
     * @returns {{}}
     */
    var vectorSum = function (vecA, vecB) {

        var vecC = {};

        if (vecA.length != vecB.length) {
            throw new Error("Size of vectors must be this same");
        }

        for (var i in vecA) {
            vecC[i] = vecA[i] + vecB[i];
        }

        return vecC;
    };

    /**
     *
     * @param vecA
     * @param vecB
     * @returns {{}}
     */
    var vectorDiff = function (vecA, vecB) {

        var vecC = {};

        if (vecA.length != vecB.length) {
            throw new Error("Size of vectors must be this same");
        }

        for (var i in vecA) {
            vecC[i] = vecA[i] - vecB[i];
        }

        return vecC;
    };

    /**
     *
     * @param data - object of learning data and expected response
     * @param weight - base values of weight
     * @param n - learning rate
     * @constructor
     */
    var Neuron = function Neuron(data, weight, n) {

        /**
         * Array of learning data
         * @type {array}
         */
        this.data = data;

        /**
         * Array of base weight values
         *
         * @type {{}}
         */
        this.weight = weight;

        /**
         * Default learning value rate
         *
         * @type {number}
         */
        this.n = n;

        /**
         * Index of current data set
         *
         * @type {number}
         */
        this.k = 0;

        /**
         * Size of data set
         *
         * @type {Number}
         */
        this.K = data.length;

        /**
         * Count of correct decision
         *
         * @type {number}
         */
        this.lpd = 0;

        /**
         * Counter
         * @type {number}
         */
        this.t = 0;

        /**
         * Current data set
         * @type {{}}
         */
        this.currentData = {};

        /**
         * Current response from Neuron
         * @type {number|null}
         */
        this.y;


        /**
         * Decision function
         *
         * @param u
         * @returns {number}
         */
        this.decision = function (u) {

            if (u < 0) {
                return 0;
            }

            return 1;
        };


        this.calculateAndDrawSemiLine = function () {

            var weight = instance.weight;

            var x1 = -7;
            var x2 = 7;

            var y1,y2;

            // miter line
            if (weight[0] != 0 && weight[1] != 0 && weight[2] != 0) {

                console.log("Drawing miter line");

                y1 = -1 * (weight[1]/weight[2]) * x1 - weight[0] / weight[2];
                y2 = -1 * (weight[1]/weight[2]) * x2 - weight[0] / weight[2];

                canvas.line(x1, y1, x2, y2, colors[instance.t]);
            }

            //vertical line
            if (weight[0] != 0 && weight[1] != 0 && weight[2] == 0) {

                console.log("Drawing horizontal line");

                y1 =  - weight[0] / weight[1];
                y2 =  - weight[0] / weight[1];

                canvas.line(x1, y1, x2, y2, colors[instance.t]);
            }


            //horizontal line

            if (weight[0] != 0 && weight[1] == 0 && weight[2] != 0) {

                console.log("Drawing horizontal line");

                y1 =  - weight[0] / weight[2];
                y2 =  - weight[0] / weight[2];

                canvas.line(x1, y1, x2, y2, colors[instance.t]);
            }

        };

        /**
         * Step 1
         *
         * Initialization
         */
        this.initialize = function () {

            console.log("STEP 1: Initialization");

            instance.t   = 0;
            instance.k   = 0;
            instance.lpd = 0;

            console.log(instance);

            return instance.getCurrentData(instance.k);
        };

        /**
         * Step 2 (t)
         *
         * Sets current vector data.
         */
        this.getCurrentData = function (k) {

            var color;

            console.log("STEP 2: Getting data of index ", k);

            instance.currentData = {
                x : {
                    0 : 1, // Xo always == 1
                    1: instance.data[k].x[1],
                    2: instance.data[k].x[2]
                },
                d: instance.data[k].d
            };

            if (instance.currentData.d == 0) {
                color = "#00ff00"
            } else {
                color = "#ff0000"
            }

            canvas.circle(instance.currentData.x[1], instance.currentData.x[2], 2, color);

            console.log("STEP 2: Current data is: ", instance.currentData);

            setTimeout(instance.getNeuronResponse, 200);
        };

        /**
         * Step 3
         *
         * Calculates U value (argument of decision function)
         */
        this.getNeuronResponse = function () {

            console.log("STEP 3: Current weight: ", instance.weight);
            var arg =
                (instance.weight[0] * instance.currentData.x[0]) +
                (instance.weight[1] * instance.currentData.x[1]) +
                (instance.weight[2] * instance.currentData.x[2]);

            instance.y = instance.decision(arg);

            console.log("STEP 3: U = ", arg);
            console.log("STEP 3: F(u) = ", instance.y);

            return instance.correctWeightValues();
        };

        /**
         * Step 4
         *
         * Make correct weight values after iteration
         */
        this.correctWeightValues = function () {

            var excepted = instance.currentData.d,
                response = instance.y,
                n = instance.n,
                data = instance.currentData;

            if (excepted == response) {
                console.log("STEP 4: Weight OK, D == Y : ", response);
                instance.lpd++;
                return instance.checkResult();
            }

            instance.lpd = 0;

            if (excepted == 0 && response == 1) {
                console.log("D == 0, Y == 1");
                instance.weight = vectorDiff(instance.weight, vectorMultiplication(n, data.x));
            }

            if (excepted == 1 && response == 0) {
                console.log("D == 1, Y == 0");
                instance.weight = vectorSum(instance.weight, vectorMultiplication(n, data.x));
            }

            console.log("STEP 4: Weight values: ", instance.weight);

            return instance.checkResult();
        };

        /**
         * Step 5
         *
         * Check results, return Weight vector if all is OK,
         * or return back to Step 2.
         */
        this.checkResult = function () {

            instance.calculateAndDrawSemiLine();

            console.log("STEP 5:");

            if (instance.lpd == instance.K) {

                console.log("Neuron returns correct weight values: ", instance.weight);

                alert("Correct weight: "
                    + instance.weight[0] + " | "
                    + instance.weight[1] + " | "
                    + instance.weight[2] +
                    "\n" +
                    "See console for details."
                );
               // console.log(instance);
                return instance.weight;
            } else {

                if (instance.t > 100) {
                    console.error("TO MUCH RECURSION...");
                    return;
                }
                instance.t++;
                instance.k++;

                if (instance.k > instance.K - 1) {
                    instance.k = 0;
                }

                console.log("GOING TO STEP 2 k=" + instance.k + " t=" + instance.t);

                return instance.getCurrentData(instance.k);
            }
        };

        /**
         * Instance holder
         * @type {Neuron}
         */
        var instance = this;


        return this.initialize();
    };

    return Neuron;

});