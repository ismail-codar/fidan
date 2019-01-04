// @tracked
export var externalData = 1;
console.log(externalData);
setInterval(() => {
  externalData = externalData + 1;
}, 1000);
