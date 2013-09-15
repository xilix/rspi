/**
 *
 * by Albert Rosell Anglisano <albert.rosell@gmail.com> 
 * Pixel eater studio
 *
 * License: LGPL - http://www.gnu.org/licenses/lgpl.html
 *
 */
if (typeof (PXE) === undefined) { throw "PXE core not loaded"; }

PXE = (function (PXE) {
    //"use strict";

    // state pattern
    PXE.stateMachine = function (states) {
        var state = "";
        
        this.states = {
            "/" : {
                ini : function () {},
                out : function () {},
                run : function () {}
            }
        };
        this.ctx = {};
        this.state = "/";
    
        this.add = function (nom, objPars) {
            var state = {}, key = "";
    
            state.ctx = this.ctx;
            state.out = function () {};
            state.ini = function () {};
            state.run = function () {};
    
            for (key in objPars) {
                if (objPars.hasOwnProperty(key)) {
                    state[key] = objPars[key];
                }
            }
    
            if (state.init !== undefined) { state.init(); }
    
            this.states[nom] = state;
            
            return this;
        };
        
        this.run = function (pars) {
            this.states[this.state].run(pars);
        };
        
        this.jump = function (state) {
            if (this.states[state] === undefined) { return false; }
    
            this.states[this.state].out(this.ctx);
            this.states[state].ini(this.ctx);
    
            this.state = state;
        };
        
        for (state in states) {
            if (states.hasOwnProperty(state)) {
                this.add(state, states[state]);
            }
        }
    };
    
    // Updating factory
    var PXE_newElem_states_bck = PXE.newElem;

    PXE.newElem = function (objSprite) {
        objSprite = PXE_newElem_states_bck(objSprite);
        
        objSprite.states = new PXE.stateMachine({});
        objSprite.states.ctx = objSprite;
        
        
        objSprite.run = function (state) {
            //jsp//JSP.start("sprite-run");
            var lvl = objSprite.ConnectionsIterator.first, con;
            objSprite.states.run(state);

            //this.Connections.forEach(function (arrLvl, lvl) {
            for (; objSprite.Connections[lvl].next !== null; lvl = objSprite.Connections[lvl].next) {
                if (objSprite.Connections[lvl].d === undefined) { continue; }
                for (con = objSprite.Connections[lvl].d.length - 1; con >= 0; con -= 1) {
                    PXE.Els.data[objSprite.Connections[lvl].d[con].el].run(state);
                }
            }
            //jsp//JSP.compute("sprite-run");
        };
        objSprite.jump = function (state) {
            //jsp//JSP.start("sprite-jump");
            var lvl = objSprite.ConnectionsIterator.first, con;
            if (objSprite.states.state !== state) {
                objSprite.states.jump(state);
            }
            for (; objSprite.Connections[lvl].next !== null && lvl < 10; lvl = objSprite.Connections[lvl].next) {
                if (objSprite.Connections[lvl].d === undefined) { continue; }
                for (con = objSprite.Connections[lvl].d.length - 1; con >= 0; con -= 1) {
                    PXE.Els.data[objSprite.Connections[lvl].d[con].el].jump(state);
                }
            }
            //jsp//JSP.compute("sprite-jump");
        };
    
        return objSprite;
    };
    
    PXE.Layers = PXE.Layers || {};
    PXE.Layers.run = function (t) {
        //jsp//JSP.start("Layers-run");
        var lay, tip, el;
        var lvl = this.dataIterator.first;
        for (; this.data[lvl].next !== null; lvl = this.data[lvl].next) {
            /*for (tip = arrLvl.length - 1; tip >= 0; tip -= 1) {
                    for (elem = arrLvl[tip].length - 1; elem >= 0; elem -= 1) {
                        arrLvl[tip][elem].draw();
                    }
            }*/
            for (elem = this.data[lvl].d[0].length - 1; elem >= 0; elem -= 1) {
                this.data[lvl].d[0][elem].run(t);
            }
            for (elem = this.data[lvl].d[1].length - 1; elem >= 0; elem -= 1) {
                this.data[lvl].d[1][elem].run(t);
            }
        }
        
        /*this.data.forEach(function (arrData, lay) {
            for (tip = arrData.length - 1; tip >= 0; tip -= 1) {
                for (el = arrData[tip].length - 1; el >= 0; el -= 1) {
                    if (PXE.Layers.data[lay][tip][el] === undefined) {
                        continue;
                    }
    
                    PXE.Layers.data[lay][tip][el].run(t);
                }
            }
        });*/
        //jsp//JSP.compute("Layers-run");
    };

    return PXE;
})(PXE || {});
