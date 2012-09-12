/*! 
 * Licensed under MIT.
 * http://www.opensource.org/licenses/mit-license.php
 * Kohpoll(kongxp920@gmail.com), http://github.com/KohPoll/zuki
 */

(function (global, undefined) {

  var Class = {
    /*
     * 生成构造器
     *
     * var Parent = Class.create({
     *  initialize: function () { ... },
     *  // instance property ...
     * }, {
     *  // statice property
     * });
     *
     * var Child = Class.create(Parent, {
     *  initialize: functon () { ... },
     *  // instance property ...
     *
     *  => 访问类成员(属性,方法)
     *  this.$self.attr
     *  this.$self.method()
     *
     *  => 访问父类方法
     *  this.$super('method', args...)
     * }, {
     *  // statice property ...
     * });
     *
     * Child.include({ //instance property }).extend({ //static property });
     *
     * var o = new Child();
     *
     */
    create: function () {
      var supr = Object;
      var protoProps = arguments[0] || {}, staticProps = arguments[1] || {};
      var klass;

      if (typeof arguments[0] == 'function') {
        supr = arguments[0];
        protoProps = arguments[1] || {};
        staticProps = arguments[2] || {};
      }

      if (typeof protoProps.initialize != 'function') {
        protoProps.initialize = function () {};
      } 

      klass = this._construct();
      this._inherits(klass, supr, protoProps, staticProps);

      return klass;
    },
    _construct: function () {//{{{
      var slice = Array.prototype.slice;

      // 构造器
      var Klass = function () {
        // 访问类成员快捷方式 
        this.$self = Klass.$self;

        // 访问父类成员快捷方式
        this.$super = function (name) {
          var args = slice.call(arguments, 1) || [];
          var fn = Klass.$super[name];
          return typeof fn == 'function' ? fn.apply(this, args) : fn;
        };

        this.initialize.apply(this, arguments);
      };

      // 用于添加类成员(属性,方法)
      Klass.extend = function (obj) {
        for (var name in obj) {
          this[name] = obj[name];
        }

        return this;
      };

      // 添加实列成员(属性,方法)
      Klass.include = function (obj) {
        for (var name in obj) {
          this.prototype[name] = obj[name];
        }

        return this;
      };

      return Klass;
    },//}}}
    _inherits: function (klass, supr, protoProps, staticProps) {//{{{
      // 用于共享原型的空函数
      var F = function () {};

      // 重写原型实现继承
      F.prototype = supr.prototype;
      klass.prototype = new F();

      // 保存父类原型
      klass.$super = supr.prototype;
      // 保存类自身
      klass.$self = klass;

      // 添加实列成员、类成员
      klass.include(protoProps).extend(staticProps);

      // 设置构造器的constructor(因为重写了原型)
      klass.prototype.constructor = klass;

      return klass;
    }//}}}
  };

  global.Class = Class;
})(window || this);
