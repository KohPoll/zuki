
/*! 
 * Licensed under MIT.
 * http://www.opensource.org/licenses/mit-license.php
 * Kohpoll(kongxp920@gmail.com), http://github.com/KohPoll/zuki
 */

(function (global, undefined) {

  if (!String.prototype.trim) {
    String.prototype.trim = function(){ return this.replace(/^\s+/, '').replace(/\s+$/, ''); };
  }

  // var escapeStr = function (str) { return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"'); };

  var elementReg = /\{([^}]*)\}/g;
  var variableReg = /\$\{([^}]*)\}/g;
  var escapeVariableReg = /\$!{([^}]*)\}/g;

  var syntaxElements = {//{{{
    'expr': {
      'text': function (expr) { return '"' + expr + '"'; },
      '=': function (expr) { return expr; },
      'e=': function (expr) { return '$helper.escapeHTML(' + expr + ')'; }
    },
    'stmt': {
      'if': function (args) {
        return 'if (' + args + ') {\n';
      },
      'elif': function (args) {
        return '} else if (' + args + ') {\n';
      },
      'else': function (args) {
        return '} else {\n';
      },
      '/if': function (args) {
        return '}\n';
      },

      'choose': function (args) {
        return 'switch (' + args + ') {\n';
      },
      'when': function (args) {
        return 'case ' + args + ':\n';
      },
      '/when': function (args) {
        return 'break;\n';
      },
      '/choose': function (args) {
        return '}\n';
      },

      'each': function (args) {
        var list, listArgs;
        var index, value, sum;

        args = args.split('->');
        list = args[0].trim();
        listArgs = (args[1] ? args[1].trim() : '').split(',');

        index = listArgs[0] ? listArgs[0].trim() : '$index';
        value = listArgs[1] ? listArgs[1].trim() : '$value';
        sum = listArgs[2] ? listArgs[2].trim() : '$sum';

        return '$helper.each(' + list + ', ' + 'function (' + index + ', ' + value + ', ' + sum + ') {\n';
      },
      '/each': function (args) {
        return '});\n';
      },

      '#': function (args) { 
        return '/*' + args + '*/\n'; 
      }
    },
    'unknown': function (args) { throw 'error: unkonw tag ' + args; }
  };//}}}

  var helpers = {//{{{
    'escapeHTML': function (s) {
      var escapes = {
        '>': '&gt;',
        '<': '&lt;',
        '&': '&amp;',
        '"': '&quote;'
      };
      return s.replace(/["&<>]/g, function (match) { return escapes[match]; });
    },
    'each': function (list, handler) {
      for (var i=0,len=list.length; i<len; ++i) {
        handler.call(list, i, list[i], len);
      }
    }
  };//}}}

  var caches = {};


  /*
   * 前处理
   */
  var preproc = function (s) {//{{{
    var rst = s;

    rst = rst.trim();
    rst = rst.replace(/[\r\n\t]/g, '');
    rst = rst.replace(escapeVariableReg, '{e= $1}').replace(variableReg, '{= $1}');

    return rst;
  };//}}}

  /*
   * 将字符流转成token流
   * token结构: [type, value]
   * - type:
   *    'tag' | 'text'
   * - value: 
   *    if (type == 'tag') value = 模板标签{}里的内容
   *    if (type == 'text') value = 字符内容
   *
   *  return [token1, token2, ...]
   */
  var tokenize = function (s) {//{{{
    var firstPass, secondPass, tokens = [];

    firstPass = s.split('{');
    for (var i=0,len=firstPass.length; i<len; ++i) {
      secondPass = firstPass[i].split('}');
      if (secondPass.length !== 1) {
        tokens.push(['tag', secondPass[0]]);
      }
      if (secondPass[secondPass.length - 1] !== '') {
        tokens.push(['text', secondPass[secondPass.length - 1]]); 
      }
    }

    // console.log('tokens', tokens);
    return tokens;
  };//}}}

  /*
   * 将token流转成element流
   * element结构：[type, [name, value]]
   * - type:
   *   'expr' | 'stmt'
   * - name, value:
   *   if (type == 'expr') { //产生值的表达式
   *    name是'text', '=', 'e='
   *    value是对应值
   *   }
   *   if (type == 'stmt') { //控制语句,注释
   *    name是对应标记名
   *    value是标记参数
   *   }
   *
   * return [element1, element2, ...]
   */
  var parse = function (tokens) {//{{{
    var element, elements = [];
    var parseTag = function (tag) {
      var endOfTag = tag.indexOf(' '), name = tag, args = '';
      if (endOfTag !== -1) {
        name = tag.slice(0, endOfTag).trim();
        args = tag.slice(endOfTag).trim();
      }
      return [name, args];
    };
    var parseToken = function (token) {
      var type = 'expr', name = token[0], value = ['text', token[1]];
      if (name === 'tag') {
        value = parseTag(token[1]);
        type = 'stmt';
        if (syntaxElements['expr'][value[0]]) {
          type = 'expr';
        }
      }
      return [type, value];
    };

    for (var i=0,len=tokens.length; i<len; ++i) {
      elements.push(parseToken(tokens[i]));
    }

    // console.log('elements', elements);
    return elements;
  };//}}}

  /*
   * 将element流编译成代码
   * note:需传给renderer生成真正渲染代码
   */
  var compile = function (elements) {//{{{
    var code = '';
    var write = function (element) {
      var s = '';
      var type = element[0], name = element[1][0], value= element[1][1];
      var writer = syntaxElements[type][name] || syntaxElements['unknown'];
      s = writer(value);
      if (type === 'expr') {
        s = '__t__.push(' + s + ');\n';
      }
      return s;
    };

    for (var i=0,len=elements.length; i<len; ++i) {
      code += write(elements[i]);
    }

    // console.log('compile', code);
    return code;
  };//}}}

  /*
   * 将渲染代码包装成渲染器
   */
  var renderer = function (code) {//{{{
    var s = '';

    s += 'var __t__ = [];\n';
    s += 'with ($data || {}) {\n';
      s += 'try {\n';
        s += code;
      s += '} catch (e) {\n';
        s += 'console && console.error(e);\n';
      s += '}\n';
    s += '}\n';
    s += 'return __t__.join("");\n';

    return s;
  };//}}}

  /*
   * 将渲染器包装成函数源代码(方便查看)
   */
  var source = function (renderer) {//{{{
    var s = '';
    s += 'function ($data, $helper) {\n';
      s += renderer;
    s += '}\n';
    return s;
  };//}}}


  var Template = function (tmpl) {//{{{
    var _renderer_, _render_;

    if (!caches[tmpl]) {
      // 预处理
      tmpl = preproc(tmpl);

      // 生成渲染器
      _renderer_ = 
        renderer(
          compile(
            parse(
              tokenize(tmpl)
            )
          )
        );

      // 构造渲染函数
      try {
        _render_ = new Function('$data', '$helper', _renderer_);
      } catch (e) {
        throw e;
      }

      // 缓存
      caches[tmpl] = {
        source: source(_renderer_),
        render: function (data) { return _render_(data, helpers); }
      };
    }

    return caches[tmpl];
  };//}}}

  /*
   * 添加新标记
   * - name 标记名
   * - writer 生成对应代码的函数
   * 如: 
   * Template
   *   .addStatement('while', function (args) {
   *     return 'while (' + args + ') {\n';
   *   })
   *   .addStatement('/while', function (args) {
   *     return '}\n';
   *   });
   */
  Template.addStatement = function (name, writer) {//{{{
    if (typeof writer == 'function') {
      syntaxElements['stmt'][name] = writer; 
    }
    return this;
  };//}}}

  /*
   * 添加view helper
   * - name helper方法名
   * - helper 对应的helper函数
   * 如:
   * Template.addHelper('date', function (timestamp) {
   *   var d = new Date(timestamp);
   *   return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDay();
   * });
   */
  Template.addHelper = function (name, helper) {//{{{
    if (typeof helper == 'function') {
      helpers[name] = helper;
    }
    return this;
  };//}}}


  global.Template = Template;

})(window || this);
