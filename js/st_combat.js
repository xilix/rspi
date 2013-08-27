if (st === undefined) {
    var st = [];
}

var panels = [];
var mana = [];
var dimoni = null;
var soldats = [];

var countSpk = 0;

var pistas = [
    [162,381,930,381],
    [162-35,381+35,930-35,381+35],
    [162-70,381+70,930-70,381+70],
    [162-105,381+105,930-105,381+105]
];

st["combat"] = [];
st["combat"] = {
    "assets" : {
        "sprt" : {
            "fondo" : "img/Fondo.png",
            "general" : "img/Sprites.png"
        },
        "sound" : {
            "hit1" : "sfx/hit.ogg",
            "hit2" : "sfx/hit2.ogg",
            "def" : "sfx/click.ogg",
            "click" : "sfx/ARRP.ogg",
            "die" : "sfx/clickretro.ogg",
            "shoot" : "sfx/WHOOSH.ogg",
            "kabum" : "sfx/kabum.ogg",
            "end" : "sfx/laug.ogg"
        }
    },
    "gamesPars" : {
        "descrip" : {
            "soldats" : {
                "legionari" : [
                            "El legionari forma el gruix de les tropes d'infantería",
                            " de l'imperi. Protegits amb una armadura consitent i un gran",
                            " escut estan acostumats a exercir la funció d'enclusa.",
                            " Un regiment de leginaris es capaç de formar un mur d'escuts",
                            " impentrables per l'enemic."
                            ]
            },
            "habilitats" : {
                "testudo" : [
                            "Les tropes amb aquesta habilitat son capaces de desplegar",
                            " els seus escuts de tal manera que es protegeixin mutuament.",
                            " Una unitat amb l'habilitat de testudo suma la seva habilitat",
                            " de testudo a la protecció de totes les tropes adjaçents"
                            ]
            }
        },
        "soldats" : {
            "legionari" : {
                "idCut" : 0,
                "life" : 100,
                "regen" : 1,
                "armour" : 5,
                "def" : {
                    "P" : 0.5,
                    "D" : 5
                },
                "special" : {
                    "testudo" : 2
                }
            }
        },
        "conjurs" : {
            "boladefoc" : {
                "idCut" : 0,
                "D" : 30,
                "speed" : 300
            }
        },
        "speaks" : [
            "Mana! necesiot más mana!!!",
            "Maldición! otra vez el mana!",
            "Los soldados estan allí pero no los puedo matar",
            "Empiezo a pensar que no hay manera",
            "Encima ahora se ponen a hacerme calvos a lo braveheart",
            "ARGGGGHHHHH!!!!!!",
            "Cuando coga al diseñador grafico lo voy a colgar por los pelillos de la barba!!!",
            "Cuando coga al programador lo voy a mater dentro de un bucle infinito!!!",
            "Malditos seais! daros prisa no? coño!!!"
        ]
    },
    "options" : {
        "width" : 975,
        "height": 543
    },
    "game-state" : function() {

        this.setup = function() {

            PXE.Layers.add(
                0,PXE.jaws.addSprite(
                    {
                        frame_size: [975,543],
                        image: st.combat.assets.sprt.fondo
                    },{x:0,y:0}
                )
            );

            // Inici GUI
            mana = Barramana(
                27, 12, 
                cuts.UI[0]["barramana"].w - 21, 
                cuts.UI[0]["barramana"].h - 6, 
                100, 0, 100, {"fill":"#313131"},
                PXE.jaws.addSprite(
                    {
                        sprite_sheet: st.combat.assets.sprt.general ,
                        frame_size: [cuts.UI[0]["barramana"].w,cuts.UI[0]["barramana"].h],
                        frame_duration: cuts.UI[0]["barramana"].t,
                        offset: cuts.UI[0]["barramana"].off,
                        orientation: cuts.UI[0]["barramana"].orientation
                    },
                    {
                        x: cuts.UI[0]["barramana"].x,
                        y: cuts.UI[0]["barramana"].y,
                        ind:cuts.UI[0]["barramana"].ind
                    }
                )
            );

            panels[0] = new panel (36, 48, 9);
            panels[1] = new panel (36, 129, 9);
            panels[2] = new panel (36, 210, 9);
            panels[3] = new panel (36, 291, 9);
            // Fi GUI

            // Inici Player
            dimoni = DimoniGran();
            // Fi player

            // Inici Enemic
            for(var i = 0; i < pistas.length ; i ++) {
                groups["soldats"].add(
                    "soldat_" + i,
                    soldat(0,pistas[i][2]-75,pistas[i][3] - cuts.soldats[0].espera.h , i+2)
                );
                groups["soldats"].add(
                    "soldat_" + (pistas.length + i),
                    soldat(0,pistas[i][2]-150,pistas[i][3] - cuts.soldats[0].espera.h , i+2)
                );
            }
            // Fir Enemics

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

                //tempoRespawn.run(dt);

                // controles
                if(jaws.pressed("left_mouse_button")){
                    // Inici GUI
                    panels[0].colide("left_mouse_button");
                    panels[1].colide("left_mouse_button");
                    panels[2].colide("left_mouse_button");
                    panels[3].colide("left_mouse_button");
                    // Fi GUI

                    // Inici Player
                    if (
                        jaws.mouse_y <= 516 && jaws.mouse_y >= 366 &&
                        jaws.mouse_y >= - jaws.mouse_x + 542 && 
                        jaws.mouse_y <= - jaws.mouse_x + 1320
                    ) {
                    
                        if (
                            PXE.Els.get(dimoni).states.state !== "dispara" &&
                            PXE.Els.get(dimoni).states.state !== "parla"
                        ) {
                            if ( 
                                PXE.Els.get(mana).val >= 15
                            ) {
                                PXE.Els.get(dimoni).jump("dispara");
                            } else {
                                var ww = st.combat.gamesPars.speaks[Math.floor(Math.random()*st.combat.gamesPars.speaks.length-0.01 )];
                                if ( countSpk < st.combat.gamesPars.speaks.length ) {
                                    ww = st.combat.gamesPars.speaks[countSpk];
                                    countSpk += 1;
                                }
                                
                                var spk = PXE.Layers.add(
                                    7,
                                    PXE.newElem(
                                        new Speakbubble(
                                            {x:291,y:208},
                                            {x:256,y:255},
                                            {words: {word: ww}}
                                        )
                                    )
                                );
                                PXE.Els.get(spk).states.add(
                                    "say",
                                    {
                                        ini: function() {
                                            this.tempo = new Tempo(5);
                                            this.tempo.restart();
                                            PXE.Els.get(dimoni).jump("parla");
                                        },
                                        run: function(t) {
                                            this.tempo.run(t);
                                            if(this.tempo.ended){
                                                PXE.Els.get(dimoni).isSaing = false;
                                                PXE.Els.remove(this.ctx.id);
                                            }
                                        }
                                    }
                                );
                                PXE.Els.get(spk).jump("say");
                                PXE.Els.get(dimoni).isSaing = true;
                                            
                            }
                        }
                    }
                    // Fi player
                }
            }

            // Debug
            fps.innerHTML = jaws.game_loop.fps;
        }

        this.draw = function() {
            jaws.clear();
            if(init){
                PXE.Layers.draw();
                /*if(jaws.pressed("left_mouse_button")){
                    // for debug proupose
                    jaws.context.beginPath();
                    jaws.context.strokeStyle = 'red';
                    jaws.context.moveTo(27,516);
                    jaws.context.lineTo(176,366);
                    jaws.context.lineTo(948,366);
                    jaws.context.lineTo(799,516);
                    jaws.context.lineTo(27,516);
                    jaws.context.closePath();
                    jaws.context.stroke();   

                    for(var i = 0; i< pistas.length ;i ++) {
                        jaws.context.beginPath();
                        jaws.context.strokeStyle = 'red';
                        jaws.context.moveTo(pistas[i][0],pistas[i][1]);
                        jaws.context.lineTo(pistas[i][2],pistas[i][3]);
                        jaws.context.closePath();
                        jaws.context.stroke(); 
                    }
                    // heeeyyy buggy buggy, hey!
                }*/
            }
        }
    }
};


