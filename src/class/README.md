# Wrapper For JavaScript OO

--- 

## 用法

### 提供接口

`Class.create(Object instanceProps, Object staticProps) : Function`

`Class.create(Function parentCls, Object instanceProps, Object staticProps) : Function`

* 参数:
  - `parentCls`: `Function` (当需要继承时,必须指定;否则不传入.默认的父类是Object构造函数)
    新创建类的父类(即:当前类继承自它).

  - `instanceProps`: `Object` (可选,可以调用include方法设置)
    类实例属性及方法,使用`initialize`来指定初始化构造方法.
    在方法内,使用`$super`引用父类方法(属性);使用`$self`引用类方法(属性).

  - `staticProps`: `Object` (可选,可以调用extend方法设置)
    类属性及方法.
    在方法内,使用`$self`引用类方法(属性).

* 返回:
  类构造器.使用new操作符来生成类实例.
  类构造器还拥有以下方法(方法均返回类构造器本身，因此可以*链式调用*):
    - `include(Object instanceProps)`
      添加实例方法(属性)
    - `extend(Object staticProps)`
      添加类方法(属性)

## 示例

### 创建类

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

### 继承类

    var FrontEndEngineer = Class.create(Engineer, {
      initialize: function (name, age) {
        this.$super('initialize', name);
        this.age = age;
      },
      say: function() {
        return this.name + ' is ' + this.age + ' and say ' + this.$super('say');
      }
    }, {
      fuckCounter: 0
    });

    FrontEndEngineer.include({
      solve: function () {
        return this.$super('codeWith', ['html', 'js', 'css']) + this.fuckIE6(); 
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

### 构造类实例

    var engineer = new FrontEndEngineer('kohpoll', 23);
    console.log(engineer.say());
    console.log(engineer.solve());
    console.log(engineer.solve());
    console.log(FrontEndEngineer.howManyFuck());
    console.log(engineer instanceof FrontEndEngineer, engineer instanceof Engineer);
