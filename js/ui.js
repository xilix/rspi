function uiControl($scope,$compile) {
    var defCut = {
            "width" : 32,
            "height" : 32,
            "offset" : {
                "x" : 0,
                "y" : 0
            },
            "frames" : {
                "begin" : 0,
                "end" : 1 
            },
            "time" : 100,
            "orient" : false,
            "data" : ""
        }, defCutCompress = cutCompress(defCut),
        cut = null, grid = null, back = null,
        anim = null, error = [];


   

    $scope.spriteSheetUrl = 'img/Sprites.png';
    $scope.macroPixel = '';
    $scope.imgLoaded = null;
    $scope.pantalla = 0;
    $scope.backOffset = {};
    $scope.comment= '';
    $scope.nom = '';
    $scope.backOffset.mouse = {"x":0,"y":0};
    $scope.backOffset.back = {"x":0,"y":0};
    $scope.zoom = 1;
    $scope.cut = {
        "width" : "",
        "height" : "",
        "offset" : {
            "x" : "",
            "y" : ""
        },
        "frames" : {
            "begin" : "",
            "end" : ""
        },
        "time" : "",
        "orient" : false,
        "data" : ""
    };

    function cutCompress(cut, name){
        return {
            "n": (typeof name !== "undefined" ? name : ""),
            "d": {
                "w": cut.width,
                "h": cut.height,
                "o":{
                    "x": cut.offset.x,
                    "y": cut.offset.y
                },
                "or": (cut.orient ? "right" : "down"),
                "f":{
                    "b": cut.frames.begin,
                    "e": cut.frames.end
                },
                "t": cut.time
            }
        };
    }

    function resetBackOffset () {
        $scope.backOffset.mouse = {"x":0,"y":0};
        $scope.backOffset.back = {"x":0,"y":0};
    }
    resetBackOffset();

    function changeData () {
        var str = '{"n":"'+ $scope.nom;
        str += '","d":{"w":' + isNumberIfNotDef(
            $scope.cut.width, defCut.width
        );
        str += ',"h":' + isNumberIfNotDef($scope.cut.height, defCut.height);
        str += ',"o":{';
        str += '"x":' + isNumberIfNotDef($scope.cut.offset.x, defCut.offset.x);
        str += ',"y":' + isNumberIfNotDef(
            $scope.cut.offset.y, defCut.offset.y
        );
        str += '},"or":"' + orientation();
        str += '","f":{';
        str += '"b":' + isNumberIfNotDef(
            $scope.cut.frames.begin, 
            defCut.frames.begin
        );
        str += ',"e":' + isNumberIfNotDef(
            $scope.cut.frames.end, 
            defCut.frames.end
        );
        str += '},"t":' + isNumberIfNotDef($scope.cut.time, defCut.time);
        str += '}},';

        if ($scope.comment !== "") {
            str += " // "+$scope.comment;
        }
        $scope.cut.data = str;
    }

    function getData (val) {
        try {
            var d = val, comment = [];
            d = d.split(" // ");
            d = d[0].slice(0, d[0].length - 1);
            d = JSON.parse(d);
        } catch (e) {
            if (val === "") {
                d = cutCompress(defCut, $scope.name);
            } else {
                console.log("WARNING: data format not valid");
                safeApply(function(){
                    error["data"] = true;
                });
                return false;
            }
        }

        safeApply(function(){
            error["data"] = false;
        });

        $scope.nom = d.n;
        $scope.cut.width = isNumberIfNotDef(d.d.w, $scope.cut.width);
        $scope.cut.height = isNumberIfNotDef(d.d.h, $scope.cut.height);
        $scope.cut.offset.x = isNumberIfNotDef(d.d.o.x, $scope.cut.offset.x);
        $scope.cut.offset.y = isNumberIfNotDef(d.d.o.y, $scope.cut.offset.y);
        $scope.cut.orient = isNumberIfNotDef(d.d.or, $scope.cut.orient);
        $scope.cut.frames.begin = isNumberIfNotDef(
            d.d.f.b, $scope.cut.frames.begin
        );
        $scope.cut.frames.end = isNumberIfNotDef(
            d.d.f.e, $scope.cut.frames.end
        );
        $scope.cut.time = isNumberIfNotDef(d.d.t, $scope.cut.time)

        d = val.split(" // ");
        if(d.length > 1) {
            comment = d.slice(1, d.length).join(" // ");
            if (comment !== $scope.comment) { $scope.comment = comment; }
        }

    }

    function swapPantalla (val) {
        resetCut();
    }

    function orientation() {
        return ($scope.cut.orient ? "down" : "right");
    }

    $scope.$watch('cut.data', function (val) {
        getData(val);
    });

    $scope.$watch('nom', function (val) {
        changeData(); 
    });
    $scope.$watch('comment', function (val) {
        changeData();
    });

    $scope.$watch('pantalla', function (val) {
        swapPantalla(val); 
    });

    $scope.$watch('cut.orient', function (val) {
        reallocateCutOffsets();
        resetCut();
    });

    $scope.$watch('cut.width', function (val) {
        if ($scope.cut.width < 0) { $scope.cut.width = 0; }
        updateCut('width');
    });

    $scope.$watch('cut.height', function (val) {
        if ($scope.cut.height < 0) { $scope.cut.height = 0; }
        updateCut('height');
    });

    $scope.$watch('cut.offset.x', function (val) {
        reallocateCutOffsets();
        updateCut('offset.x'); 
    });

    $scope.$watch('cut.offset.y', function (val) {
        reallocateCutOffsets();
        updateCut('offset.y');
    });

    $scope.$watch('cut.time', function (val) {
        resetCut();
    });

    $scope.$watch('cut.frames.begin', function (val) {
        resetCut();
    });

    $scope.$watch('cut.frames.end', function (val) {
       resetCut();
    });

    $scope.$watch('macroPixel', function (val) {
        updateCut('macroPixel');    
    });

    $scope.$watch('backOffset.back.x', function (val) {
        resetCut();
    });

    $scope.$watch('backOffset.back.y', function (val) {
        resetCut();
    });

    $scope.$watch('imgLoaded', function (val) {
       resetCut();
       swapPantalla($scope.pantalla);
    });

    $scope.$watch('spriteSheetUrl', function (ara, abans) {
       cnvsUP.sprtSheet.set(ara);
       $scope.setImgLoaded(cnvsUP.sprtSheet.isLoaded);
    });

    $scope.$watch('zoom', function (val) {
        $scope.zoom = parseInt(val);
        $scope.backOffset.back.x = - $scope.cut.offset.x + 2 * Math.max(
            1, isNumberIfNotDef($scope.macroPixel, 1)
        );
        $scope.backOffset.back.y = - $scope.cut.offset.y + 2 * Math.max(
            1, isNumberIfNotDef($scope.macroPixel, 1)
        );
        resetCut();
    });

    $scope.setImgLoaded = function (value) {
        resetBackOffset();
        safeApply(function () {
            $scope.imgLoaded = value;
        });
    };

    $scope.setPantalla = function (value) {
        safeApply(function () {
            $scope.pantalla = value;
        });
        
    };

    $scope.cutMe = function (value) {
        var begin = isNumberIfNotDef($scope.cut.frames.begin, defCut.frames.begin),
            end = isNumberIfNotDef($scope.cut.frames.end, defCut.frames.end);

        cnvsUP.getCut().resizeCut(
            $scope.spriteSheetUrl,
            $scope.nom,
            $scope.cut
        );
    };


    $scope.setBackOffset = function (value) {
        safeApply(function () {
            $scope.backOffset.back.x = $scope.backOffset.back.x + value.x;
            $scope.backOffset.back.y = $scope.backOffset.back.y + value.y;
        });
    };

    $scope.setBackOffsetX = function (value) {
        if ($scope.pantalla === 0) {
            safeApply(function () {
                var d = (value -  $scope.backOffset.mouse.x) / $scope.zoom;
                if (15 < d) { d = 15; };
                if (d < -15) { d = -15; }
                $scope.backOffset.back.x += d;
                $scope.backOffset.mouse.x = value;
            });
        }
    };

    $scope.setBackOffsetY = function (value) {
        if ($scope.pantalla === 0) {
            safeApply(function () {
                var d = (value -  $scope.backOffset.mouse.y) / $scope.zoom;
                if (15 < d) { d = 15; };
                if (d < -15) { d = -15; }
                $scope.backOffset.back.y += d; 
                $scope.backOffset.mouse.y = value;
            });
        }
    };

    function _dragCutPos(val, typ, backOff){
        return Math.round(
            (
                macroPxRound(val)
                - isNumberIfNotDef($scope.cut[typ], defCut[typ])
            ) / $scope.zoom) - $scope.backOffset.back[backOff];
    }

    $scope.setSize = function (pos) {
        safeApply(function () {
            $scope.cut.width = isNumberIfNotDef(
                $scope.cut.width, defCut.width
            ) + pos.x;
            $scope.cut.height = isNumberIfNotDef(
                $scope.cut.height, defCut.height
            ) + pos.y;
        });
    };

    $scope.setOffset = function (pos) {
        safeApply(function () {
            $scope.cut.offset.x = isNumberIfNotDef(
                $scope.cut.offset.x, defCut.offset.x
            ) + pos.x;
            $scope.cut.offset.y = isNumberIfNotDef(
                $scope.cut.offset.y, defCut.offset.y
            ) + pos.y;
        });
    };

    $scope.dragCut = function (pos) {
        if ($scope.pantalla === 0) {
            safeApply(function () {
                $scope.cut.offset.x = _dragCutPos(pos.x, "width", "x");
                $scope.cut.offset.y = _dragCutPos(pos.y, "height", "y");
            });
        }
    }

    $scope.isloaded = function () {
        if ($scope.imgLoaded === null) { return ''; }
        if ($scope.imgLoaded) {
            return 'has-success';
        } else {
            return 'has-error';
        }
    };

    $scope.isDataOk = function () {
        if (
            typeof error["data"] === "undefined" || error["data"]  === null
        ) {
            return '';
        }
        if (!error["data"]) {
            return 'alert-success';
        } else {
            return 'alert-danger';
        }
    };

    function reallocateCutOffsets () {
        if (
            $scope.cut.offset.x < 0 && orientation() === "down"
        ) { $scope.cut.offset.x = 0; }
        if (
            $scope.cut.offset.y < 0 && orientation() !== "down"
        ) { $scope.cut.offset.y = 0; }
    }

    function updateCut (t) {
        switch (t) {
            case "offset.x":
                $scope.cut.offset.x = macroPxRoundThr($scope.cut.offset.x);
                break;
            case "offset.y":
                $scope.cut.offset.y = macroPxRoundThr($scope.cut.offset.y);
                break;
            case "macroPixel":
                /*$scope.cut.width = macroPxRoundThr($scope.cut.width);
                $scope.cut.height = macroPxRoundThr($scope.cut.height);
                $scope.cut.offset.x = macroPxRoundThr($scope.cut.offset.x);
                $scope.cut.offset.y = macroPxRoundThr($scope.cut.offset.y);*/
                break;
            default:
                $scope.cut[t] = macroPxRoundThr($scope.cut[t]);
        }
        resetCut();
    }

    /**
     * @require : threshold is a number or a number string
     */
    function thresholdFilter (val, expect) {
        var d = (val - expect);
        var threshold = $scope.macroPixel;

        if (!angular.isNumber(threshold)) { threshold = parseInt(threshold); }
        if (isNaN(threshold)) { return val; }
        if (Math.abs(val) < threshold) { return val; }
        if (Math.abs(d) > threshold) {
            return expect;
        } else if (d > 0) {
            return Math.ceil(val / threshold) * threshold;
        } else if (d < 0) {
            return Math.floor(val / threshold) * threshold;
        } else {
            return val;
        }
    }
 
    function macroPxRoundThr (val) {
        var roundVar = macroPxRound(val);// For variable checking
        return thresholdFilter(
            val,
            roundVar
        );
    }

    function macroPxRound (val) {
        var macroP;
        val = parseInt(val);

        if (!angular.isNumber($scope.macroPixel)) {
            $scope.macroPixel = parseInt($scope.macroPixel); 
        }
        if (
            !angular.isNumber($scope.macroPixel) ||
            isNaN($scope.macroPixel) ||
            $scope.macroPixel <= 0 ||
            !angular.isNumber(val) ||
            isNaN(val)
        ) { 
            return val; 
        }
        macroP = $scope.macroPixel;

        return Math.round(val / macroP) * macroP;
    }
    function isNumberIfNotDef(numero, def){
        if (
            !angular.isNumber(numero) ||
            isNaN(numero)
        ) {
            return def;
        }
        return numero
    }

    // TODO: Put this method in the cnvsUP module. Inside the controller
    //       shuldn't be anything related to the PXE engine. The cvnsUP
    //       implements the interface.
    function resetGrid () {
        var step = $scope.macroPixel;
        if (grid !== null) { PXE.Els.get(grid).remove(); }
        grid = null;

        if (
            angular.isNumber($scope.macroPixel) &&
            !isNaN($scope.macroPixel)
        ) {
            if ($scope.macroPixel < 9) {
                step = 9;
            }

            grid = PXE.Layers.add(
                1,
                PXE.newElem(
                    new Grid(
                        step*$scope.zoom 
                    )
                )
            );
            PXE.Els.get(grid).name = "grid";
        }
    }
    function resetCut () {
        var i = $scope.cut.frames.begin, iMax = $scope.cut.frames.end, idSubCut,
            z = $scope.zoom, w = $scope.cut.width, h = $scope.cut.height,
            off = {
                "x" : $scope.cut.offset.x,
                "y" : $scope.cut.offset.y
            }, t = $scope.cut.time, 
            bx = $scope.backOffset.back.x, by = $scope.backOffset.back.y;

        if (cut !== null) { PXE.Els.get(cut).remove(); }
        if (anim !== null) { PXE.Els.get(anim).remove(); }
        if (back !== null) { PXE.Els.get(back).remove(); }
        anim = null;
        cut = null;
        back = null;

        iMax = isNumberIfNotDef(iMax, defCut.frames.end);
        if (iMax < 1) { iMax = defCut.frames.end; }
        i = isNumberIfNotDef(i, defCut.frames.begin);
        w = isNumberIfNotDef(w, defCut.width);
        h = isNumberIfNotDef(h, defCut.height);
        off.x = isNumberIfNotDef(off.x, defCut.offset.x);
        off.y = isNumberIfNotDef(off.y, defCut.offset.y);
        t = isNumberIfNotDef(t, defCut.time);

        if ($scope.imgLoaded) {
            PXE.Els.get(cnvsUP.sprtSheet.id).moveTo(bx * z, by * z);
            PXE.Els.get(cnvsUP.sprtSheet.id).scaleTo(z);
        }

        if ($scope.pantalla > 0) {
            back = PXE.Layers.add(
                5,
                PXE.newElem(new Ion(0, 0, 2000, 2000, "#FFFFFF"))
            );

            anim = PXE.Layers.add(10,
                PXE.jaws.addSprite(
                    {
                        "sprite_sheet" : $scope.spriteSheetUrl, 
                        "frame_size" : [w, h],
                        "frame_duration" : t,
                        "offset" : {"x":off.x, "y":off.y},
                        "orientation" : orientation() 
                    },
                    {x:25, y:25, ind: {"begin": i, "end": iMax}}
                )
            );
            PXE.Els.get(anim).addAnim("cut");
            PXE.Els.get(anim).states.add("cut",{
                "run" :  function () {
                    this.ctx.runAnim("cut");
                },
            });
            PXE.Els.get(anim).states.jump("cut");
        } else {
            if ($scope.cut.orient) {
                cut = PXE.Layers.add(10,
                    PXE.newElem(new Box(
                        off.x * z + bx * z, off.y * z + by * z, 
                        w * z, h * z, "#FF2211"
                    ))
                );
                for (; i < iMax; i += 1){
                    idSubCut = PXE.Els.add(
                        PXE.newElem(new Box(0, 0, w * z, h * z, "#77EE33"))
                    );       

                    PXE.Els.get(cut).addConnection(idSubCut,{
                        pos: {x : 0, y : i * h * z},
                        z : -1
                    });
                }
                PXE.Els.get(cut).name = "cutBox";
            } else {
                cut = PXE.Layers.add(10,
                    PXE.newElem(new Box(
                        off.x * z + bx * z, off.y * z + by * z, 
                        w * z, h * z, "#FF2211"
                    ))
                );
                for (; i < iMax; i += 1){
                    idSubCut = PXE.Els.add(
                        PXE.newElem(new Box(0, 0, w * z, h * z, "#77EE33"))
                    );       

                    PXE.Els.get(cut).addConnection(idSubCut,{
                        pos: {x : i * w * z, y : 0},
                        z : -1
                    });
                }
                PXE.Els.get(cut).name = "cutBox";
            }
        }

        resetGrid();
        changeData();
    }

    function safeApply (fn) {
        ($scope.$$phase || $scope.$root.$$phase) ? fn() : $scope.$apply(fn);
    }

}

var rspi= angular.module('rspi', []);

rspi.controller(
    'uiControl', 
    [
        '$scope',
        '$compile',
        uiControl
    ]
); 

function AngMsg(DOMcontroller) {
    this.DOMcontroller = document.getElementsByTagName(DOMcontroller);
    this.scope = null; 

    this.init = function () {
        this.DOMcontroller = document.getElementsByTagName(DOMcontroller);
        this.scope = angular.element(this.DOMcontroller).scope();
    }

    this.send = function (channel, msg) {
        if (this.scope === null) { this.init(); };
        switch (channel) {
            case "imgLoaded":
                this.scope.setImgLoaded(msg);
            break;
            case "pantalla":
                this.scope.setPantalla(msg);
            break;
            case "cut":
                this.scope.cutMe(1);
            break;
            case "cut.size":
                this.scope.setSize(msg);
            break;
            case "cut.offset":
                this.scope.setOffset(msg);
            break;
            case "backOffset":
                this.scope.setBackOffset(msg);
            break;
            case "backOffset.x":
                this.scope.setBackOffsetX(msg);
            break;
            case "backOffset.y":
                this.scope.setBackOffsetY(msg);
            break;
            case "dragCut":
                this.scope.dragCut(msg);
            break;
        }
    };
}
var angMsg = new AngMsg("body");

