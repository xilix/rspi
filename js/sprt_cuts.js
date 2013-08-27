if (cuts === undefined) {
    var cuts = [];
}

cuts["dimoni"] = [
    {x:186,y:249,w:111,h:105,ind:{begin:0,end:3},t:400},// dimoni
    {x:24,y:-33,w:48,h:156-105,off:105,ind:{begin:0,end:2},t:300}// cap
];

cuts["esbirro"] = [];
cuts["esbirro"] = [
    {
        "camina" : {x:0,y:0,w:27,h:192-156,off:156,ind:{begin:0,end:4},t:100},
        "ataca" : {x:0,y:0,w:32,h:224-192,off:192,ind:{begin:0,end:2},t:100},
        "victoria" : {x:0,y:0,w:39,h:258-224,off:224,ind:{begin:0,end:2},t:100}
    }
];

cuts["soldats"] = [];
cuts["soldats"] = [
    {
        "ataca" : {x:0,y:0,w:44,h:297-258,off:258,ind:{begin:0,end:2},t:100},
        "defensa" : {x:0,y:0,w:44,h:336-297,off:297,ind:{begin:0,end:1},t:100},
        "espera" : {x:0,y:0,w:44,h:375-336,off:336,ind:{begin:0,end:1},t:100},
        "cremat" : {x:0,y:0,w:44,h:405-375,off:375,ind:{begin:0,end:7},t:100}
    }
];

cuts["conjurs"] = [];
cuts["conjurs"] = [
    {
        "explosio" : {x:0,y:0,w:72,h:483-405,off:405,ind:{begin:0,end:8},t:50},
        "bolapetita" : {x:0,y:0,w:42,h:513-483,off:483,ind:{begin:0,end:5},t:50,speed:420},
        "bolagran" : {x:105,y:24,w:45,h:552-513,off:513,ind:{begin:0,end:4},t:50,speed:280}
    }
];

cuts["UI"] = [];
cuts["UI"] = [
    {
        "digits" : {x:0,y:0,w:4*3,h:8*3,off:600,ind:{begin:0,end:10},t:50,orientation:"down"},
        "panel" : {x:0,y:0,w:664-612,h:38,off:612,ind:{begin:0,end:5},t:50,orientation:"down"},
        "btnleft" : {x:0,y:0,w:700-664,h:39,off:664,ind:{begin:0,end:2},t:50,orientation:"down"},
        "btnright" : {x:0,y:0,w:736-700,h:39,off:700,ind:{begin:0,end:2},t:50,orientation:"down"},
        "btnup" : {x:0,y:0,w:778-736,h:21,off:736,ind:{begin:0,end:2},t:50,orientation:"down"},
        "btndown" : {x:0,y:0,w:820-778,h:21,off:778,ind:{begin:0,end:2},t:50,orientation:"down"},
        "barramana" : {x:-12,y:-3,w:955-820,h:27,off:820,ind:{begin:0,end:1},t:50,orientation:"down"},
        "btnredo" : {x:0,y:0,w:1033-955,h:57,off:955,ind:{begin:0,end:2},t:50,orientation:"down"}
    }
];

function scl (val) {
    return val;
}



