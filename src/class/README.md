# Wrapper For JavaScript OO

--- 

## Usage


> create class

var Engineer = Class.create({
      initialize: function (name) {
        this.name = name;
      }
    }).include({
      say: function () {
        return 'hello world';
      },
      codeWith: function (tools) {
        return this.name + ' is coding with ' + tools.join(','); 
      }
    });


> inherits class

var FrontEndEngineer = Class.create(Engineer, {
    initialize: function (name, age) {
      this.$super('initialize', name);
      this.age = age;
    },
    say: function() {
      return this.name + ' is ' + this.age + 
             ' and say ' + this.$super('say');
    }
  }, {
    fuckCounter: 0
  });

FrontEndEngineer.include({
    solve: function () {
      return this.$super('codeWith', ['html', 'js', 'css']) + 
             this.fuckIE6(); 
    },
    fuckIE6: function () {
      this.$self.fuckCounter += 1;
      return ' and fucke ie6.';
    }
  }).extend({
    howManyFuck: function () {
      var counter = this.$self.fuckCounter;
      return 'fuck ie6 ' + ((counter == 0) ? (counter + ' time'): (counter + ' times'));
    }
  });

> instance

var engineer = new FrontEndEngineer('kohpoll', 23);

console.log(engineer.say());

console.log(engineer.solve());
console.log(engineer.solve());

console.log(FrontEndEngineer.howManyFuck());

console.log(engineer instanceof FrontEndEngineer, engineer instanceof Engineer);
