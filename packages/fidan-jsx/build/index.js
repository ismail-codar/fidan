var n=require("@fidanjs/runtime");module.exports={wrap:function(t){n.compute(t)},sample:function(n){return n()},root:function(n){return n(function(){return null})},cleanup:function(){},insert:function(t,e){"object"==typeof e?t.appendChild(e):"function"==typeof e?n.compute(function(){t.textContent=e()},function(){return[e]}):t.textContent=e}};
//# sourceMappingURL=index.js.map
