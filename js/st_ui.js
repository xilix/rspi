if (st === undefined) {
    var st = [];
}

// Module for canvas draw classes
// canvas Unit Processing. The angulat ui controller
// have the rol of the Control unit.
var cnvsUP = (function(cnvsUP) {
    function Cutter(idCnvsImg)
    {
        var that = this;

        this.cnvsImg = {
            "dom": document.getElementById(idCnvsImg),
            "ctx": null
        }
        this.cnvsImg.ctx = this.cnvsImg.dom.getContext("2d");

        this.img = '';
        this.name = '';
        this.cut = null;

        this.resizeCut = function (img, nom, cut) {
            if (typeof cut !== "undefined") {
                if (!cut.orient) {
                    $("#"+idCnvsImg)
                        .attr("width", cut.width * (cut.frames.end - cut.frames.begin))
                        .attr("height", cut.height);
                } else {
                    $("#"+idCnvsImg)
                        .attr("width", cut.width)
                        .attr("height", cut.height * (cut.frames.end - cut.frames.begin));
                }
            }

            this.nom = nom;
            this.cut = cut;

            this.img = new Image();
            this.img.onload = function () {
                that.snap();
            };
            this.img.src = img;
        }
        this.snap = function () {
            var dato;
            if (!this.cut.orient) {
                this.cnvsImg.ctx.drawImage(
                    this.img, 
                    -this.cut.offset.x + this.cut.width * this.cut.frames.begin,
                    -this.cut.offset.y
                );
            } else {
                this.cnvsImg.ctx.drawImage(
                    this.img, 
                    -this.cut.offset.x, 
                    -this.cut.offset.y + this.cut.height * this.cut.frames.begin
                );
            }

            document.location.href = this.cnvsImg.dom.
                                        toDataURL("image/png").
                                        replace("image/png", "image/octet-stream");
        }

    }
    // Singletton for any canvas
    cnvsUP.snapCutters = [];
    cnvsUP.getCut = function (canvasId) {
        if (typeof canvasId === "undefined") { canvasId = 'cutCanvas'; }
        if (typeof cnvsUP.snapCutters[canvasId] === "undefined") {
            cnvsUP.snapCutters[canvasId] = new Cutter(canvasId);
        }
        return cnvsUP.snapCutters[canvasId];
    }


    function SpriteSheet(img)
    {
        this.id = img;
        this.isLoaded = false;

        this.set = function (img) {
            this.isLoaded = false;
            try {
                PXE.Els.remove(this.id);
                if (init) {jaws.game_loop.stop();}
                //PXE.jaws.cache.clear();

                jaws.assets.clear();
                jaws.assets.add(img);
                var state = new st['ui']['general-state'];
                state.img = img;
                jaws.start(state);

                if (jaws.assets.data.lenght > 0) {
                    this.isLoaded = true;
                }
            } catch (e) {
                console.log(img + " not found");
            }
        };
    }
    cnvsUP.sprtSheet = new SpriteSheet();

    return cnvsUP;
})({});


var init = false;

st["ui"] = [];
st["ui"] = {
    "general-state" : function () {
        this.ctx = $('#draw');
        this.img = null;
        this.posBack = {x:0,y:0};

        this.setup = function() {
            if (this.img !== null) {
                try {
                    cnvsUP.sprtSheet.id = PXE.Layers.add(
                        0,PXE.jaws.addSprite(
                            {
                                frame_size: [9999,9999],
                                image: this.img
                            },{x:0,y:0}
                        )
                    ); 
                    angMsg.send("imgLoaded", true);          
                } catch(e) {
                    angMsg.send("imgLoaded", false);          
                }
            }
            this.posBack = {x:0,y:0};
            init = true;
        };

        var cacheFrame = 25;
        var dt = 1;
        this.update = function() {

            if(!isNaN(jaws.game_loop.fps) && jaws.game_loop.fps>=1)
                cacheFrame = jaws.game_loop.fps;

            dt = 1/cacheFrame;
            if (init) {
                PXE.Layers.run(dt);
                // controles
                if(PXE.ui.fun.ctrlKey){
                    if (jaws.pressed("left")) {
                        angMsg.send("cut.size", {"x": -1, "y": 0});
                    } else if (jaws.pressed("right")) {
                        angMsg.send("cut.size", {"x": 1, "y": 0});
                    } else if (jaws.pressed("up")) {
                        angMsg.send("cut.size", {"x": 0, "y": -1});
                    } else if (jaws.pressed("down")) {
                        angMsg.send("cut.size", {"x": 0, "y": 1});
                    } 
                //} else if(PXE.ui.fun.shiftKey) {
                } else if (jaws.pressed("left_mouse_button")) { 
                    angMsg.send("dragCut",{
                        "x": jaws.mouse_x, 
                        "y": jaws.mouse_y
                    });
                    this.ctx.attr("class", "canvas-dragging");
                } else if (jaws.pressed("right_mouse_button")) { 
                    angMsg.send("backOffset.x",jaws.mouse_x);
                    angMsg.send("backOffset.y",jaws.mouse_y);
                    this.ctx.attr("class", "canvas-moving");
                } else if (jaws.pressed("left")) {
                    angMsg.send("cut.offset", {"x": -1, "y": 0});
                } else if (jaws.pressed("right")) {
                    angMsg.send("cut.offset", {"x": 1, "y": 0});
                } else if (jaws.pressed("up")) {
                    angMsg.send("cut.offset", {"x": 0, "y": -1});
                } else if (jaws.pressed("down")) {
                    angMsg.send("cut.offset", {"x": 0, "y": 1});
                } else if (jaws.pressed("a")) {
                    angMsg.send("backOffset", {"x": -1, "y": 0});
                } else if (jaws.pressed("d")) {
                    angMsg.send("backOffset", {"x": 1, "y": 0});
                } else if (jaws.pressed("w")) {
                    angMsg.send("backOffset", {"x": 0, "y": -1});
                } else if (jaws.pressed("s")) {
                    angMsg.send("backOffset", {"x": 0, "y": 1});
                } else {
                    this.ctx.attr("class", "canvas-move");
                }
            }
        }

        this.draw = function() {
            jaws.clear();
            if(init){
                PXE.Layers.draw();
           }
        }
    }
};
