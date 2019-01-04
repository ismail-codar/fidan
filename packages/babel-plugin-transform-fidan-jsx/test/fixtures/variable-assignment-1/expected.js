// @tracked
var title1 = fjsx.value("");
var title2 = "";
var title3 = "";
var ctrl = {
  testMethod: function testMethod() {
    var testVAriable = 0;
    testVAriable = 1;
  },
  changeTitle: function changeTitle() {
    title1("0");
    title3 = title1.$val;
    title3 = title1.$val + "x";
  }
};
