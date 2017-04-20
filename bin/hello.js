
var system = require('system');
var args = system.args; 

console.log('Hello, world!');
console.log('Phantom args '+args);

var page = require('webpage').create();
page.open('http://localhost:'+args[1], function(status) {
  console.log("Status: " + status);
  if(status === "success") {
    page.render('H:\\Temp\\example.png');
  }
  phantom.exit();
});