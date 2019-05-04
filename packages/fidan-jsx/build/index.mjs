import{compute as n}from"@fidanjs/runtime";export default{wrap:function(t){n(t)},sample:function(n){return n()},root:function(n){return n(function(){return null})},cleanup:function(){},insert:function(t,o){"object"==typeof o?t.appendChild(o):"function"==typeof o?n(function(){t.textContent=o()},function(){return[o]}):t.textContent=o}};
//# sourceMappingURL=index.mjs.map
