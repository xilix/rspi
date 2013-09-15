/**
 *
 * by Albert Rosell Anglisano <albert.rosell@gmail.com> 
 * Pixel eater studio
 *
 * License: LGPL - http://www.gnu.org/licenses/lgpl.html
 *
 */
if (PXE === undefined) {
    
    var PXE = (function (PXE) {
        "use strict";
    
        /** Parametre per defecte */
        PXE.def = function (opt, def) {
            if (opt !== undefined) {
                return opt;
            } else {
                return def;
            }
        };
        // 
        /**
         * @class Capsule Classes per el encapsulament dels parametres
         *
         * @property {object} Position  determina la posició dels subelements.
         * @property {object} ConDel    determina el comportament dels elements fills quan es borri l'element pare
         *
         */
        PXE.Capsule = {
            /**
             * @class Position determina la posició dels subelements.
             *
             * @property {int} relative Es posicionara respecte al element pare
             * @property {int} absolute Es posicionara en una posició absoluta dintre del canvas
             *
             */
            Position : {
                relative: 0,
                absolute: 1
            },
            /**
             * @class ConDel determina el comportament dels elements fills quan es borri l'element pare
             *
             * @property {int} Delete   Al borrarse l'element pare el fill sera borrat automaticament
             * @property {int} Drop Al borrarse l'element pare el fill quedara alliberat com a element arrel
             *
             */
            ConDel : {
                Delete: 0,
                Drop: 1
            },
            /**
             * @class TipEl Tipo de elemento
             *
             * @property {int} jaws     Elemento de tipus jaws
             * @property {int} custom   Element customizable draw amb html5
             *
             */
            TipEl : {
                jaws: 0,
                draw: 1
            },
            
            Voids : {
                anim : {
                    next : function () {},
                    frames : []
                }
            }
        };
        /**
         * Holder per variables globals
         */
        PXE._glob = {};
        
        /*
         * @Classe Iterators Permet la utilització i iteració d'arrays amb
         *                   javascript de manera eficient i rápida sense
         *                   tenir que recorre a forEach o for (ind in arr)
         *                   Here we use the Iterator pattern not to abstract
         *                   the content but for performance as in javascript
         *                   the array random access is much more faster
         *                   when the index is an integer rather than a string.
         *                   See PXE.Layers to undertand better why.
         */
         PXE.IteratorCell = function (prev, next, d) {
            if (prev === undefined) { prev = null; }
            if (next === undefined) { next = null; }
            this.next = next;
            if (d === undefined) { this.d = []; } else { this.d = d; }
            this.prev = prev;
        };
        
        PXE.Iterator = function(){
            this.first = "#_first#";
            this.last = "#_first#";
            this.holder = {};
            this.holder["#_first#"] = new PXE.IteratorCell();
            
            this.add = function (ind, elem) {
                if (this.holder[ind] === undefined) {
                    this.holder[ind] = new PXE.IteratorCell(null,this.first,elem);
                    this.holder[this.first].prev = ind;
                    this.first = ind;
                } else {
                    if (elem !== undefined) {
                        this.holder[ind].d = elem;
                    }
                }
            };

            this.remove = function (ind) {
                if (this.holder[ind] === undefined) { return false; }
                if (this.holder[ind].next !== null) { this.holder[this.holder[ind].next].prev = this.holder[ind].prev; }
                if (this.holder[ind].prev !== null){ this.holder[this.holder[ind].prev].next = this.holder[ind].next; }
                delete this.holder[ind];
            };
        };

        PXE.IteratorLvl = function(){
            this.first = 21;
            this.last = 21;
            this.holder = [];
            this.holder[21] = new PXE.IteratorCell ();

            this.add = function (z, elem) {
                var lvl,lastLvl;
                if (this.holder[z] === undefined) {
                    if (z < this.first) {
                        if(elem === undefined || Object.prototype.toString.call(elem) === '[object Array]') {
                            this.holder[z] = new PXE.IteratorCell(null,this.first,elem);
                        } else {
                            this.holder[z] = new PXE.IteratorCell(null,this.first,[elem]);
                        }
                        this.holder[this.first].prev = z;
                        this.first = z;
                    } else {
                        lvl = this.first;
                        for (; this.holder[lvl].next !== null && lvl < z; lvl = this.holder[lvl].next) ;
                        if(Object.prototype.toString.call(elem) === '[object Array]') {
                            this.holder[z] = new PXE.IteratorCell(this.holder[lvl].prev,lvl,elem);
                        } else {
                            this.holder[z] = new PXE.IteratorCell(this.holder[lvl].prev,lvl,[elem]);
                        }
                        if ( this.holder[lvl].prev !== null ) { this.holder[this.holder[lvl].prev].next = z; }
                        this.holder[lvl].prev = z;
                    }
                } else {
                    if (elem !== undefined) {
                        if(Object.prototype.toString.call(this.holder[z].d) === '[object Array]') {
                            this.holder[z].d.push(elem);
                        } else {
                            this.holder[z].d = elem;
                        }
                    }
                }
            };
            
            this.remove = function (z) {
                if (this.holder[z] === undefined) { return false; }
                if (this.holder[z].next !== null) { this.holder[this.holder[z].next].prev = this.holder[z].prev; }
                if (this.holder[z].prev !== null){ this.holder[this.holder[z].prev].next = this.holder[z].next; }
                this.holder[z] = undefined;
                //this.holder.splice(z,1);
            };
        };
    
        // 
        /**
         * @class Els Gestiona tots els elements actius
         *        "Librarian" or "keeper" of all the elemtns
         *        in the game. Who is in charge to provide them
         *
         * @property {int} length número d'elements carregats al motor.
         * @property {array} data array associatiu amb els elemetns carregats al motor i indexats per un id únic.
         *
         */
        PXE.Els = function Els() {
            this.length = 0;
            this.idCount = 0;
            this.data = [];
            this.semaforo = false;
            this.dataLliures = [];
        };
    
        /** Genera un id únic per l'element */
        PXE.Els.prototype.genId = function (index) {
            return "id_"+index;
            //return "id_" + index + "_" + Math.floor(Math.random() * 99999);
        };
        
        PXE.Els.prototype.add = function (El) {
            //jsp//JSP.start("Els-add");
            if(this.semaforo) { throw "bloquejat"; }
            this.semaforo = true;

            if (El.id !== undefined && PXE.Els.data[El.id] !== undefined) {
                this.semaforo = false;
                //console.log("Element " + El.id + " already exists :" + El.toString());
                throw ("Element " + El.id + " already exists :" + El.toString());
            }

            if (El.id === undefined) {
                El = new PXE.newElem(El);
            }

            var idEl = null,prev = PXE.Els.dataLliures.length - 1;
            if (prev >= 0) {
                idEl = PXE.Els.dataLliures[prev];
                PXE.Els.dataLliures.pop();
            } else {
                idEl = PXE.Els.genId(PXE.Els.idCount);
            }

            El.id = idEl;
            PXE.Els.data[idEl] = El;
            PXE.Els.length += 1;
            PXE.Els.idCount += 1;

            this.semaforo = false;
            return idEl;
            //jsp//JSP.compute("Els-add");
        };
        
        PXE.Els.prototype.remove = function (idEl) {
            //jsp//JSP.start("Els-remove");
            if (PXE.Els.exist(idEl)) {
                PXE.Layers.remove(idEl);
                PXE.Els.data[idEl].removeConns();
                PXE.Els.data[idEl] = undefined;
                PXE.Els.length -= 1;
                //PXE.Els.data.splice(idEl,1);
                PXE.Els.dataLliures.push(idEl);
            }
            //jsp//JSP.compute("Els-remove");
        };
        
        PXE.Els.prototype.get = function (idEl) {
            return this.data[idEl];
        };
        
        PXE.Els.prototype.exist = function (idEl) {
            return (typeof this.data[idEl] !== "undefined");
        };


        PXE.Els = new PXE.Els();

        // 
        /**
         * @class Layers Conte tots els elements ordenats per capa de profunditat per donar l'efecte de una ficiticia tercera dimensió
         *        This holds the order of the elements which are displaing. 
         *        It allows to work easly, and hopefully fast, with layers in the game.
         */
        PXE.Layers = function () {
            this.length = 0;
            this.dataIterator = new PXE.IteratorLvl();
            this.data = this.dataIterator.holder;
            // Relationship from layer to element is 1:N
            this.ZId = [];// layer - elementS idS map
            this.IdZ = [];// element id - layer map
        };
        
        PXE.Layers.prototype.add = function (z, El, tip) {
            var sprtList = null;
            // afegim element al registre
            if (El.id === undefined || El.id === null) { El.id = PXE.Els.add(El); }
        
            if (this.ZId[z] === undefined) {
                // creem primer index perque no peti
                this.ZId[z] = [];
            }
      
            if (this.ZId[z].indexOf(El.id) < 0) {
                // Si no existeix l'element l'insertem
                this.ZId[z].push(El.id);
            }

            // Afegim registre array reverse
            this.IdZ[El.id] = z;
            this.IdZ.length += 1;

            this.dataIterator.add(z);
        
            if (this.data[z].d[PXE.Capsule.TipEl.jaws] === undefined) {
                this.data[z].d[PXE.Capsule.TipEl.jaws]  = [];
            }
            if (this.data[z].d[PXE.Capsule.TipEl.draw] === undefined) {
                this.data[z].d[PXE.Capsule.TipEl.draw] = [];
            }
        
            if (tip === undefined) {
                tip = PXE.Capsule.TipEl.jaws;
            }
            switch (tip) {
            case PXE.Capsule.TipEl.jaws:
                this.data[z].d[PXE.Capsule.TipEl.jaws].push(El);
                break;
            default:
                this.data[z].d[tip].push(El);
            }

            return El.id;
        };
        
        PXE.Layers.prototype.draw = function (El) {
            var lvl, tip, elem;
            // Be carefull. This is an important part for perfromance
            //jsp//JSP.start("Layers-draw");
        
            //this.data.forEach(function (arrLvl, lvl) {
            var lvl = this.dataIterator.first;
            for (; this.data[lvl].next !== null; lvl = this.data[lvl].next) {
                /*for (tip = arrLvl.length - 1; tip >= 0; tip -= 1) {
                        for (elem = arrLvl[tip].length - 1; elem >= 0; elem -= 1) {
                            arrLvl[tip][elem].draw();
                        }
                }*/
                // What the heck is this ??? There are 2 indexes here to be able
                // to use different ways to display. The index d[0] is for the jaws
                // elements. The index d[1] is for the custom elements. Is writed
                // in this way instead of inside a fancy a happy of bunch of whatever
                // to make it more modular, scalable and bla bla bla just because
                // the performance. See the comment above about "Be carefull. 
                // This is an important ...."
                for (elem = this.data[lvl].d[0].length - 1; elem >= 0; elem -= 1) {
                    this.data[lvl].d[0][elem].draw();
                }
                for (elem = this.data[lvl].d[1].length - 1; elem >= 0; elem -= 1) {
                    this.data[lvl].d[1][elem].draw();
                }
            }
        
            //jsp//JSP.compute("Layers-draw");
        };
        
        PXE.Layers.prototype.remove = function (idEl) {
            var z = this.IdZ[idEl];
            if (typeof z === "undefined") {
                return false;
            }
        
            this.IdZ[idEl] = undefined;
            delete this.IdZ[idEl];
        
            this.data[z].d[PXE.Capsule.TipEl.jaws] = this.data[z].d[PXE.Capsule.TipEl.jaws].
                filter(
                    function (elem) {
                        return (elem !== null && elem !== undefined && elem.id !== idEl);//
                    }
                );
            this.data[z].d[PXE.Capsule.TipEl.draw] = this.data[z].d[PXE.Capsule.TipEl.draw].
                filter(
                    function (elem) {
                        return (elem !== null && elem !== undefined && elem.id !== idEl);//elem !== null || elem !== undefined || 
                    }
                );
            
            this.ZId[z] = this.ZId[z].filter(
                function (elem) {
                    return (elem !== idEl);
                }
            );

            return true;
        };
        
        /**
         * For debugging purpose. It returns the state of the Layers
         */
        PXE.Layers.prototype.spy = function (idEl) {
            var spy = {
                "is": false, "IdZ": false, 
                "ZId" : {"is": false},
                "IdZ" : {"is": false, "ind": 0},
                "data" : {"is": false, "ind": []}
            };

            var z = this.IdZ[idEl];
            if (typeof z !== "undefined") { spy.ZId.is = true; }

            if (typeof this.ZId[z] !== "undefined") { 
                spy.IdZ.is = true;
                spy.IdZ.ind = z;
            }

            var lvl = this.dataIterator.first;
            for (; this.data[lvl].next !== null; lvl = this.data[lvl].next) {
                for (elem = this.data[lvl].d[0].length - 1; elem >= 0; elem -= 1) {
                    if(this.data[lvl].d[0][elem].id === idEl) {
                        spy.data.is = true;
                        spy.data.ind.push({"lvl": lvl, "ind": elem, "typ": 0});
                    }
                }
                for (elem = this.data[lvl].d[1].length - 1; elem >= 0; elem -= 1) {
                    if(this.data[lvl].d[1][elem].id === idEl) {
                        spy.data.is = true;
                        spy.data.ind.push({"lvl": lvl, "ind": elem, "typ": 0});
                    }
                }
            }

            spy.is = spy.ZId.is & spy.IdZ.is & spy.data.is;

            return spy;
        };

        PXE.Layers = new PXE.Layers();

        // *************************************** //
        // Holder for the elements connections
        PXE.Connection = function Connection(idEl, idPare, pars) {
            // Parameters for the attachment to the parent
            this.pars = {
                // Delte If the parent  is deleted this one also
                // TODO: Drop If the parent is deleted this one will remind
                // TODO: Fade If the parent is deleted this will be deleted after some time
                ConDel: PXE.Capsule.ConDel.Delete,
                pos: {
                    x: 0,
                    y: 0,
                    type: PXE.Capsule.Position.relative,
                    dflipx: 0,
                    dflipy: 0
                },
                z : 10,
                data : {}
            };
    
            this.el = idEl;
            this.pa = idPare;
            this.msg = {};
    
            this.def = function (pars) {
                if (pars.ConDel !== undefined) { this.pars.ConDel = pars.ConDel; }
                if (pars.z !== undefined) { this.pars.z = pars.z; }
                if (pars.pos !== undefined) {
                    if (pars.pos.x !== undefined) { this.pars.pos.x = pars.pos.x; }
                    if (pars.pos.y !== undefined) { this.pars.pos.y = pars.pos.y; }
                    if (pars.pos.type !== undefined) { this.pars.pos.type = pars.pos.type; }
                }
                if (pars.data !== undefined) { this.pars.data = pars.data; }
                if (pars.anims !== undefined) { this.pars.anims = pars.anims; }
            };
    
            this.draw = function () {
                PXE.Els.data[this.el].draw();
            };
            
            this.sendMsg = function (key, msg) {
                this.msg[key] = msg;
            };
    
            this.remove = function () {
                switch (this.pars.ConDel) {
                case PXE.Capsule.ConDel.Delete:
                    PXE.Els.remove(this.el);
                    break;
                default:
                    throw ("Element On delete behaviour not supported");
                }
                
            };
    
            this.move = function (x, y) {
                switch (this.pars.pos.type) {
                case PXE.Capsule.Position.relative:
                    PXE.Els.data[this.el].moveTo(
                        PXE.Els.data[this.pa].x + this.pars.pos.x ,
                        PXE.Els.data[this.pa].y + this.pars.pos.y
                    );
                    break;
                case PXE.Capsule.Position.absolute:
                    PXE.Els.data[this.el].moveTo(x, y);
                    break;
                default:
                    throw ("Element move behaviour not supported");
                }
            };
            
            this.flip = function () {
                PXE.Els.get(this.el).flip();
            
                this.pars.pos.dflipx *= -1;
                switch (this.pars.pos.type) {
                case PXE.Capsule.Position.relative:
                    this.pars.pos.x += this.pars.pos.dflipx;
                    break;
                default:
                }
                this.move(this.x, this.y);
            };
    
            this.attach = function (idEl, idPare, pars) {
                if (pars !== undefined) { this.def(pars); }
                
                this.el = idEl;
                this.pa = idPare;
                switch (this.pars.pos.type) {
                case PXE.Capsule.Position.relative:
                    PXE.Els.data[this.el].x = this.pars.pos.x;
                    PXE.Els.data[this.el].y = this.pars.pos.y;
                    break;
                default:
                }
                
                this.move(this.x, this.y);
    
                this.pars.pos.dflipx = 2 * (this.pars.pos.x -
                                        //PXE.Els.data[this.pa].scale_x *
                                        PXE.Els.data[this.pa].width / 2) +
                                        //PXE.Els.data[this.pa].scale_x *
                                        PXE.Els.data[this.el].width;
            };
    
            if (this.el !== undefined && this.pa !== undefined) {
                this.attach(this.el, this.pa, pars);
            }
        };

        // *************************************** //
        PXE.newElem = function (sprite) {
            if (sprite.pars === undefined) { sprite.pars = null; }
            sprite.ConnectionsIterator = new PXE.IteratorLvl();
            sprite.Connections = sprite.ConnectionsIterator.holder;
            sprite.ConnectionParent = undefined;
            sprite.animsIterator = new PXE.Iterator();
            sprite.anims = sprite.animsIterator.holder;
            sprite.animsStop = [];
            sprite.images = [];
            sprite.id = null;
            sprite.debug = 0;
            sprite.msg = {};

            sprite.addConnection = function (idEl, pars) {
                var conn = null, i = 0, lvl;
                if (pars !== undefined) {
                    conn = new PXE.Connection(idEl, this.id, pars);
                } else {
                    conn = new PXE.Connection(idEl, this.id);
                }
                conn.pars.z += 10;
                if (conn.pars.z <= 0) { conn.pars.z = 1; }

                this.ConnectionsIterator.add(conn.pars.z,conn);

                if (conn.pars.anims !== undefined) {
                    conn.pars.anims.forEach(function (anims,i) {
                        sprite.addConnAnims(anims, idEl);
                    });
                }

                PXE.Els.get(idEl).ConnectionParent = conn;
            };

            sprite.updateConnAnims = function (elem) {
                var nom = elem.anims[0].next;
                for (; elem.anims[nom].next !== null; nom = elem.anims[nom].next) {
                    this.addConnAnims(nom, elem.id);
                }
            };
            
            sprite.sendMsg2Conn = function (key, msg) {
                var lvl = this.ConnectionsIterator.first, con, cahce;
                for (; this.Connections[lvl].next !== null; lvl = this.Connections[lvl].next) {
                    for (con = this.Connections[lvl].d.length - 1; con >= 0; con -= 1) {
                        this.Connections[lvl].d[con].sendMsg(key, msg);
                    }
                }
            };
            
            sprite.removeConn = function (idEl) {
                var lvlErase = [], lvl =this.ConnectionsIterator.first;
                //this.Connections.forEach(function (arrLvl, lvl) {
                for (; this.Connections[lvl].next !== null; lvl = this.Connections[lvl].next) {
                    this.Connections[lvl].d = this.Connections[lvl].d.
                        filter(function (element, index, array) {
                            return element.id !== idEl;
                        });
                    if (this.Connections[lvl].d.length <= 0) {
                        lvlErase.push(lvl);
                    }
                }
                
                for (lvl = lvlErase.length - 1; lvl >= 0; lvl -= 1) {
                    this.ConnectionsIterator.remove(lvlErase[lvl]);
                }
            };
            sprite.removeConns = function () {
                var lvl = this.ConnectionsIterator.first, con;
                for (; this.Connections[lvl].next !== null; lvl = this.Connections[lvl].next) {
                    for (con = this.Connections[lvl].d.length - 1; con >= 0; con -= 1) {
                        this.Connections[lvl].d[con].remove();
                        this.removeConn(con);
                    }
                }
            }
 

            if (typeof sprite.remove === "function") {
                sprite.removeParent = sprite.remove;
            } else {
                sprite.removeParent = function () {};
            }
            sprite.remove = function () {
                PXE.Els.remove(this.id);
            };
        
            if (typeof sprite.draw === "function") {
                sprite.drawParent = sprite.draw;
            } else {
                sprite.drawParent = function () {};
            }
            if (
                (typeof sprite.rect === "function") &&
                (typeof sprite.rect() !== "undefined") &&
                (typeof sprite.rect().draw === "function")
            ) {
        
                sprite.drawRectParent = sprite.rect().draw;
            } else {
                sprite.drawRectParent = function () {};
            }
            sprite.draw = function () {
                //jsp//JSP.start("sprite-draw");
                var lvl = this.ConnectionsIterator.first, con;
                
                //this.Connections.forEach(function (arrLvl, lvl) {
                for (; this.Connections[lvl].next !== null && lvl < 10; lvl = this.Connections[lvl].next) {
                    if (this.Connections[lvl].d === undefined) { continue; }
                    for (con = this.Connections[lvl].d.length - 1; con >= 0; con -= 1) {
                        this.Connections[lvl].d[con].draw();
                    }
                }
        
                switch (this.debug) {
                case 2:
                    this.drawParent();
                    this.drawRectParent();
    
                    break;
                case 1:
                    this.drawRectParent();
                    break;
                default:
                    this.drawParent();
                }

                for (; this.Connections[lvl].next !== null; lvl = this.Connections[lvl].next) {

                    if (this.Connections[lvl].d === undefined) { continue; }
                    for (con = this.Connections[lvl].d.length - 1; con >= 0; con -= 1) {
                        this.Connections[lvl].d[con].draw();
                    }
                }
                //jsp//JSP.compute("sprite-draw");
            };
            sprite.drawH = sprite.draw;
            
            sprite.display = function (tip) {
                if (tip) {
                    sprite.draw = sprite.drawH;
                } else {
                    sprite.draw = function () {};
                }
            };
        
            if (typeof sprite.move === "function") {
                sprite.moveParent = sprite.move;
            } else {
                sprite.moveParent = function (x, y) {};
            }
            sprite.move = function (x, y) {
                this.moveParent(x, y);
        
                this.updateConnectios();
            };
        
            if (typeof sprite.moveTo === "function") {
                sprite.moveToParent = sprite.moveTo;
            } else {
                sprite.moveToParent = function (x, y) {};
            }
            sprite.moveTo = function (x, y) {
                this.moveToParent(x, y);
        
                this.updateConnectios(x, y);
            };
        
            if (typeof sprite.setX === "function") {
                sprite.setXParent = sprite.setX;
            } else {
                sprite.setXParent = function (x) {};
            }
            sprite.setX = function (x) {
                this.setXParent(x);
        
                this.updateConnectios(this.x, this.y);
            };
        
            if (typeof sprite.setY === "function") {
                sprite.setYParent = sprite.setY;
            } else {
                sprite.setYParent = function (y) {};
            }
            sprite.setY = function (y) {
                this.setYParent(y);
        
                this.updateConnectios(this.x, this.y);
            };
        
            if (typeof sprite.flip === "function") {
                sprite.flipParent = sprite.flip;
            } else {
                sprite.flipParent = function () {};
            }
            sprite.flip = function () {
                var lvl = this.ConnectionsIterator.first, con;
                this.flipParent();
        
                for (; this.Connections[lvl].next !== null; lvl = this.Connections[lvl].next) {
                    for (con = this.Connections[lvl].d.length - 1; con >= 0; con -= 1) {
                        this.Connections[lvl].d[con].flip();
                    }
                }
        
            };
        
            sprite.updateConnectios = function (x, y) {
                var lvl = this.ConnectionsIterator.first, con;
                if (x === undefined) { x = this.x; }
                if (y === undefined) { y = this.y; }
                for (; this.Connections[lvl].next !== null; lvl = this.Connections[lvl].next) {
                    for (con = this.Connections[lvl].d.length - 1; con >= 0; con -= 1) {
                        this.Connections[lvl].d[con].move(x, y);
                    }
                }
            };
        
            sprite.addAnim = function (nom, anim) {
                var nom;
                
                this.animsIterator.add(nom);

                if (sprite.anims[nom].d.cons === undefined) {
                    this.anims[nom].d.cons = [];
                }
        
                if (anim !== undefined) {
                    this.anims[nom].d.self = anim;
                } else {
                    this.anims[nom].d.self = this.anims["main"].d.self;
                }
            };
            sprite.removeAnim = function (nom, anim) {
                if (this.anims[nom].d.self === undefined) {
                    delete this.anims[nom];
                }
        
                if (
                    this.anims[nom].d.cons !== undefined &&
                    this.anoms[nom].d.cons.length === 0
                ) {
                    delete this.anims[nom].d.cons;
                    this.animsIterator.remove(nom);
                }
            };
            sprite.addConnAnims = function (nom, elemId) {
                this.animsIterator.add(nom);
                
                if (this.anims[nom].d.cons === undefined) { this.anims[nom].d.cons = []; }

                this.anims[nom].d.cons.push(elemId);
                //this.anims[nom].d.cons.length += 1;
            };
            sprite.removeConnAnims = function (nom, elemId) {
                var news = this.anims[nom].d.cons.filter(
                    function (el) { return el !== elemId; }
                );
                if (news.length === 0) {
                    delete this.anims[nom].d.cons;
                    if (this.anims[nom].d.self === undefined) {
                        this.animsIterator.remove(nom);
                    }
                } else {
                    //this.anims[nom].d.cons.length -= 1;
                    this.anims[nom].d.cons = news;
                }
            };
            sprite.resetAnim = function (nom, index) {
                var ind  = (index === undefined ? 0 : index), elem;
                
                if (this.anims[nom] === undefined) { return false; }
        
                if (this.anims[nom].d.self !== undefined) {
                    this.anims[nom].d.self.index = ind;
                    this.setImage(this.anims[nom].d.self.frames[ind]);
                }
        
                for (elem = this.anims[nom].d.cons.length - 1; elem >= 0 ; elem -= 1) {
                    PXE.Els.data[this.anims[nom].d.cons[elem]].resetAnim(nom, index);
                }
            };
            sprite.stopAnim = function (nom) {
                if (this.animsStop[nom] === undefined) {
                    this.animsStop[nom] = this.anims[nom];
                    this.animsIterator.remove(nom);
                }
            };
            sprite.restartAnim = function (nom) {
                if (this.animsStop[nom] !== undefined) {
                    this.animsIterator.add(nom,this.animsStop[nom].d);
                    delete this.animsStop[nom];
                }
            };
            sprite.runAnim = function (nom) {
                var elem;

                // Aqui es mes crític el rendiment ja que les animacions s'acostumen
                // a actualitzar en cada frame
                if (this.anims[nom].d.self !== undefined) {
                    this.setImage(this.anims[nom].d.self.next());
                }
                // http://jsperf.com/for-vs-foreach/37
                for (elem = this.anims[nom].d.cons.length - 1; elem >= 0; elem -= 1) {
                    PXE.Els.data[this.anims[nom].d.cons[elem]].runAnim(nom);
                }
            };
            
            sprite.addImg = function (nom, image) {
                if (this.images[nom] === undefined) {
                    this.images[nom] = [];
                    this.images[nom].cons = [];
                }
        
                this.images[nom].self = image;
            };
            sprite.setImg = function (nom) {
                var elem;
                if (this.images[nom].self !== undefined) {
                    this.setImage(this.images[nom].self);
                }
        
                for (elem = this.images[nom].cons.length - 1; elem >= 0; elem += 1) {
                    PXE.Els.data[this.images[nom].cons[elem]].setImg(nom);
                }
            };
        
            return sprite;
        };
    
        return PXE;
    })(PXE || {});

}
