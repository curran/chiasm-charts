(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ChiasmCharts = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var strings = {
  data_missing: "The dataset.data property does not exist.",
  data_not_array: "The dataset.data property is not an array, its type is '%type%'.",
  data_not_array_of_objects: [
    "The dataset.data property is not an array of row objects,",
    " it is an array whose elements are of type '%type%'."
  ].join(""),
  metadata_missing: "The dataset.metadata property is missing.",
  metadata_not_object: "The dataset.metadata property is not an object, its type is '%type%'.",
  metadata_missing_columns: "The dataset.metadata.columns property is missing.",
  metadata_columns_not_array: "The dataset.metadata.columns property is not an array, its type is '%type%'.",
  metadata_columns_not_array_of_objects: [
    "The dataset.metadata.columns property is not an array of column descriptor objects,",
    " it is an array whose elements are of type '%type%'."
  ].join(""),
  metadata_columns_name_missing: "The 'name' property is missing from a column descriptor entry in dataset.metadata.columns.",
  metadata_columns_name_not_string: "The 'name' property of a column descriptor entry in dataset.metadata.columns is not a string.",
  metadata_columns_type_missing: "The 'type' property is missing from the '%column%' column descriptor entry in dataset.metadata.columns.",
  metadata_columns_type_not_valid: "The 'type' property for the '%column%' column descriptor is not a valid value.",
  column_in_data_not_metadata: "The column '%column%' is present in the data, but there is no entry for it in dataset.metadata.columns.",
  column_in_metadata_not_data: "The column '%column%' is present in dataset.metadata.columns, but this column is missing from the row objects in dataset.data.",
  column_type_mismatch: "The column '%column%' is present in the data, but its type does not match that declared in dataset.metadata.columns. The type of the data value '%value%' for column '%column' is '%typeInData%', but is declared to be of type '%typeInMetadata%' in dataset.metadata.columns.",
  column_metadata_missing: "There is no metadata present for the column '%column%'"
};

var validTypes = {
  string: true,
  number: true,
  date: true
};

function error(id, params){
  return Error(errorMessage(id, params));
}

function errorMessage(id, params){
  return template(strings[id], params);
}

// Simple templating from http://stackoverflow.com/questions/377961/efficient-javascript-string-replacement
function template(str, params){
  return str.replace(/%(\w*)%/g, function(m, key){
    return params[key];
  });
}

function validate(dataset){
  return new Promise(function (resolve, reject){

    //////////////////
    // dataset.data //
    //////////////////

    // Validate that the `data` property exists.
    if(!dataset.data){
      return reject(error("data_missing"));
    }

    // Validate that the `data` property is an array.
    if(dataset.data.constructor !== Array){
      return reject(error("data_not_array", {
        type: typeof dataset.data
      }));
    }

    // Validate that the `data` property is an array of objects.
    var nonObjectType;
    var allRowsAreObjects = dataset.data.every(function (d){
      var type = typeof d;
      if(type === "object"){
        return true;
      } else {
        nonObjectType = type;
        return false;
      }
    });
    if(!allRowsAreObjects){
      return reject(error("data_not_array_of_objects", {
        type: nonObjectType
      }));
    }


    //////////////////////
    // dataset.metadata //
    //////////////////////

    // Validate that the `metadata` property exists.
    if(!dataset.metadata){
      return reject(error("metadata_missing"));
    }

    // Validate that the `metadata` property is an object.
    if(typeof dataset.metadata !== "object"){
      return reject(error("metadata_not_object", {
        type: typeof dataset.metadata
      }));
    }

    // Validate that the `metadata.columns` property exists.
    if(!dataset.metadata.columns){
      return reject(error("metadata_missing_columns"));
    }

    // Validate that the `metadata.columns` property is an array.
    if(dataset.metadata.columns.constructor !== Array){
      return reject(error("metadata_columns_not_array", {
        type: typeof dataset.metadata.columns
      }));
    }

    // Validate that the `metadata.columns` property is an array of objects.
    var nonObjectType;
    var allColumnsAreObjects = dataset.metadata.columns.every(function (d){
      var type = typeof d;
      if(type === "object"){
        return true;
      } else {
        nonObjectType = type;
        return false;
      }
    });
    if(!allColumnsAreObjects){
      return reject(error("metadata_columns_not_array_of_objects", {
        type: nonObjectType
      }));
    }

    // Validate that the each column descriptor has a "name" field.
    if(!dataset.metadata.columns.every(function (column){
      return column.name;
    })){
      return reject(error("metadata_columns_name_missing"));
    }

    // Validate that the each column descriptor has a "name" field that is a string.
    if(!dataset.metadata.columns.every(function (column){
      return (typeof column.name) === "string";
    })){
      return reject(error("metadata_columns_name_not_string"));
    }

    // Validate that the each column descriptor has a "type" field.
    var columnNameMissingType;
    if(!dataset.metadata.columns.every(function (column){
      if(!column.type){
        columnNameMissingType = column.name;
      }
      return column.type;
    })){
      return reject(error("metadata_columns_type_missing", {
        column: columnNameMissingType
      }));
    }


    // Validate that the each column descriptor has a "type" field that is a valid value.
    var columnNameInvalidType;
    if(!dataset.metadata.columns.every(function (column){
      if(validTypes[column.type]){
        return true;
      } else {
        columnNameInvalidType = column.name;
        return false;
      }
    })){
      return reject(error("metadata_columns_type_not_valid", {
        column: columnNameInvalidType
      }));
    }
    

    //////////////////////
    // dataset.data     //
    //       AND        //
    // dataset.metadata //
    //////////////////////
    
    // Index the columns in the metadata.
    var columnsInMetadata = {};
    dataset.metadata.columns.forEach(function (column){
      //columnsInMetadata[column.name] = true;
      columnsInMetadata[column.name] = column.type;
    });

    //// Index the columns in the data (based on the first row only).
    var columnsInData = {};
    Object.keys(dataset.data[0]).forEach(function (columnName){
      columnsInData[columnName] = true;
    });


    // Validate that all columns present in the data are also present in metadata.
    var columnInDataNotInMetadata;

    // In the same pass over the data, validate that types match.
    var typeMismatchParams;

    var allIsWell = dataset.data.every(function (row){
      return Object.keys(row).every(function (columnInData){
        var typeInMetadata = columnsInMetadata[columnInData];

        // Check that the column is present in metadata.
        if(typeInMetadata){

          // Check that the actual type matches the declared type.
          var value = row[columnInData];
          var typeInData = typeof value;

          // Detect Date types.
          if(typeInData === "object" && value.constructor === Date){
            typeInData = "date";
          }

          if(typeInData !== typeInMetadata){
            typeMismatchParams = {
              column: columnInData,
              value: value,
              typeInData: typeInData,
              typeInMetadata: typeInMetadata
            };
            return false;
          }

          return true;
        } else {
          columnInDataNotInMetadata = columnInData
          return false;
        }
      });
    });
    if(!allIsWell){
      if(columnInDataNotInMetadata){
        return reject(error("column_in_data_not_metadata", {
          column: columnInDataNotInMetadata
        }));
      } else {

        // If we got here, then there was a type mismatch.
        return reject(error("column_type_mismatch", typeMismatchParams));
      }
    }


    // Validate that all columns present in the metadata are also present in the data.
    var columnInMetadataNotInData;
    var allColumnsInMetadataAreInData = dataset.metadata.columns.every(function (column){
      var columnInMetadata = column.name;
      if(columnsInData[columnInMetadata]){
        return true;
      } else {
        columnInMetadataNotInData = columnInMetadata
        return false;
      }
    });
    if(!allColumnsInMetadataAreInData){
      return reject(error("column_in_metadata_not_data", {
        column: columnInMetadataNotInData
      }));
    }

    // If we got here, then all the validation tests passed.
    resolve();
  });
}

function getColumnMetadata(dataset, columnName){

  var matchingColumns = dataset.metadata.columns.filter(function (column){
    return column.name === columnName;
  })

  if(matchingColumns.length === 0){
    throw error("column_metadata_missing", { column: columnName });
  } else {
    return matchingColumns[0];
  }
}

module.exports = {
  errorMessage: errorMessage,
  validate: validate,
  getColumnMetadata: getColumnMetadata
};

},{}],2:[function(require,module,exports){
(function (global){
var d3 = (typeof window !== "undefined" ? window['d3'] : typeof global !== "undefined" ? global['d3'] : null);
var Model = (typeof window !== "undefined" ? window['Model'] : typeof global !== "undefined" ? global['Model'] : null);
var ChiasmComponent = (typeof window !== "undefined" ? window['ChiasmComponent'] : typeof global !== "undefined" ? global['ChiasmComponent'] : null);
var mixins = require("../mixins");

function BarChart(){

  var my = ChiasmComponent();

  var svg = d3.select(my.initSVG());
  var g = mixins.marginConvention(my, svg);

  mixins.scale(my, "x");
  mixins.autoScaleType(my, "x");
  mixins.rangeBands(my, "x");

  var xAxisG = mixins.xAxis(my, g);
  mixins.xAxisLabel(my, xAxisG);

  mixins.scale(my, "y", "linear");
  var yAxisG = mixins.yAxis(my, g);
  mixins.yAxisLabel(my, yAxisG);

  mixins.marginEditor(my, svg);
  
  // Use a zero based Y scale.
  my.when(["dataset", "yAccessor"], function (dataset, yAccessor){
    my.yScaleDomain = [ 0, d3.max(dataset.data, yAccessor) ]
  });

  my.when(["dataset", "xScaled", "yScaled", "height", "xRangeBand"],
      function (dataset, xScaled, yScaled, height, xRangeBand) {

    var bars = g.selectAll("rect").data(dataset.data);
    bars.enter().append("rect");
    bars
      .attr("x", xScaled)
      .attr("width", xRangeBand)
      .attr("y", yScaled)
      .attr("height", function (d){ return height - yScaled(d); });
    bars.exit().remove();

  });

  return my;
}

module.exports = BarChart;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../mixins":9}],3:[function(require,module,exports){
(function (global){
// A bot plot component.
// Draws from this box plot example http://bl.ocks.org/mbostock/4061502

var d3 = (typeof window !== "undefined" ? window['d3'] : typeof global !== "undefined" ? global['d3'] : null);
var Model = (typeof window !== "undefined" ? window['Model'] : typeof global !== "undefined" ? global['Model'] : null);
var ChiasmComponent = (typeof window !== "undefined" ? window['ChiasmComponent'] : typeof global !== "undefined" ? global['ChiasmComponent'] : null);
var mixins = require("../mixins");

function BoxPlot(){

  var my = new ChiasmComponent({
    fill: "white",
    stroke: "black",
    strokeWidth: "1px"
  });

  var svg = d3.select(my.initSVG());
  var g = mixins.marginConvention(my, svg);

  var xAxisG = mixins.xAxis(my, g);
  mixins.scale(my, "x", "ordinal");
  mixins.xAxisLabel(my, xAxisG);

  var yAxisG = mixins.yAxis(my, g);
  mixins.scale(my, "y", "linear");
  mixins.yAxisLabel(my, yAxisG);

  mixins.marginEditor(my, svg);

  my.when(["dataset", "xAccessor"], function (dataset, xAccessor){
    my.xScaleDomain = dataset.data.map(xAccessor);
  });
  
  my.when(["dataset", "yAccessor"], function (dataset, yAccessor){
    my.yScaleDomain = d3.extent(dataset.data, yAccessor);
  });

  my.when(["dataset", "xAccessor", "yAccessor"], function (dataset, xAccessor, yAccessor) {
    my.boxPlotData = d3.nest()
      .key(xAccessor)
      .entries(dataset.data)
      .map(function (d){
        var sorted = d.values.map(yAccessor).sort();
        d.quartileData = quartiles(sorted);
        d.whiskerData = [sorted[0], sorted[sorted.length - 1]];
        return d;
      });
  });

  my.when(["boxPlotData", "xScale", "yScale", "fill", "stroke", "strokeWidth" ],
      function (boxPlotData, xScale, yScale, fill, stroke, strokeWidth){

    // The center lines that span the whiskers.
    var center = g.selectAll("line.center").data(boxPlotData);
    center.enter().append("line").attr("class", "center");
    center.exit().remove();
    center
      .attr("x1", function (d){ return xScale(d.key) + (xScale.rangeBand() / 2); })
      .attr("x2", function (d){ return xScale(d.key) + (xScale.rangeBand() / 2); })
      .attr("y1", function (d){ return yScale(d.whiskerData[0]); })
      .attr("y2", function (d){ return yScale(d.whiskerData[1]); })
      .style("stroke", stroke)
      .style("stroke-width", strokeWidth);

    // The top whiskers.
    var whiskerTop = g.selectAll("line.whisker-top").data(boxPlotData);
    whiskerTop.enter().append("line").attr("class", "whisker-top");
    whiskerTop.exit().remove();
    whiskerTop
      .attr("x1", function (d){ return xScale(d.key); })
      .attr("x2", function (d){ return xScale(d.key) + xScale.rangeBand(); })
      .attr("y1", function (d){ return yScale(d.whiskerData[0]); })
      .attr("y2", function (d){ return yScale(d.whiskerData[0]); })
      .style("stroke", stroke)
      .style("stroke-width", strokeWidth);

    // The bottom whiskers.
    var whiskerBottom = g.selectAll("line.whisker-bottom").data(boxPlotData);
    whiskerBottom.enter().append("line").attr("class", "whisker-bottom");
    whiskerBottom.exit().remove();
    whiskerBottom
      .attr("x1", function (d){ return xScale(d.key); })
      .attr("x2", function (d){ return xScale(d.key) + xScale.rangeBand(); })
      .attr("y1", function (d){ return yScale(d.whiskerData[1]); })
      .attr("y2", function (d){ return yScale(d.whiskerData[1]); })
      .style("stroke", stroke)
      .style("stroke-width", strokeWidth);

    // The box that shows the upper and lower quartiles.
    var boxRect = g.selectAll("rect.box").data(boxPlotData);
    boxRect.enter().append("rect").attr("class", "box");
    boxRect.exit().remove();
    boxRect
      .attr("x", function (d){ return xScale(d.key); })
      .attr("width", xScale.rangeBand())
      .attr("y", function (d){ return yScale(d.quartileData[2]); })
      .attr("height", function (d){
        return yScale(d.quartileData[0]) - yScale(d.quartileData[2]);
      })
      .style("stroke", stroke)
      .style("stroke-width", strokeWidth)
      .style("fill", fill);

    // The horizontal line inside the box that shows the median.
    var median = g.selectAll("line.median").data(boxPlotData);
    median.enter().append("line").attr("class", "median");
    median.exit().remove();
    median
      .attr("x1", function (d){ return xScale(d.key) })
      .attr("x2", function (d){ return xScale(d.key) + xScale.rangeBand(); })
      .attr("y1", function (d){ return yScale(d.quartileData[1]); })
      .attr("y2", function (d){ return yScale(d.quartileData[1]); })
      .style("stroke", stroke)
      .style("stroke-width", strokeWidth);
  });

  return my;
}

function quartiles(d) {
  return [
    d3.quantile(d, .25),
    d3.quantile(d, .5),
    d3.quantile(d, .75)
  ];
}

module.exports = BoxPlot;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../mixins":9}],4:[function(require,module,exports){
(function (global){
var d3 = (typeof window !== "undefined" ? window['d3'] : typeof global !== "undefined" ? global['d3'] : null);
var Model = (typeof window !== "undefined" ? window['Model'] : typeof global !== "undefined" ? global['Model'] : null);
var ChiasmComponent = (typeof window !== "undefined" ? window['ChiasmComponent'] : typeof global !== "undefined" ? global['ChiasmComponent'] : null);
var mixins = require("../mixins");

function HeatMap() {

  var my = ChiasmComponent();

  var svg = d3.select(my.initSVG());
  var g = mixins.marginConvention(my, svg);

  mixins.scale(my, "x");
  mixins.autoScaleType(my, "x");
  mixins.rangeBands(my, "x");

  var xAxisG = mixins.xAxis(my, g);
  mixins.xAxisLabel(my, xAxisG);

  mixins.scale(my, "y");
  mixins.autoScaleType(my, "y");
  mixins.rangeBands(my, "y");

  var yAxisG = mixins.yAxis(my, g);
  mixins.yAxisLabel(my, yAxisG);

  mixins.marginEditor(my, svg);

  my.addPublicProperty("colorColumn", Model.None);
  my.addPublicProperty("colorRangeMin", "#FFFFFF");
  my.addPublicProperty("colorRangeMax", "#000000");

  my.when(["dataset", "colorColumn", "colorRangeMin", "colorRangeMax"],
      function (dataset, colorColumn, colorRangeMin, colorRangeMax){

    var colorScale = d3.scale.linear()
      .domain([0, d3.max(dataset.data, function (d){ return d[colorColumn]; })])
      .range([colorRangeMin, colorRangeMax]);

    my.colorScaled = function(d) {
      return colorScale(d[colorColumn]);
    };
  });

  my.when(["dataset", "xScaled", "yScaled", "xRangeBand", "yRangeBand", "colorScaled"],
      function (dataset, xScaled, yScaled, xRangeBand, yRangeBand, colorScaled) {

    var bars = g.selectAll("rect").data(dataset.data);
    bars.enter().append("rect");
    bars
      .attr("x", xScaled)
      .attr("width", xRangeBand)
      .attr("y", function (d){ return yScaled(d) - yRangeBand; })
      .attr("height", yRangeBand)
      .attr("fill", colorScaled);
    bars.exit().remove();

  });


  //my.when(["data", "yScale", "yColumn", "height"], function (data, yScale, yColumn, height){
  //  // TODO move this logic to scale creation
  //  yScale.rangeBands([height, 0]);
  //  my.y = function(d) { 

  //    // Using yScale.step here is kind of an ugly hack to get the
  //    // right behavior for both linear and ordinal id scales on the Y axis.
  //    return yScale(d[yColumn] + yScale.step);
  //  };
  //});

  //function updateBarStyles(){
  //  my.rects
  //    .attr("stroke", my.stroke)
  //    .attr("stroke-width", my.strokeWidth);
  //}
  //my.when(["rects", "stroke", "strokeWidth"], updateBarStyles)

  return my;
}

module.exports = HeatMap;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../mixins":9}],5:[function(require,module,exports){
module.exports = {
  barChart: require("./barChart"),
  lineChart: require("./lineChart"),
  scatterPlot: require("./scatterPlot"),
  boxPlot: require("./boxPlot"),
  heatMap: require("./heatMap")
};

},{"./barChart":2,"./boxPlot":3,"./heatMap":4,"./lineChart":6,"./scatterPlot":7}],6:[function(require,module,exports){
(function (global){
var d3 = (typeof window !== "undefined" ? window['d3'] : typeof global !== "undefined" ? global['d3'] : null);
var Model = (typeof window !== "undefined" ? window['Model'] : typeof global !== "undefined" ? global['Model'] : null);
var ChiasmComponent = (typeof window !== "undefined" ? window['ChiasmComponent'] : typeof global !== "undefined" ? global['ChiasmComponent'] : null);
var mixins = require("../mixins");

function LineChart(){

  var my = new ChiasmComponent({
    lineStroke: "black",
    lineStrokeWidth: "1px"
  });

  var svg = d3.select(my.initSVG());
  var g = mixins.marginConvention(my, svg);

  var xAxisG = mixins.xAxis(my, g);
  mixins.scale(my, "x", "time");
  mixins.xAxisLabel(my, xAxisG);

  var yAxisG = mixins.yAxis(my, g);
  mixins.scale(my, "y", "linear");
  mixins.yAxisLabel(my, yAxisG);

  mixins.marginEditor(my, svg);


  var line = d3.svg.line()
  
    // TODO make this interpolate method configurable.
    .interpolate("basis");

  var path = g.append("path").attr("fill", "none");

  my.when(["dataset", "xColumn"], function (dataset, xColumn){
    if(xColumn !== Model.None){
      my.xScaleDomain = d3.extent(dataset.data, function (d) { return d[xColumn]; });
    }
  });
  
  my.when(["dataset", "yColumn"], function (dataset, yColumn){
    if(yColumn !== Model.None){
      my.yScaleDomain = d3.extent(dataset.data, function (d) { return d[yColumn]; });
    }
  });

  my.when(["dataset", "xScaled", "yScaled"], function (dataset, xScaled, yScaled) {
    line.x(xScaled).y(yScaled);
    path.attr("d", line(dataset.data));
  });

  my.when("lineStroke", function (lineStroke){
    path.attr("stroke", lineStroke);
  });

  my.when("lineStrokeWidth", function (lineStrokeWidth){
    path.attr("stroke-width", lineStrokeWidth);
  });

  return my;
}

module.exports = LineChart;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../mixins":9}],7:[function(require,module,exports){
(function (global){
var d3 = (typeof window !== "undefined" ? window['d3'] : typeof global !== "undefined" ? global['d3'] : null);
var Model = (typeof window !== "undefined" ? window['Model'] : typeof global !== "undefined" ? global['Model'] : null);
var ChiasmComponent = (typeof window !== "undefined" ? window['ChiasmComponent'] : typeof global !== "undefined" ? global['ChiasmComponent'] : null);
var mixins = require("../mixins");

function ScatterPlot(){

  var my = new ChiasmComponent({
    // TODO add a size column, use sqrt scale.
    circleRadius: 5
  });

  var svg = d3.select(my.initSVG());
  var g = mixins.marginConvention(my, svg);

  mixins.scale(my, "x", "linear")
  var xAxisG = mixins.xAxis(my, g);
  mixins.xAxisLabel(my, xAxisG);

  mixins.scale(my, "y", "linear");
  var yAxisG = mixins.yAxis(my, g);
  mixins.yAxisLabel(my, yAxisG);

  mixins.marginEditor(my, svg);

  my.when(["dataset", "xAccessor"], function (dataset, xAccessor){
    my.xScaleDomain = d3.extent(dataset.data, xAccessor);
  });
  
  my.when(["dataset", "yAccessor"], function (dataset, yAccessor){
    my.yScaleDomain = d3.extent(dataset.data, yAccessor);
  });

  my.when(["dataset", "xScaled", "yScaled", "circleRadius"],
      function (dataset, xScaled, yScaled, circleRadius) {

    var circles = g.selectAll("circle").data(dataset.data);
    circles.enter().append("circle");
    circles
      .attr("cx", xScaled)
      .attr("cy", yScaled)
      .attr("r", circleRadius);
    circles.exit().remove();

  });

  return my;
}

module.exports = ScatterPlot;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../mixins":9}],8:[function(require,module,exports){
module.exports = {
  mixins: require("./mixins"),
  components: require("./components")
};

},{"./components":5,"./mixins":9}],9:[function(require,module,exports){
(function (global){
var d3 = (typeof window !== "undefined" ? window['d3'] : typeof global !== "undefined" ? global['d3'] : null);
var Model = (typeof window !== "undefined" ? window['Model'] : typeof global !== "undefined" ? global['Model'] : null);
var ChiasmDataset = require("chiasm-dataset");
var getColumnMetadata = ChiasmDataset.getColumnMetadata;

// TODO split up this file.
// TODO migrate to ES6 modules & Rollup.

function marginConvention(my, svg){
  var g = svg.append("g");

  // TODO maybe the margin would be better suited as 4 separate properties?
  // margin-top
  // margin-bottom
  // margin-left
  // margin-right
  my.addPublicProperty("margin", {top: 20, right: 20, bottom: 50, left: 60});

  my.when(["box", "margin"], function (box, margin){
    my.width = box.width - margin.left - margin.right;
    my.height = box.height - margin.top - margin.bottom;
    g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  });

  return g;
}

function marginEditor(my, svg){

  // The width of the handles.
  my.addPublicProperty("marginEditorWidth", 15);

  // The color of the handles on hover.
  my.addPublicProperty("marginEditorFill", "rgba(0, 0, 0, 0.2)");

  var data = [ "left", "right", "top", "bottom" ];

  var handles = svg.selectAll(".margin-handle").data(data);
  handles.enter().append("rect")
    .attr("class", "margin-handle")
    .style("fill", "none")
    .style("pointer-events", "all")

  var drag = d3.behavior.drag().on("drag", function (d) {

    // Mutate the margin object.
    my.margin[d] = {
      left:    d3.event.x,
      right:  -d3.event.x,
      top:     d3.event.y,
      bottom: -d3.event.y,
    }[d];

    // Notify model-js that the margin object has been mutated.
    my.margin = my.margin;

    // Hide the handles during drag.
    handles.style("fill", "none");
  });

  handles.call(drag);

  // Fill in the handles on hover.
  my.when("marginEditorFill", function (marginEditorFill){
    handles
      .on("mouseenter", function (){
        d3.select(this).style("fill", marginEditorFill);
      })
      .on("mouseout", function (){
        d3.select(this).style("fill", "none");
      });
  });

  // Update the drag origin function based on the margin.
  my.when("margin", function (margin){
    var origins = {
      left:   { x: margin.left,   y: 0 },
      right:  { x: -margin.right, y: 0 },
      top:    { x: 0,             y: margin.top },
      bottom: { x: 0,             y: -margin.bottom },
    };
    drag.origin(function(d) {
      return origins[d];
    });
  });

  // Render the handles
  my.when(["margin", "marginEditorWidth", "width", "height"],
      function (margin, marginEditorWidth, width, height){

    var x = {
      left:   margin.left         - marginEditorWidth / 2,
      right:  margin.left + width - marginEditorWidth / 2,
      top:    margin.left,
      bottom: margin.left
    };

    var y = {
      left:   margin.top,
      right:  margin.top,
      top:    margin.top          - marginEditorWidth / 2,
      bottom: margin.top + height - marginEditorWidth / 2
    };

    var w = {
      left:   marginEditorWidth,
      right:  marginEditorWidth,
      top:    width,
      bottom: width
    };

    var h = {
      left:   height,
      right:  height,
      top:    marginEditorWidth,
      bottom: marginEditorWidth
    };

    var cursor = {
      left:   "ew-resize",
      right:  "ew-resize",
      top:    "ns-resize",
      bottom: "ns-resize"
    };

    handles
      .attr("x",       function (d){ return x[d]; })
      .attr("y",       function (d){ return y[d]; })
      .attr("width",   function (d){ return w[d]; })
      .attr("height",  function (d){ return h[d]; })
      .style("cursor", function (d){ return cursor[d]; })

      // Rounded corners.
      .attr("rx", function (d){ return marginEditorWidth / 2; })
      .attr("ry", function (d){ return marginEditorWidth / 2; });

  });
}

function scale(my, prefix, initialScaleType){

  var scaleName    = prefix + "Scale";
  var scaleDomain  = prefix + "ScaleDomain";
  var scaleRange   = prefix + "ScaleRange";
  var scalePadding = prefix + "ScaleRangePadding"
  var scaleType    = prefix + "ScaleType";

  var columnName     = prefix + "Column";
  var columnAccessor = prefix + "Accessor";
  var scaled         = prefix + "Scaled";
  var columnMetadata = prefix + "Metadata";

  my.addPublicProperty(columnName, Model.None);

  // TODO this feels like it should be elsewhere.
  if(prefix === "x"){
    my.when("width", function (width){
      my[scaleRange] = [0, width];
    });
  } else if(prefix === "y"){
    my.when("height", function (height){
      my[scaleRange] = [height, 0];
    });
  }

  var scaleTypes = {
    linear: function (my){
      var myScale = d3.scale.linear();
      return my.when([scaleDomain, scaleRange], function (domain, range){
        if(domain !== Model.None && range !== Model.None){
          my[scaleName] = myScale.domain(domain).range(range);
        }
      });
    },
    ordinal: function (my){
      var myScale = d3.scale.ordinal();
      return my.when([scaleDomain, scaleRange, scalePadding], function (domain, range, padding){
        if(domain !== Model.None && range !== Model.None){

          // TODO what about rangePoints?
          my[scaleName] = myScale.domain(domain).rangeBands(range, padding);
        }
      });
    },
    time: function (my){
      var myScale = d3.time.scale();
      return my.when([scaleDomain, scaleRange], function (domain, range){
        if(domain !== Model.None && range !== Model.None){
          my[scaleName] = myScale.domain(domain).range(range);
        }
      });
    }
  };

  my.addPublicProperty(scaleDomain, Model.None);
  my.addPublicProperty(scaleType, initialScaleType ? initialScaleType : Model.None )

  // This property is relevant only for ordinal scales.
  my.addPublicProperty(scalePadding, 0.1);

  var oldListener;
  my.when(scaleType, function (type){

    if(type !== Model.None){

      // TODO add tests for this line.
      if(oldListener){ my.cancel(oldListener); }

      oldListener = scaleTypes[type](my);
    }
  });

  my.when(columnName, function (column){
    my[columnAccessor] = function (d){ return d[column]; };
  });

  my.when([scaleName, columnName], function (scale, column){
    my[scaled] = function (d){ return scale(d[column]); };
  });
  
  my.when(["dataset", columnName], function (dataset, column){
    if(column !== Model.None){
      my[columnMetadata] = getColumnMetadata(dataset, column);
    }
  });

}


// TODO figure out what this really is about.
// The name autoScaleType does not really express what it does.
// It really is more the thing that isolates the difference between
// a bar chart and a histogram.
// This is used in the histogram and heatmap visualizations.
// It has to do with "rangeBands" vs. "rangePoints" too.
function autoScaleType(my, prefix){

  // TODO move these into functions, eliminate duplicate code.
  var columnName = prefix + "Column";
  var columnAccessor = prefix + "Accessor";
  var scaleDomain  = prefix + "ScaleDomain";
  var scaleType = prefix + "ScaleType";
  var columnAccessor = prefix + "Accessor";
  var columnMetadata = prefix + "Metadata";

  my.when(["dataset", columnMetadata, columnAccessor], function (dataset, meta, accessor){
    if(meta.interval){

      // TODO use symbols, e.g. ChiasmDataset.NUMBER rather than strings.
      // TODO use ES6 modules, where symbols make more sense.
      var columnIsNumber = (meta.type === "number");
      var columnIsDate = (meta.type === "date");

      if(columnIsNumber){

        // Histogram bins.
        my[scaleType] = "linear";
        my[scaleDomain] = d3.extent(dataset.data, accessor);
        my[scaleDomain][1] += metadata.interval;

      } else if(columnIsDate){

        // TODO support time intervals.
      }


    } else {

      // Typical ordinal bars.
      my[scaleType] = "ordinal";
      my[scaleDomain] = dataset.data.map(accessor);
    }
  });
}

function rangeBands(my, prefix){

  // TODO make these into functions, reduce duplicate code.
  var scaleName = prefix + "Scale";
  var columnMetadata = prefix + "Metadata";
  var rangeBand = prefix + "RangeBand";

  my.when([columnMetadata, scaleName], function (metadata, scale) {
    if(metadata.interval){

      // Histogram bins.
      my[rangeBand] = Math.abs( scale(metadata.interval) - scale(0) );
    } else {

      // Typical ordinal bars.
      my[rangeBand] = scale.rangeBand();
    }
  });
}

function xAxis(my, g){
  var axisG = g.append("g").attr("class", "x axis");
  var axis = d3.svg.axis();

  my.addPublicProperty("xAxisTickDensity", 70);

  my.when(["xScale", "xAxisTickDensity", "width"], function (xScale, xAxisTickDensity, width){
    axis.scale(xScale).ticks(width / xAxisTickDensity)
    axisG.call(axis);
  });

  my.when("height", function (height){
    axisG.attr("transform", "translate(0," + height + ")");
  });

  return axisG;
}

function yAxis(my, g){
  var axisG = g.append("g").attr("class", "y axis");
  var axis = d3.svg.axis().orient("left");

  my.addPublicProperty("yAxisTickDensity", 30);

  my.when(["yScale", "yAxisTickDensity", "height"], function (yScale, yAxisTickDensity, height){
    axis.scale(yScale).ticks(height / yAxisTickDensity)
    axisG.call(axis);
  });

  return axisG;
}

function xAxisLabel(my, xAxisG){
  var label = xAxisG.append("text").attr("class", "x axis-label");
  my.addPublicProperty("xAxisLabelText", "X Axis Label");
  my.addPublicProperty("xAxisLabelTextOffset", 43);

  my.when("xAxisLabelText", function (xAxisLabelText){
    label.text(xAxisLabelText);
  });

  my.when("xAxisLabelTextOffset", function (xAxisLabelTextOffset){
    label.attr("y", xAxisLabelTextOffset);
  });

  my.when("width", function (width){
    label.attr("x", width / 2);
  });
}

function yAxisLabel(my, yAxisG){
  var label = yAxisG.append("text").attr("class", "y axis-label");
  my.addPublicProperty("yAxisLabelText", "Y Axis Label");
  my.addPublicProperty("yAxisLabelTextOffset", 35);

  my.when("yAxisLabelText", function (yAxisLabelText){
    label.text(yAxisLabelText);
  });

  my.when(["yAxisLabelTextOffset", "height"], function (offset, height){
    label.attr("transform", "translate(-" + offset + "," + (height / 2) + ") rotate(-90)")
  });
}

module.exports = {
  marginConvention: marginConvention,
  marginEditor: marginEditor,
  scale: scale,
  autoScaleType: autoScaleType,
  rangeBands: rangeBands,
  xAxis: xAxis,
  xAxisLabel: xAxisLabel,
  yAxis: yAxis,
  yAxisLabel: yAxisLabel
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"chiasm-dataset":1}]},{},[8])(8)
});