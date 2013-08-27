if (st === undefined) {
    var st = [];
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
            //console.log(img + " not found");
        }
    };
}

var init = false;
var sprtSheet = new SpriteSheet();

st["ui"] = [];
st["ui"] = {
    "general-state" : function () {
        this.img = null;
        this.posBack = {x:0,y:0};

        this.setup = function() {
            if (this.img !== null) {
                try {
                    sprtSheet.id = PXE.Layers.add(
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
                if(jaws.pressed("left_mouse_button")){
                   if (PXE.ui.fun.shiftKey) {
                      angMsg.send("backOffset.x",jaws.mouse_x);
                      angMsg.send("backOffset.y",jaws.mouse_y);
                   } else {
                       angMsg.send("dragCut",{
                           "x": jaws.mouse_x, 
                           "y": jaws.mouse_y
                       });
                   }
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
