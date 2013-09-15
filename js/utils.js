/**
 *
 * Albert Rosell Anglisano <albert.rosell@gmail.com> 
 * Pixel eater studio
 *
 * License: LGPL - http://www.gnu.org/licenses/lgpl.html
 *
 * This library use a part of Jaws, a HTML5 canvas/javascript 2D game development framework that is distributed under LGPL licence
 * You can found this framework in those places
 *
 * Homepage:      http://jawsjs.com/
 * Source:        http://github.com/ippa/jaws/
 * Documentation: http://jawsjs.com/docs/
 *
 * Thanks for develop free software!
 *
 */
function Tempo(T, onCicle) {
    this.ended = false;
    this.t = 0;
    this.T = T;
    this.stoped = true;
    this.pars = {};

    this.onCicle = function () {
    };
    if (onCicle !== undefined) {
        this.onCicle = onCicle;
    }
    
    this.stop = function () {
        this.stoped = true;
    };
    this.start = function () {
        this.stoped = false;
    };
    this.reset = function () {
        this.t = 0;
        this.ended = false;
    };
    this.restart = function (T) {
        if (T !== undefined) { this.T = T; }
    
        this.reset();
        this.start();
    };
    this.shutdown = function () {
        this.reset();
        this.stop();
    };
    this.run = function (add) {
        if (this.stoped) { return false; }
        this.t += add;
        if (this.t >= this.T) {
            this.t = 0;
            this.ended = true;
            this.onCicle();
        }
    };
}

function Text() {
    this.Tempo = null;
    this.x = 0;
    this.y = 0;
    this.size = '17px';
    this.font = 'Arial';
    this.color = "#000000";
    this.text = '';

    this.rect = function () {
        return this;
    };

    this.flip = function () {
    };

    this.remove = function () {
    };

    this.move = function (x, y) {
        this.x += x;
        this.y += y;
    };
    this.moveTo = function (x, y) {
        this.x = x;
        this.y = y;
    };

    this.draw = function (text, x, y) {
        if (text !== undefined) { this.text = text; }
        if (x !== undefined) { this.x = x; }
        if (y !== undefined) { this.y = y; }
        
        jaws.context.font = this.size + " " + this.font;
        jaws.context.fillStyle = this.color;
        jaws.context.fillText(this.text, this.x, this.y);
    };
}

function Speakbubble(posBubble, posMonth, pars) {
    
    this.x = posBubble.x;
    this.y = posBubble.y;
    this.xM = posMonth.x;
    this.yM = posMonth.y;
    this.Tempo = null;
    this.saing = true;
    this.pars = {
        background : "#FFFFFF",
        border : "#000000",
        words : { word : "    "}
    };
    if (pars.words !== undefined) { this.pars.words = pars.words; }
    if (pars.callback !== undefined) {
        this.pars.callback = function () { this.saing = false; };
    }
    if (pars.background !== undefined) {
        this.pars.background = "#FFFFFF";
    }
    if (pars.border !== undefined) {
        this.pars.border = "#000000";
    }
    if (pars.clips !== undefined) {
        this.Tempo = new Tempo(pars.clips, this.pars.callback);
    }
    
    this.textInfo = new Text();
    this.textData = new Text();
    this.textData.font = "bold Arial";

    this.rect = function () {
        return this;
    };

    this.flip = function () {
    };

    this.remove = function () {
    };

    this.move = function (x, y) {
        this.x += x;
        this.y += y;
    };
    this.moveTo = function (x, y) {
        this.x = x;
        this.y = y;
    };

    this.draw = function () {
        if (this.saing) {

            var ll = this.pars.words.word.length*0.8;
            if (ll <= 14) { ll = 14; }
            ll -= 14;
            ll *= 9;

            jaws.context.beginPath();
            jaws.context.moveTo(this.x + ll / 2, this.y + 20);
            jaws.context.lineTo(this.xM, this.yM);
            jaws.context.lineTo(this.x + 100 + ll / 2, this.y - 20);
            jaws.context.moveTo(this.x + 50 + ll / 2, this.y + 20);
            jaws.context.lineJoin = 'round';
            jaws.context.fillStyle = this.pars.background;
            jaws.context.fill();
            jaws.context.strokeStyle = this.pars.border;

            jaws.context.beginPath();
            jaws.context.moveTo(this.x, this.y);
            jaws.context.bezierCurveTo(this.x, this.y + 30, this.x + 30 + ll, this.y + 40, this.x + 100 + ll, this.y + 40);
            jaws.context.bezierCurveTo(this.x + 170 + ll, this.y + 40, this.x + 195 + ll, this.y + 30, this.x + 200 + ll, this.y);
            jaws.context.bezierCurveTo(this.x + 195 + ll, this.y - 30, this.x + 170 + ll, this.y - 40, this.x + 100 + ll, this.y - 40);
            jaws.context.bezierCurveTo(this.x + 30, this.y - 40, this.x, this.y - 30, this.x, this.y);
            jaws.context.lineJoin = 'round';
            jaws.context.fillStyle = this.pars.background;
            jaws.context.fill();
            jaws.context.strokeStyle = this.pars.border;
            jaws.context.stroke();

            this.textData.draw(this.pars.words.word, this.x + 25, this.y);
        }
    };
}

function Barravida(w, h, Max, Min, val, color, type) {
    this.b_width = w;
    this.b_height = h;
    this.x = 0;
    this.y = 0;

    this.x0 = 0;
    this.y0 = 0;
    this.x1 = w;
    this.y1 = h;

    this.inv_x0 = w;
    this.inv_y0 = 0;
    this.inv_x1 = w;
    this.inv_y1 = h;

    this.max = Max;
    this.min = Min;
    this.gap = this.max - this.min;
    if (color === undefined) { 
        color = {
            "fill" : "green",
            "well" : "red",
            "border" : 'black'
        } 
    }
    this.color = [color.well, color.fill, color.border];
    if (val === undefined) { val = Max; }
    this.val = val;
    if (type === undefined) { type = "normal"; }
    this.type = type;

    this.add = function (val) {
        if (isNaN(val)) { return false; }
        this.val += val;

        this._rebound();
    };
    this.setVal = function (val) {
        if (isNaN(val)) { return false; }
        this.val = val;

        this._rebound();
    };
    this._rebound = function() {
        if (this.val > this.max) { this.val = this.max; }
        if (this.val < this.min) { this.val = this.min; }
        switch(type){
            case "invers":
                this.x0 = this.x + this.b_width;
                this.y0 = this.y;
                this.x1 = - this.b_width * (this.max - this.val) / this.gap
                this.y1 = this.b_height;

                this.inv_x0 = this.x;
                this.inv_y0 = this.y;
                this.inv_x1 = this.b_width * this.val / this.gap
                this.inv_y1 = this.b_height;
            break;
            default:
                this.x0 = this.x;
                this.y0 = this.y;
                this.x1 = this.b_width * this.val / this.gap
                this.y1 = this.b_height;

                this.inv_x0 = this.x + this.b_width;
                this.inv_y0 = this.y;
                this.inv_x1 = - this.b_width * (this.max - this.val) / this.gap
                this.inv_y1 = this.b_height;
        }
    }

    this.move = function (x, y) {
        this.x = x;
        this.y = y;

        this._rebound();
    };
    
    this.moveTo = function (x, y) {
        this.x = x;
        this.y = y;
        
        this._rebound();
    };

    this.flip = function () {
    };
    this.rect = function () {
        return this;
    };

    switch(type){
        case "invers":
            this.draw = function () {
                jaws.context.beginPath();
                jaws.context.fillStyle = this.color[1];
                jaws.context.fillRect(this.x0, this.y0, this.x1, this.y1);
                jaws.context.fill();
            };
        break;
        default:
            this.draw = function () {
                jaws.context.beginPath();
                jaws.context.fillStyle = this.color[0];
                jaws.context.fillRect(this.x, this.y, this.b_width, this.b_height);
                jaws.context.fill();

                jaws.context.beginPath();
                jaws.context.fillStyle = this.color[1];
                jaws.context.fillRect(this.x0, this.y0, this.x1, this.y1);
                jaws.context.fill();
                
                jaws.context.beginPath();
                jaws.context.rect(this.x, this.y, this.b_width, this.b_height);
                jaws.context.lineWidth = 1;
                jaws.context.strokeStyle = this.color[2];
                jaws.context.stroke();
        }
    };
    this._rebound();
}

function Guspira(x, y, r) {
    this.x = x;
    this.y = y;
    this.color = "#990000";
    this.alpha = 0.9;

    this.move = function (x, y) {
        this.x += x;
        this.y += y;
    };

    this.moveTo = function (x, y) {
        this.x = x;
        this.y = y;
    };

    this.flip = function () {
    };
    this.rect = function () {
        return this;
    };

    this.draw = function () {
        jaws.context.save();
        jaws.context.globalAlpha = this.alpha;
        jaws.context.beginPath();
        jaws.context.arc(this.x, this.y, 2, 0, 2 * Math.PI);
        jaws.context.fillStyle = '' + this.color;
        jaws.context.fill();
        jaws.context.lineWidth = 1;
        jaws.context.strokeStyle = this.color;
        jaws.context.stroke();
        jaws.context.restore();
    };
}

function Ion(x, y, w, h, color) {
    this.x = x;
    this.y = y;
    this.p_width = w;
    this.p_height = h;
    this.color = color;
    this.alpha = 1;

    this.move = function (x, y) {
        this.x += x;
        this.y += y;
    };

    this.moveTo = function (x, y) {
        this.x = x;
        this.y = y;
    };

    this.flip = function () {
    };
    this.rect = function () {
        return this;
    };

    this.draw = function () {
        jaws.context.save();
        jaws.context.globalAlpha = this.alpha;
        jaws.context.beginPath();
        jaws.context.fillStyle = '' + this.color;
        jaws.context.fillRect(this.x, this.y, this.p_width, this.p_height);
        jaws.context.restore();
    };
}

function Box(x, y, w, h, colorStroke) {
    this.x = x;
    this.y = y;
    this.p_width = w;
    this.p_height = h;
    this.color = colorStroke;
    this.alpha = 1;

    this.move = function (x, y) {
        this.x += x;
        this.y += y;
    };

    this.moveTo = function (x, y) {
        this.x = x;
        this.y = y;
    };

    this.flip = function () {
    };
    this.rect = function () {
        return this;
    };

    this.draw = function () {
        jaws.context.save();
        jaws.context.globalAlpha = this.alpha;
        jaws.context.beginPath();
        jaws.context.strokeStyle = '' + this.color;
        jaws.context.strokeRect(this.x, this.y, this.p_width, this.p_height);
        jaws.context.restore();
    };
}


function Grid(step) {
    this.step = 5;
    if (step !== undefined) {
        this.step = step;
    }
    
    this.move = function (x, y) {
    };
    this.rect = function () {
        return this;
    };

    this.draw = function (step) {
        var i, j, caW = jaws.context.canvas.width, caH = jaws.context.canvas.height;
        if (step !== undefined) {
            this.step = step;
        }

        for (i = 0; i < caW; i += this.step) {
            jaws.context.ineWidth = 1;
            jaws.context.strokeStyle = 'grey';
            jaws.context.beginPath();
            jaws.context.moveTo(i, 0);
            jaws.context.lineTo(i, jaws.context.canvas.height);
            jaws.context.stroke();
        }
        for (j = 0; j < caH; j += this.step) {
            jaws.context.ineWidth = 1;
            jaws.context.strokeStyle = 'grey';
            jaws.context.beginPath();
            jaws.context.moveTo(0, j);
            jaws.context.lineTo(jaws.context.canvas.width, j);
            jaws.context.stroke();
        }
        for (i = 0; i < caW; i += 5 * this.step) {
            jaws.context.ineWidth = 1;
            jaws.context.strokeStyle = 'black';
            jaws.context.beginPath();
            jaws.context.moveTo(i, 0);
            jaws.context.lineTo(i, jaws.context.canvas.height);
            jaws.context.stroke();
        }
        for (j = 0; j < caH; j += 5 * this.step) {
            jaws.context.ineWidth = 1;
            jaws.context.strokeStyle = 'black';
            jaws.context.beginPath();
            jaws.context.moveTo(0, j);
            jaws.context.lineTo(jaws.context.canvas.width, j);
            jaws.context.stroke();
        }
    };
}

PXE = (function (PXE) {
    /**
      * @require : element id a selected non-jQuery DOM element
      *
      * @provide : shift and crtrl pressed event binding to the provede DOM element
      *            and this.shiftKey, this.ctrlKey properties values 
      *            according to this event.
      *
      * @invariant : this.shiftKey and this.ctrlKey always true or false
      */
    function FunKeyDetect (element) {
        this.element = $(element);
        this.shiftKey = false;
        this.ctrlKey = false;

        that = this;

        this.element.keydown(function(event) {
            switch (event.which) {
                case 16:
                    that.shiftKey = true;
                    break;
                case 17:
                    that.ctrlKey = true;
                    break;
            }
        });

        this.element.keyup(function(event) {
            switch (event.which) {
                case 16:
                    that.shiftKey = false;
                    break;
                case 17:
                    that.ctrlKey = false;
                    break;
            }
        });
    }
    
    PXE.ui = {};
    PXE.ui.fun = new FunKeyDetect(document);
    
    return PXE;
}(PXE || {}));

PXE = (function (PXE) {

    PXE.math = {};
    
    PXE.math.e2DPoint = function e2DPoint(x, y) {
        this.x = x;
        this.y = y;
    };
    
    PXE.math.e2DVector = function e2DVector(vx, vy) {
        this.vx = vx;
        this.vy = vy;
    };
    
    PXE.math.e2D = function e2D() {
        this.dist = 0;
        this.p0 = new PXE.math.e2DPoint(0, 0);
        this.p1 = new PXE.math.e2DPoint(0, 0);
        this.u = new PXE.math.e2DVector(0, 0);
        this.v = new PXE.math.e2DVector(0, 0);
        this.angle = 0;
        this.setPoints = function (p0, p1) {
            this.p0 = p0;
            this.p1 = p1;
        };
        this.getDist = function (p0, p1) {
            this.setPoints(p0, p1);
            var tmpDist = Math.pow(p0.x - p1.x, 2) + Math.pow(p0.y - p1.y, 2);
            if (isNaN(tmpDist)) {
                this.dist = 0;
            } else {
                this.dist = Math.sqrt(tmpDist);
            }

            return this.dist;
        };
        this.getVectU = function (p0, p1) {
            this.getDist(p0, p1);
            if (this.dist === 0) {
                this.u = new PXE.math.e2DVector(0, 0);
            } else {
                this.u = new PXE.math.e2DVector(
                    (p1.x - p0.x) / this.dist,
                    (p1.y - p0.y) / this.dist
                );
            }
            return this.u;
        };
        this.getVect = function (p0, p1) {
            this.getDist(p0, p1);
            this.v = new PXE.math.e2DVector(
                (p1.x - p0.x),
                (p1.y - p0.y) / this.dist
            );
            return this.v;
        };
        this.getAngle = function (v) {
            this.angle = Math.atan(v.vy / v.vx);
            return this.angle;
        };
    };
    PXE.math.e2D = new PXE.math.e2D();
    
    return PXE;
}(PXE || {}));
    
PXE = (function (PXE) {
    
    PXE.jaws = {};
    
    PXE.jaws.cache = function () {
        this.cacheAnim = [];
        this.cacheImg = [];
        
        this.clear = function () {
            this.cacheAnim = [];
            this.cacheImg = [];
        };
        
        this._toString = function (obj) {
            var str = "{";
            str += "sprite_sheet:"+obj.sprite_sheet+",";
            if ( obj.frame_size !== undefined ) {
                str += "frame_size0:"+obj.frame_size[0]+",";
                str += "frame_size1:"+obj.frame_size[1]+",";
            }
            if (typeof obj.offset === "object"){
                str += "offsetx:"+obj.offset.x+",";
                str += "offsety:"+obj.offset.y+",";
            } else {
                str += "offset:"+obj.offset+",";
            }
            str += "frame_duration:"+obj.frame_duration+",";
            str += "orientation:"+obj.orientation+",";
            if (obj.image !== undefined) { str += "image:"+obj.image+","; }

            str += "}";
            
            return str;
        };

        this.getAddAnim = function (pref,sprt) {
            var obj2Str = this._toString(pref);
            if (this.cacheAnim[obj2Str] === undefined) {
                this.cacheAnim[obj2Str] = new jaws.Animation(pref);
            }
            return this.cacheAnim[obj2Str];
        };
        this.getAddImg = function (pref,sprt) {
            var obj2Str = this._toString(pref);
            if (this.cacheImg[obj2Str] === undefined) {
                this.cacheImg[obj2Str] = new jaws.SpriteSheet(pref);
            }
            return this.cacheImg[obj2Str];
        };
    };
    PXE.jaws.cache = new PXE.jaws.cache();
    
    PXE.jaws.addSprite = function (pref, pars) {
        if (pars.orientation === undefined) { pars.orientation = "right"; }
        if (pars.anchor === undefined) { pars.scale = "left"; }
        if (pars.scale === undefined) { pars.scale = 1; }
        if (pars.ind === undefined) { pars.ind = 0; }
        if (pars.x === undefined) { pars.x = 0; }
        if (pars.x === undefined) { pars.y = 0; }
        if (pars.scale === null || pars.scale === "" || pars.scale === 0) { return false; }
        
        var objSprite = new jaws.Sprite({
            x: pars.x, y: pars.y,
            anchor: pars.anchor,
            scale: pars.sclae
        });
        
        objSprite = PXE.newElem(objSprite);
        
        objSprite = PXE.jaws.setAnimImg(objSprite,"main", pref, pars);

        return objSprite;
    };
    
    PXE.jaws.setAnimImg = function (objSprite, nom, pref, pars) {
        if (typeof pars.ind === 'object') {
            var anim = PXE.jaws.cache.getAddAnim(pref);
            objSprite.addAnim(nom, anim.slice(pars.ind.begin, pars.ind.end));
            objSprite.resetAnim(nom);
        } else {
            if (pars.ind === undefined) { pars.ind = 0; }
            var sprite_sheet = PXE.jaws.cache.getAddImg(pref);
            objSprite.addImg(nom, sprite_sheet.frames[pars.ind]);
            objSprite.setImg(nom);
        }
        
        return objSprite;
    };

    return PXE;
}(PXE || {}));

