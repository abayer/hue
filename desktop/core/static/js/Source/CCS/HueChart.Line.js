/*
---

script: HueChart.Line.js

description: Defines HueChart.Line, builds on HueChart.Box to produce line charts.

license: MIT-style license

authors:
 - Marcus McLaughlin

requires:
 - ccs-shared/HueChart.Box

provides: [HueChart.Line]

...
*/

HueChart.Line = new Class({

        Extends: HueChart.Box,

        initialize: function(element, options) {
                this.parent(element, options);
                this.render();
        },
        
        //Build line graph.
        addGraph: function(vis) {
                //In effort to maintain same data structure for lines and stacked charts, iterating
                //through the series and adding a line using each series for its data points.
                for (var itemIndex = 0; itemIndex < this.options.series.length; itemIndex++) {
                        //Add a line to the visualization, connecting points produced from the data object.
                        vis.add(pv.Line)
                                //Using as data, this.data.pureArray.
                                .data(this.data.pureArray())
                                //Closures used because the function argument isn't executed until the render phase.
                                //Color the line, based on a color in the colarArray.
                                .strokeStyle(function(itemIndex) {
                                        return function() {
                                                return this.options.colorArray[itemIndex % this.options.colorArray.length];
                                        }.bind(this);
                                }.bind(this)(itemIndex))
                                //For each data object, create a point with its left position at the data object's xField value scaled to pixels and its bottom position at the data object's value for this series scaled to pixels.
                                .left(function(d) {
                                        return this.xScale(d[this.options.xField]);
                                }.bind(this))
                                .bottom(function(itemIndex) {
                                        return function(d) {
                                                return this.yScale(d[this.options.series[itemIndex]]);
                                        }.bind(this);
                                }.bind(this)(itemIndex))
                                //Make the line's width 3 pixels.
                                .lineWidth(3);
                }
        }
});

