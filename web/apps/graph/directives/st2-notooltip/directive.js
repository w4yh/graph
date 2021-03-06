'use strict';
(function () {

  function basicStringComposer(n) {
    return function () {
      return Math.round(this.value * Math.pow(10, n || 0)) / Math.pow(10, n || 0) + this.multi;
    };
  }

  angular.module('main')
    .value('st2Units', {
      percent: function (num) {
        // Percent value at [0..1] domain
        return {
          value: num * 100,
          multi: '%',
          toString: basicStringComposer()
        };
      },
      'decimal percent': function (num) {
        // Percent value at [0..100] domain
        return {
          value: num,
          multi: '%',
          toString: basicStringComposer()
        };
      },
      decimal: function (num) {
        // Any decimal value
        return {
          value: num,
          multi: '',
          toString: basicStringComposer(3)
        };
      },
      bits: function (num) {
        // Value in bits (commonly, tx or rx)
        return {
          value: num,
          multi: 'b',
          toString: basicStringComposer
        };
      },
      bytes: function (num) {
        // Value in bytes
        return {
          value: num,
          multi: 'B',
          toString: basicStringComposer
        };
      }
    });
    
  angular.module('main')
    .directive('st2Notooltip', ['st2Units', function (units) {
      
      return {
        restrict: 'C',
        scope: {
          spec: '='
        },
        templateUrl: 'apps/graph/directives/st2-notooltip/template.html',
        link: function postLink(scope) {
          scope.units = units;
          
          scope.$watch('spec', function (graph) {
            var recalcScale = _.debounce(function () {
              var minValue = graph.opts.yAxis.from !== undefined ?
                graph.opts.yAxis.from : graph.getMinValue();
              var maxValue = graph.opts.yAxis.to !== undefined ?
                graph.opts.yAxis.to : graph.getMaxValue();
              
              scope.y = d3.scale.linear()
                .domain([minValue, maxValue])
                .range([0, 100])
                .clamp(true);
            }, 150);
            
            _.each(graph.layers, function (layer) {
              layer.$watch('values', recalcScale);
            });
          });
          
          scope.spec.$on('cursormove', function (e, coord) {
            scope.time = coord;
            scope.$$phase || scope.$apply();
          });
        }
      };
    }]);

})();