function panel (x, y, z) {
    this.value = 0;
    this._val = [0,0];
    this.type = "esbirro";
    this.x = scl(x);
    this.y = scl(y);
    this.z = z;
    
    this.ids = {
    };
    // Colosio de sub elements
    this.cols = {
        "left_mouse_button" : []
    };
    // Coloisio per events (generals del panell)
    this.colides = [];
    
    var panel = this;

    this.addelm = function (typ, x, y, z, idcod, col) {
        if ( idcod === undefined ) { idcod = typ; }
        var id = PXE.Layers.add(
            z, PXE.jaws.addSprite(
                {
                    sprite_sheet: st.combat.assets.sprt.general ,
                    frame_size: [scl(cuts.UI[0][typ].w), scl(cuts.UI[0][typ].h)],
                    frame_duration: cuts.UI[0][typ].t,
                    offset: scl(cuts.UI[0][typ].off),
                    orientation: cuts.UI[0][typ].orientation
                },
                {
                    x: x,
                    y: y,
                    ind:cuts.UI[0][typ].ind
                }
            )
        );
        this.ids[idcod] = id;

        if ( col !== undefined ) {
            var x0 = x;
            var y0 = y;
            var x1 = x + scl(cuts.UI[0][typ].w);
            var y1 = y + scl(cuts.UI[0][typ].h);
            this.cols["left_mouse_button"].push(
                function(x, y) {
                    if(
                        x0 < x && x1 > x && y0 < y && y1 > y &&
                        PXE.Els.get(id).states.state !== "click"
                    ){
                        PXE.Els.get(id).jump("click");

                        panel.addValue(col);
                    }
                }
            );
        }
    };
    
    this.addValue = function (val) {
        panel.value += val;
        if( panel.value > 99 ) { panel.value = 99; }
        if( panel.value < 0 ) { panel.value = 0; }
        panel.resetDigits();
    };
    
    this.resetDigits = function () {
        this._val[1] = this.value % 10;
        this._val[0] = Math.floor((this.value - this._val[1]) / 10);

        PXE.Els.get( this.ids["digits1"] ).resetAnim("digits", this._val[1]);
        PXE.Els.get( this.ids["digits0"] ).resetAnim("digits", this._val[0]);       
    };
    
    this.addelm("panel", this.x, this.y + scl(15), this.z);
    
    this.addelm("digits", this.x + scl(71), this.y + scl(21), this.z, "digits0");
    PXE.Els.get( this.ids["digits0"] ).addAnim("digits");
    this.addelm("digits", this.x + scl(89), this.y + scl(21), this.z, "digits1");
    PXE.Els.get( this.ids["digits1"] ).addAnim("digits");

    this.addelm("btnup", this.x + scl(63), this.y, this.z, "btnup", 1);
    PXE.Els.get( this.ids["btnup"] ).addAnim("press");
    PXE.Els.get( this.ids["btnup"] ).states.add(
        "stop",
        {
            ini : function(){
                this.ctx.resetAnim("press",0);
            }
        }
    );

    PXE.Els.get( this.ids["btnup"] ).sound = [
        document.getElementById("sfx_click")
    ];
    PXE.Els.get( this.ids["btnup"] ).states.add(
        "click",
        {
            init : function(){
                this.temporRetorn = new Tempo(0.5);
            },
            ini : function(){
                this.increment = 1;
                this.ctx.resetAnim("press",1);
                this.temporRetorn.restart();
                this.ctx.sound[0].play();
            },
            run : function(t){
                this.temporRetorn.run(t);
                if(this.temporRetorn.ended){
                    if (!jaws.pressed("left_mouse_button")) {
                        this.ctx.jump("stop");
                    } else {
                        this.ctx.sound[0].play();
                        panel.addValue(this.increment);
                        if (this.increment < 5) { this.increment += this.increment; }
                        this.temporRetorn.restart();
                    }
                }
            }
        }
    );
    
    
    this.addelm("btndown", this.x + scl(63), this.y + scl(51), this.z, "btndown", -1);
    PXE.Els.get( this.ids["btndown"] ).addAnim("press");
    PXE.Els.get( this.ids["btndown"] ).states.add(
        "stop",
        {
            ini : function(){
                this.ctx.resetAnim("press",0);
            }
        }
    );

    PXE.Els.get( this.ids["btndown"] ).sound = [
        document.getElementById("sfx_click")
    ];
    PXE.Els.get( this.ids["btndown"] ).states.add(
        "click",
        {
            init : function(){
                this.temporRetorn = new Tempo(0.5);
            },
            ini : function(){
                this.increment = -1;
                this.ctx.resetAnim("press",1);
                this.temporRetorn.restart();
                this.ctx.sound[0].play();
            },
            run : function(t){
                this.temporRetorn.run(t);
                if(this.temporRetorn.ended){
                    if (!jaws.pressed("left_mouse_button")) {
                        this.ctx.jump("stop");
                    } else {
                        this.ctx.sound[0].play();
                        panel.addValue(this.increment);
                        if (this.increment > -5) { this.increment += this.increment; }
                        this.temporRetorn.restart();
                    }
                }
            }
        }
    );
    
    this.w = scl(63) + scl(cuts.UI[0]["btnup"].w);
    this.h = scl(51) + scl(cuts.UI[0]["btndown"].h);
    this._x = this.x + this.w;
    this._y = this.y + this.h;

    this._colidepanel = function(x, y) { return this.x < x && this._x > x && this.y < y && this._y > y; }

    this.colides["left_mouse_button"] = function (x, y) {
        // s'ha clicat dintre del recuadre
        if ( panel._colidepanel(x, y) ) {
            var i;
            // mirem si s'ha cicat a algun boto
            for(i = panel.colides["left_mouse_button"].length - 1; i >= 0; i -= 1) {
                panel.cols["left_mouse_button"][i](x, y);
            } 
        }
    };
    
    this.colide = function(event) {
        if( this.colides[event] !== undefined ){
            this.colides[event](jaws.mouse_x, jaws.mouse_y);
        }
    };
}

function Barramana(x, y, w, h, Max, Min, val, color, sprt) {
    var idGen = PXE.Els.add(sprt);

    var barra = PXE.Layers.add(
        9,
        PXE.newElem(new Barravida(
            w, h, Max, Min, val, color, "invers"
        ))
    );
    
    PXE.Els.get(barra).states.add("ion",{
        init : function(){
            this.tempo = new Tempo(0.1);
            
            var ctx = this.ctx;
            this.tempoRefill = new Tempo(0.5, function(){
                ctx.add(1);
            });
        },
        ini : function(){
            this.tempo.restart(0.1);
            this.tempoRefill.restart(0.5);
        },
        run : function (t) {
            this.tempoRefill.run(t);
            this.tempo.run(t);
            if(this.tempo.ended){
                var color, countMax = Math.floor(this.ctx.val*0.05);
                for(var i = 0; i < countMax; i++) {
                    color = Math.floor(155*Math.random())+100;
                    if (Math.random() > 0.7) { color = 255; }
                    particulaIonizada(
                        this.ctx.inv_x0, this.ctx.inv_y0, this.ctx.inv_x1-2, this.ctx.inv_y1-3,
                        "rgb("+color+","+color+","+color+")"
                    );
                }
                this.tempo.restart(0.2+Math.random()*0.5);
            }
        }
    });
    PXE.Els.get(barra).jump("ion");

    PXE.Els.get(barra).moveTo(x, y);
    PXE.Els.get(barra).setVal(val);

    PXE.Els.get(barra).addConnection(idGen,{
        pos: {
            x : PXE.Els.get(idGen).x,
            y : PXE.Els.get(idGen).y
        },
        z : -1
    });
    
    //PXE.Els.get(barra).addConnAnims("camina",idGen);
    return barra;
}

function particulaIonizada(x0,y0,x1,y1,color){
    var xw = Math.floor(Math.random()*(x1));
    var yh = y1;//Math.floor(Math.random()*(y1));
    var tt = 1+Math.random();

    ion = PXE.Layers.add(
        10,
        PXE.newElem(
            new Ion(x0+xw, y0+yh, 3, 3, color)
        )
    );
    PXE.Els.get(ion).states.add("ion",{
        init : function(){
            this.tempoUp = new Tempo(0.2);
        },
        ini : function(){
            this.tempoUp.restart(0.2);
        },
        run : function (t) {
            this.tempoUp.run(t);
            if(this.tempoUp.ended){
                this.ctx.move( (Math.random() < 0.5 ? -0.6 : 0.6) , -0.7 );
                if( this.ctx.y <= y0 || 
                    this.ctx.x < x0 || this.ctx.x > x0+x1
                ) {
                    PXE.Els.remove(this.ctx.id);
                }
            }
        }
    });
    PXE.Els.get(ion).jump("ion");
}

function Estela(x,y){
    idPare = PXE.Layers.add(6,new Guspira(x,y,1));
    
    PXE.Els.get(idPare).states.add("explota",{
        init : function(){
            this.tempo = new Tempo(0.05,function(){
                this.pars.color--;
            });
        },
        ini : function(){
            this.tempo.start();
            this.tempo.pars.color = 9;
            this.ctx.alpha = 0.8;
        },
        run : function(t){
            this.tempo.run(t);
            if(this.tempo.ended){
                if(this.tempo.pars.color<0){
                    PXE.Els.remove(this.ctx.id);
                } else {
                    this.ctx.color = "#"+this.tempo.pars.color+""+
                                        this.tempo.pars.color+"0000";
                    this.ctx.move(Math.random()*4-2,-Math.random()*7);
                    this.tempo.ended = false;
                }
            }
        }
    });
    PXE.Els.get(idPare).nom = "estela";
    PXE.Els.get(idPare).jump("explota");
}

function Explota(x,y,tipo){
    if(tipo==undefined) tipo = 0;
    var pars = cuts["conjurs"][0]["explosio"];
    
    idPare = PXE.Layers.add(10,
        PXE.jaws.addSprite(
            {
                sprite_sheet: st.combat.assets.sprt.general ,
                frame_size: [pars.w,pars.h],
                frame_duration: pars.t,
                offset: pars.off,
                orientation: "center"
            },{x:x,y:y,ind:pars.ind,anchor:"center"}
        )
    );
    PXE.Els.get(idPare).nom = "explota";
    PXE.Els.get(idPare).groups = {
        "conjur" : [
            {
                "nom" : "bola",
                "accio" : "DD",// Driect Damage
                "D" : 30,
                "rad" : 36,
                "x" : x,
                "y" : y
            }
        ]
    };
    PXE.Els.get(idPare).addAnim("explota");
    PXE.Els.get(idPare).sound = [
        document.getElementById("sfx_kabum")
    ];

    PXE.Els.get(idPare).states.add("explota",{
        ini : function(){
            this.ctx.sound[0].play();

            var cell = groups.soldats.first;
            for (   ; groups.soldats.holder[cell].next !== null;
                    cell = groups.soldats.holder[cell].next)
            {
                PXE.Els.get(groups.soldats.holder[cell].d).interaction(
                    this.ctx.groups,
                    this.ctx
                );
            }
        },
        run : function(t){
            this.ctx.runAnim("explota");
            if(this.ctx.anims["explota"].d["self"].index ==6){
                PXE.Els.remove(this.ctx.id);
            }
        }
    });
    PXE.Els.get(idPare).jump("explota");
}

function Bola(x,y,xMa,yMa,tipo){
    if(tipo==undefined) tipo = "bolagran";

    var pars = cuts["conjurs"][0][tipo];

    xMa += pars.x;
    yMa += pars.y;

    idPare = PXE.Layers.add(10,
        PXE.jaws.addSprite(
            {
                sprite_sheet: st.combat.assets.sprt.general ,
                frame_size: [pars.w,pars.h],
                frame_duration: pars.t,
                offset: pars.off,
                orientation: "center"
            },{x:xMa,y:yMa,ind:pars.ind,anchor:"center"}
        )
    );
    PXE.Els.get(idPare).addAnim("vola");
    PXE.Els.get(idPare).nom = "bola";

    PXE.Els.get(idPare).states.add("vola",{
        init : function(){
            this.x = x;
            this.y = y;
            this.vU = PXE.math.e2D.getVectU(
                new PXE.math.e2DPoint(xMa,yMa),
                new PXE.math.e2DPoint(x,y)
            );
            this.dist = PXE.math.e2D.dist;
            
            this.dV = pars.speed;
            this.vU.vx *= this.dV;
            this.vU.vy *= this.dV;
            this.dist *= this.dV;

            this.angle = PXE.math.e2D.getAngle(this.vU)*180/Math.PI-35;

            if(this.vU.vx<0) {
                this.ctx.flip();
                this.angle += 90;
                //this.angle += 180;
            }

            this.ctx.rotate(this.angle);
            
            this.temp = new Tempo(0.3);
            
            state_vola = this;
            
            this.tempFinal = new Tempo(5,function(){
                PXE.Els.remove(state_vola.ctx.id);
            });
        },
        ini : function(){
            this.tempFinal.start();
            this.temp.start();
        },
        run : function(t){
            this.ctx.move(this.vU.vx*t,this.vU.vy*t);
            this.ctx.runAnim("vola");
            
            this.tempFinal.run(t);
            this.temp.run(t);
            if(this.temp.ended){
                Estela(this.ctx.x+10,this.ctx.y+10);
                this.temp.ended = false;
            }

            if(
                (Math.abs(this.ctx.x-this.x) <= this.dV*t) || 
                (Math.abs(this.ctx.y-this.y) <= this.dV*t)
            ){
                this.ctx.jump("explota");
            }
        }
    });
    PXE.Els.get(idPare).states.add("explota",{
        init : function(){
            this.x = x;
            this.y = y;
        },
        ini : function(){
            Explota(this.x,this.y);
            PXE.Els.remove(this.ctx.id);
        }
    });
    PXE.Els.get(idPare).jump("vola");
}

function DimoniGran(){
    var dimoni = cuts["dimoni"];

    // Dimoni
    var cabeza = PXE.Els.add(
        PXE.jaws.addSprite(
            {
                sprite_sheet: st.combat.assets.sprt.general ,
                frame_size: [dimoni[1].w,dimoni[1].h],
                frame_duration: dimoni[1].t,
                offset: dimoni[1].off,
                orientation: "right"
            },{x:0,y:0,ind:dimoni[1].ind}
        )
    );
    PXE.Els.get(cabeza).addAnim("parla");
    PXE.Els.get(cabeza).nom = "Cap de mort";

    idDimoni = PXE.Layers.add(
       1,PXE.jaws.addSprite(
            {
                sprite_sheet: st.combat.assets.sprt.general ,
                frame_size: [dimoni[0].w,dimoni[0].h],
                frame_duration: dimoni[0].t,
                offset: dimoni[0].off,
                orientation: "right"
            },{x:dimoni[0].x,y:dimoni[0].y,ind:dimoni[0].ind}
        )
    );
    PXE.Els.get(idDimoni).addAnim("dispara");
    PXE.Els.get(idDimoni).addConnection(cabeza,{
        pos: {
            x: dimoni[1].x,
            y: dimoni[1].y
        },
        anims : [
            "parla"
        ]
    });

    PXE.Els.get(idDimoni).sound = [
        document.getElementById("sfx_shoot")
    ];

    // estats
    PXE.Els.get(idDimoni).states.add(
        "dispara",
        {
            ini : function(){
                this.first = true;
                this.ctx.sound[0].play();
            },
            run : function(){
                this.ctx.runAnim("dispara");
                if(this.ctx.anims["dispara"].d["self"].index > 0 && this.first){
                    PXE.Els.get(mana).add(-15);
                    Bola(
                        jaws.mouse_x,jaws.mouse_y,
                        this.ctx.x,this.ctx.y,
                        "bolagran"
                    );
                    this.first = false;
                }
                if(this.ctx.anims["main"].d["self"].index == 0 && !this.first){
                    this.ctx.jump("quiet");
                }
            }
        }
    );
    PXE.Els.get(idDimoni).states.add(
        "parla",
        {
            ini: function() {
                this.tempo = new Tempo(5);
                this.tempo.restart();
                this.ctx.resetAnim("parla");
            },
            run: function(t) {
                this.ctx.runAnim("parla");

                this.tempo.run(t);
                if(this.tempo.ended){
                    this.ctx.jump("quiet");
                }
            }                     
        }
    );
    PXE.Els.get(idDimoni).states.add(
        "quiet",
        {
            ini : function(ctx){
                this.ctx.resetAnim("main");
                this.ctx.restartAnim("main");
            }
        }
    );
    PXE.Els.get(idDimoni).states.jump("quiet");
    PXE.Els.get(idDimoni).nom = "Dimoni pelut";
    
    return idDimoni;
}

function Cadaver(x,y){
    var data = cuts["soldats"][0]["cremat"];

    var sprt = PXE.jaws.addSprite(
        {
            sprite_sheet: st.combat.assets.sprt.general ,
            frame_size: [data.w,data.h],
            frame_duration: data.t,
            offset: data.off,
            orientation: "right"
        },{x:(x+data.x),y:(y+data.y),ind:{begin:data.ind.begin,end:data.ind.end}}
    );
    sprt.addAnim("main");

    sprt.states.add(
        "main",
        {
            ini : function(){
            },
            out : function(){
            },
            run : function(){
                this.ctx.runAnim("main");
                
                if(this.ctx.anims["main"].d["self"].atLastFrame()){
                    this.ctx.states.jump("pols");
                }
            }
        }
    );
    sprt.states.add(
        "pols",
        {
            ini : function(){
                this.tempo = new Tempo(3,function(){
                    PXE.Els.remove(this.pars.id);
                });
                this.tempo.pars.id = this.ctx.id;
                this.tempo.start();
            },
            run : function(t){
                this.tempo.run(t);
            }
        }
    );

    sprt.states.jump("main");
    return sprt;
}

function soldat(combo,x,y,z){
    var pars = cuts["soldats"][0]["espera"];
    var idPare=null,idAttach=null;

    idPare = PXE.Layers.add( 
        z,
        PXE.jaws.addSprite(
            {
                sprite_sheet: st.combat.assets.sprt.general ,
                frame_size: [pars.w,pars.h],
                frame_duration: pars.t,
                offset: pars.off,
                orientation: "center"
            },
            {x:x,y:y,ind:pars.ind}
        )
    );
    
    PXE.Els.get(idPare).ficha = copyFicha(
        st.combat.gamesPars.soldats.legionari
    );
    PXE.Els.get(idPare).nom = "soldat";
    PXE.Els.get(idPare).addAnim("espera");
    PXE.Els.get(idPare).states.add(
        "espera",
        {
            init : function(){
                var state_defensa = this.ctx;

                this.tempo = new Tempo(0.5,function(){
                    state_defensa.LifeBar.add(state_defensa.ficha.regen);
                });
            },
            ini : function(){
                this.ctx.resetAnim("espera");
                this.tempo.restart();
            },
            run : function(t) {
                this.tempo.run(t);
            }
        }
    );
 
    pars = cuts["soldats"][0]["defensa"];
    PXE.jaws.setAnimImg(
        PXE.Els.get(idPare), "defensa",
        {
            sprite_sheet: st.combat.assets.sprt.general ,
            frame_size: [pars.w,pars.h],
            frame_duration: pars.t,
            offset: pars.off,
            orientation: "center"
        },
        {x:x,y:y,ind:pars.ind }
    );

    PXE.Els.get(idPare).states.add(
        "defensa",
        {
            init : function(){
                var state_defensa = this.ctx;

                this.tempo = new Tempo(1,function(){
                    state_defensa.jump("espera");
                });
            },
            ini : function(){
                this.ctx.resetAnim("defensa");
                sound("def");

                this.tempo.restart();
                this.ctx.LifeBar.add(this.ctx.ficha.regen*2);
            },
            run : function(t){
                this.tempo.run(t);
            }
        }
    );

    // barra de vida
    idVida = PXE.Els.add(
        PXE.newElem(
            new Barravida(  
                35,4,
                PXE.Els.get(idPare).ficha.life,0,
                PXE.Els.get(idPare).ficha.life
            )
        )
    );
    
    PXE.Els.get(idPare).addConnection( idVida, {
        pos: {
            x : 5,
            y : -15
        },
        z : 2
    });
    PXE.Els.get(idPare).moveTo(x,y);
    PXE.Els.get(idPare).LifeBar = PXE.Els.get(idVida);
    
    
    PXE.Els.get(idPare).jump("espera");

    PXE.Els.get(idPare).interaction = function (grp, actor) {
        var jo = PXE.Els.get(idPare), i, iMax;
        
        if ( grp.conjur !== undefined ) {
            iMax = grp.conjur.length;
            for(i = 0; i < iMax; i += 1) {
                accio(grp.conjur[i], PXE.Els.get(idPare));
            }
        }
    };

    return idPare;
}

function copyFicha(ficha) {
    return {
        "life" : ficha.life,
        "regen" : ficha.regen,
        "armour" : ficha.armour,
        "def" : {
            "P" : ficha.def.P,
            "D" : ficha.def.D
        },
        "special" : {
            "testudo" : ficha.special.testudo
        }
    };
}

function sound(sound){
    document.getElementById("sfx_"+sound).play();
}

//******** Sistema de joc ******************//
var groups = {
    "soldats" : new PXE.Iterator(),
    "conjurs" : new PXE.Iterator()
};

function accio (pars, target) {
    switch(pars.accio) {
        case "DD"://mal directe
            if ( 
                Math.sqrt(Math.pow(target.x-pars.x,2) + Math.pow(target.y-pars.y,2))
                <= target.width + pars.rad
            ){
                var resultat = danyDircte(pars.D, target.ficha);

                target.LifeBar.add(-resultat.D);
                if( resultat.def ) {
                    target.jump("defensa");
                }
            }
            break;
    }
}

function danyDircte(dany,fichaDef){
    if( Object.prototype.toString.call( dany ) === '[object Array]' ) {
        dany = dany[0] + Math.floor((dany[1]-dany[0])*Math.random());
    }

    var mal = dany - fichaDef.armour;
    if ( Math.random() <= fichaDef.def.P ) {
        mal -= fichaDef.def.D;
        return {
            "D" : (mal < 0 ? 0 : mal),
            "def" : true
        };
    }
    return {
        "D" : (mal < 0 ? 0 : mal),
        "def" : false
    };
}
