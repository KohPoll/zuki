
/*! 
 * Licensed under MIT.
 * http://www.opensource.org/licenses/mit-license.php
 * Kohpoll(kongxp920@gmail.com), http://github.com/KohPoll/zuki
 */

(function (global, undefined) {

  var exprs= {
    '=': 'expr',
    '=e': 'escape expr'
  };

  var tags = {
    'if': 'if',
    'elif': 'else if',
    'else': 'else',

    'choose': 'switch',
    'when': 'case',

    'each': 'for'
  };

  var elementReg = [/{{/, /}}/];

  var strip = function (s) {
    return s.replace(/[\r\n\t]*/g, '');
  };

  var render = function (tokens) {
    var token;
    for (var i=0,len=tokens; i<len; ++i) {
      token = tokens[i];
    }
  };

  var squashTokens = function (tokens) {
    var squashedTokens = [];
    var nextTagToken = function (cur) {
      cur += 1;
      for (var i=cur,len=tokens.length; i<len; ++i) {
        if (tokens[i][0] == 'tag' && tokens[i][1] == 'end') return i;
      }
    };

    var token, next;
    for (var i=0,len=tokens.length; i<len; ) {
      token = tokens[i].slice();
      if (token[0] == 'tag' && token[1] != 'end') {
        next = nextTagToken(i)
        token.push(tokens.slice(i+ 1, next));
      } else {
        next = 1;
      }

      squashedTokens.push(token);
      i += next;
    }

    return squashedTokens;
  };

  var parse = function (str) {
    var tokens = [];
    var pos, m = null;

    var parseTag = function (s) {
      var i, tag, val, t;

      tag = s;
      i = tag.indexOf(' ');
      if (i != -1) {
        tag = s.slice(0, i);
        val = s.slice(i + 1);

        if (tags[tag]) {
          t = ['tag', tag, val];
        } else {
          t = ['expr', tag, val];
        }
      } else {
        t = ['tag', tag, ''];
      }

      return t;
    };

    str = strip(str);
    while (str != '') {
      if (m = str.match(elementReg[0])) {
        pos = m.index;
        tokens.push(['text', str.slice(0, pos)]);
        str = str.slice(pos + 2);

        if (m = str.match(elementReg[1])) {
          pos = m.index;
          tokens.push(parseTag(str.slice(0, pos)));
          str = str.slice(pos + 2);
        }
      } else {
        tokens.push(['text', str]);
        str = '';
      }
    }

    console.log('tokens', tokens);
    tokens = squashTokens(tokens);
    console.log('tokens', tokens);

    return tokens;
  };

  global.parse = parse;
  global.render = render;
})(window || this);
