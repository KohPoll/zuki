# Another Javascript Template Engine

---

## Syntax

### Basic Concept

In the template string, the template tag begins with `{`, and ends with `}`.      
It has the format as follows:  
`{tagName tagArguments}`  


note: there is a (or more) white space between tagName and tagArguments.  

### Comments
`{# comments}`  
e.g: `{# this is a comment string.}`  

### Expression & Escaped Expression

`{= expr}`  
expr can be any expression that generated the value.  
e.g: `{= 'hello ' + 'world,' + name}`, `{= say() + ' world'}`, `{= $helper.date()}`   
note:  
* in the function calls, `this` refer to the render data.
* in the expr, you can access view helper(say below) with `$helper`.


`{e= expr}`
the escaped version of `{= expr}`.The *<*,*>*,*"*,*&* in the template string will be escaped.  
e.g: `{e= "<script>alert('hello');<\/script>"}`  
*note: you may need to use the `\` to escape the special chars.*


syntax sugars: you can use the ${expr} to replace {= expr}, and $${expr} to replace {e= expr}.

### Statement

Just like the html tags, `{tag}...{/tag}`.

#### Condition

    {if condition}
      ...
    {/if}

    {if condition}
      ...
    {else}
      ...
    {/if}

    {if condition}
      ...
    {elif condition}
      ...
    {else}
      ...
    {/if}

#### Choice

    {choose choices}
      {when getA}
        ...
      {/when}
      {when getB}
        ...
      {/when}
    {/choose}

#### Loop
    
    {each list}
      ${$index} - ${$value} - ${$sum}
    {/each}

    {each list -> order, item, stock}
      ${order} - ${item} - ${stock}
    {/each}

## Custom

### Add the new statement
    Template
      .addStatement('while', function (args) {
        return 'while (' + args + ') {\n';
      })
      .addStatement('/while', function (args) {
        return '}\n';
      });

Then, you can use `{while counter-- != 0}${counter}!{/while}`.

### Add the view helper
    Template
      .addHelper('date', function (timestamp) {
        var d = new Date(timestamp);
        return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDay();
      });

Then, you can use `date is ${$helper.date(223144544343)}...`.

## Usage

### Intialize

    var tmpl = '...template string here...';
    var t = Template(tmpl);

### Render

    var data = {a: 1, b: 2};
    var result = t.render(data);

### View Source

    console.log(t.source);
