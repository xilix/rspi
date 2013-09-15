/*
For analisis in a DDBB

SELECT  `function` ,`iteracio`, SUM( TIME ) , COUNT( * ) , 1000 * SUM( TIME ) / COUNT( * ) 
FROM  `simple` 
GROUP BY  `function` , `iteracio`
ORDER BY `function`

TODO: To automatize this proces

To set/unset the profiler mode use sed with "s@/_*JSP*_/@//JSP//@g"
or "s@//JSP//@/_*JSP*:/@g" but witouth the _. You understand me ....
i hope ....
*/

function JSProfiler () {
    this.t = new Array();
    this.active = false;
    this.scale = 1000.0;
}

/**
 * Why another profiler ??!! well... because the profiler
 * from the browser is stupid and it doesn't work propper
 * sometimes or is not as useful.
 * In this way is more easy to profile 
 * a known part which is critical. So why? because is 
 * more precise on profiling a specific part of the code.
 * Also because is easier to unit testing the perfromance in 
 * this way
 */
JSProfiler.prototype.microtime = function (get_as_float) {
  // http://kevin.vanzonneveld.net
  // +   original by: Paulo Freitas
  // *     example 1: timeStamp = microtime(true);
  // *     results 1: timeStamp > 1000000000 && timeStamp < 2000000000
  var now = new Date().getTime() / 1000;
  var s = parseInt(now, 10);

  return (get_as_float) ? now : (Math.round((now - s) * 1000) / 1000) + ' ' + s;
}

JSProfiler.prototype.start = function (msg) {
    this.t[msg] = this.microtime(true);
};

JSProfiler.prototype.compute = function (msg) {
    var dt = this.microtime(true) - this.t[msg];
    //dt = dt * this.scale;
    if ( this.active ) { console.log(msg+" "+dt); }
};

JSProfiler.prototype.stop = function () {
    throw "stop";
};

var JSP = new JSProfiler();
