(function (global, undefined) {
  var Class = global.Class;
  
  describe('class', function () {
    
      var Shape = Class.create({
          initialize: function (type) {
            this.type = type;
          },
          draw: function () {
            return '(call at shape)->draw=' + this.type;
          }
        });

      var Cube = Class.create(Shape, {
          initialize: function (sideLength) {
            this.$super('initialize', 'cube');

            this.sideLength = sideLength;

            this.$self.counter++
          },
          draw: function () {
            return this.$super('draw') + ';(call at cube)->draw=' + this.type;
          }
        }, {
          counter: 0
        });

      Cube.include({
          area: function () {
            return this.sideLength * this.sideLength;
          }
        });

      Cube.extend({
          showCounter: function () {
            return 'shape=' + this.$self.counter;
          }
        });

      describe('basic create', function () {//{{{
        var circle = new Shape('circle');

        it('initialize correct', function () {
          expect(circle.type).toBe('circle');
          expect(circle.draw()).toBe('(call at shape)->draw=circle');
        });

        it('has the correct type', function () {
          expect(circle instanceof Shape).toBe(true);
        });
      });//}}}

      describe('inherits create', function () {//{{{
        var cubeA = new Cube(10);

        it('initialize correct', function () {
          expect(cubeA.type).toBe('cube');
          expect(cubeA.sideLength).toBe(10);
          expect(cubeA.area()).toBe(100);
        });

        it('has the correct type', function () {
          expect(cubeA instanceof Cube).toBe(true);
          expect(cubeA instanceof Shape).toBe(true);
        });

        it('call the super method correct', function () {
          expect(cubeA.draw()).toBe('(call at shape)->draw=cube;(call at cube)->draw=cube');
        });

        it('call the static method correct', function () {
          var cubeB = new Cube(5);
          expect(Cube.showCounter()).toBe('shape=2');
        });
      });//}}}

   });

})(window);
