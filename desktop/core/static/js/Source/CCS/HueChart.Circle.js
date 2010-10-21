/*
---

script: HueChart.Circle.js

description: Defines HueChart.Circle, a base class for circular charts, which builds on HueChart.

license: MIT-style license

authors:
- Marcus McLaughlin

requires:
- ccs-shared/HueChart

provides: [HueChart.Circle]

...
*/


HueChart.Circle = new Class({
        
        Extends: HueChart,

        /* options:
                radius: the radius of the chart, (will default to width/2)
                innerRadius: the inner radius of the chart, (optional)
                outerRadius: the outer radius of the chart, (optional)
                graphField: the field in the data object that should be graphed,
                onWedgeOver: function to be executed when the mouse is moved over a wedge of the chart, 
                onWedgeOut: function to be executed when the mouse is moved off of a wedge of the chart,
                onWedgeClick: function to be executed when a wedge of the chart is clicked
        */

        initialize: function(element, options) {
                this.parent(element, options);
                this.selected_index = -1;
                this.radius = this.width/2;
                this.addEvent('setupChart', function(vis) {
                        this.addGraph(vis);
                        this.addEventBar(vis);
                });
        },

        addGraph: function(vis) {
                var valueSum = this.data.getSeriesSum(this.options.graphField);
                //Put selected index, color array, and hue chart in scope
                var get_selected_index = this.getSelectedIndex.bind(this);
                var colorArray = this.options.colorArray;
                var hueChart = this;
                vis.add(pv.Wedge)
                        //Data is the pureArray.
                        .data(this.data.pureArray())
                        //Bottom of the wedge space is the radius
                        .bottom(this.radius)
                        //Left of the wedge space is the radius
                        .left(this.radius)
                        //The outer radius is the radius
                        .outerRadius(this.radius)
                        //The angle is a normalized value summing to 2PI based on the values in the graphField. 
                        .angle(function(d) { 
                                return (d[this.options.graphField]/valueSum) * 2 * Math.PI; 
                        }.bind(this))
                        //Fill with white if selected, otherwise use corresponding value in colorArray
                        .fillStyle(function() {
                                return this.index == get_selected_index() ? '#fff' : colorArray[this.index % colorArray.length];
                        }).event("click", function(d) {
                                hueChart.fireEvent('wedgeClick', [d, this.index]);
                        });                
        },

        addEventBar: function(vis) {
                //Base vector is vector pointing straight up.
                var baseVector = {x: 0, y: this.radius};
                //Shortcut to data array
                var dataArray = this.data.pureArray();
                //Calculate sum of graph values
                var valueSum = this.data.getSeriesSum(this.options.graphField);
                //Shortcut to graphField
                var graphField = this.options.graphField;
                //Add an invisible bar to catch events
                vis.add(pv.Bar)
                        //Left of bar at 0
                        .left(0)
                        //Bottom of bar at 0
                        .bottom(0)
                        //Width is width of panel
                        .width(this.width)
                        //Height is height of panel
                        .height(this.height)
                        //Fillstyle is white with a very very small (negligible, even) opacity
                        .fillStyle("rgba(0,0,0,.001)")
                        .event("mousemove", function() {
                                //baseVector.y is equal to radius
                                var curPoint = vis.mouse();
                                //Conversion from mouse points to vectors where mouse point (radius, radius) is equal to vector (0, 0) (origin)
                                //xPoint -> xVector: xVector = xPoint - radius;
                                var curVector = {};
                                curVector.x = curPoint.x - baseVector.y; 
                                //yPoint -> yVector: yVector = (yPoint - radius) * -1;
                                curVector.y = (curPoint.y - baseVector.y) * -1;
                                //Length of vector - sqrt(x^2 + y^2)
                                var vectorLength = Math.sqrt(Math.pow(curVector.x, 2) + Math.pow(curVector.y, 2));
                                console.log(vectorLength);
                                //Angle of a vector 2 relative to vector 1 = atan2(v2.y, v2.x) - atan2(v1.y, v1.x)
                                //In radians
                                //Quadrants 1 to 3 - negative numbers ascending clockwise from vertical.  
                                //Quadrant 4 - positive number ascending counter-clockwise from vertical. 
                                var angle = Math.atan2(curVector.y, curVector.x) - Math.atan2(baseVector.y, baseVector.x);
                                //Convert angle to positive number ascending clockwise from vertical.
                                if (angle < 0) {
                                         //In quadrant 1 to 3 - convert to a positive number.
                                         angle = -angle;
                                } else {
                                         //In quadrant 4 - subtract angle from Math.PI/2 to find positive amount from 3pi/2, add 3pi/2.  
                                         angle = (Math.PI/2 - angle) + (3 * Math.PI/2);
                                }
                                var nextAngle = 0;
                                //Create array of angle sums.
                                var angleSums = [];
                                for (var i = 0; i < dataArray.length; i++) {
                                        //Calculate angle -- previousAngle (angleSums[i-1] plus the latest angle. 
                                        newAngle = (angleSums[i -1] || 0) + ((dataArray[i][graphField]/valueSum) * 2 * Math.PI); 
                                        angleSums.push(newAngle);
                                }

                                //Fire wedgeOver event if the current angle is greater than the sum of all prior angles but less than that sum plus the next angle.
                                //If the vector is shorter than the radius (meaning it's within the circle), search for a wedge, otherwise, fire wedge out
                                if (vectorLength < this.radius) {
                                        for (i = 0; i < dataArray.length; i++) {
                                                lastAngle = angleSums[i -1] || 0;
                                                if (angleSums[i] > angle && angle > lastAngle) {
                                                        //Don't do anything if this wedge is already selected.
                                                        if (i != this.getSelectedIndex()) {
                                                                //Fire wedgeOut for the previously selected wedge
                                                                if (this.getSelectedIndex() != -1) {
                                                                        this.fireEvent('wedgeOut', [ dataArray[this.getSelectedIndex()], this.getSelectedIndex()]);
                                                                }
                                                                //Fire wedgeOver for the newly selected wedge
                                                                this.fireEvent('wedgeOver', [ dataArray[i], i]);
                                                        }
                                                } 
                                        }
                                } else if(this.getSelectedIndex() != -1) {
                                        this.fireEvent('wedgeOut', [ dataArray[this.getSelectedIndex()], this.getSelectedIndex()]);
                                }
                        }.bind(this))
                        //Fire wedgeOut when we mouse out of the panel, since clearly we can no longer be over a wedge within the panel;.
                        .event("mouseout", function() {
                                if (this.getSelectedIndex() != -1) {
                                        this.fireEvent('wedgeOut', [ dataArray[this.getSelectedIndex() ], this.getSelectedIndex()]);
                                }
                        }.bind(this));
        },

        highlightWedge: function(sliceIndex) {
                this.setSelectedIndex(sliceIndex);
                this.render();
        },

        unHighlightWedges: function() {
                this.setSelectedIndex(-1);
                this.render();
        },

        resize: function(width, height) {
                this.radius = width/2;
                this.parent(width, height);
        }

});
