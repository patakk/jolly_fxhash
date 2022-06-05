let canvas;
var pg;
var svgout;
var mask;
var blurpass1;
var blurpass2;
var effectpass;

let helvetica;
let effect;
let blurH;
let blurV;

var envelope, osc;
var envelope2, osc2;

var cl1, cl2, cl3;

var heads = [];
var ofrq;
let mic;
let fft;
let oscCount = 10;
let allOscs = [];
let minFreq = 100;
let maxFreq = 1000;

var oscillators = [];
var panners = [];
var mm;
var res = 1400;
var globalseed = fxrandom(1000000);

function fxrandom(a, b){
    if(a && b){
        return a + fxrand()*(b-a);
    }
    if(a && !b){
        return fxrand()*a;
    }
    if(!a && !b){
        return fxrand();
    }
}

function preload() {
    effect = loadShader('assets/effect.vert', 'assets/effect.frag');
    blurH = loadShader('assets/blur.vert', 'assets/blur.frag');
    blurV = loadShader('assets/blur.vert', 'assets/blur.frag');
}

function setup(){
    mm = min(windowWidth, windowHeight);
    pixelDensity(1);
    canvas = createCanvas(mm, mm, WEBGL);
    imageMode(CENTER);
    
    randomSeed(globalseed);
    noiseSeed(fxrand()*100000);

    pg = createGraphics(res, res, WEBGL);
    pg.noStroke();
    pg.colorMode(HSB, 100);
    //pg.strokeJoin(ROUND);
    pg.ortho(-res/2, res/2, -res/2, res/2, 0, 4444);
    mask = createGraphics(res, res, WEBGL);
    mask.noStroke();
    mask.ortho(-res/2, res/2, -res/2, res/2, 0, 4444);
    //mask.strokeJoin(ROUND);
    colorMode(HSB, 100);

    blurpass1 = createGraphics(res*2, res*2, WEBGL);
    blurpass2 = createGraphics(res*2, res*2, WEBGL);
    effectpass = createGraphics(res*2, res*2, WEBGL);
    blurpass1.noStroke();
    blurpass2.noStroke();
    effectpass.noStroke();
    imageMode(CENTER);
    //noCursor();

    //envelope.play(osc);

    cl1 = color(0, 0, 100);
    cl2 = color(0, 0, 10);

    //generateHeads(20, 31114);
    //frameRate(5);
    
    background(100);
    generateHeads(round(fxrandom(59, 88)*2), round(random(300, 200000)));
    drawHeads();
    showall();
    showall();
    fxpreview();
}

var s = "HELLO";
var binsum = 0;
var timer = -1;
var num = 20;

function showall(){
    background(14);
    pg.push();
    //pg.scale(0.8);
    pg.pop();
    //pg.line(0,0,mouseX-width/2,mouseY-height/2);

    blurH.setUniform('tex0', pg);
    blurH.setUniform('tex1', mask);
    blurH.setUniform('texelSize', [1.0/res, 1.0/res]);
    blurH.setUniform('direction', [1.0, 0.0]);
    blurH.setUniform('u_time', frameCount*0+globalseed*.01);
    blurH.setUniform('amp', .13);
    blurH.setUniform('seed', (globalseed*.12134)%33.);
    blurpass1.shader(blurH);
    blurpass1.quad(-1,-1,1,-1,1,1,-1,1);
    
    blurV.setUniform('tex0', blurpass1);
    blurH.setUniform('tex1', mask);
    blurV.setUniform('texelSize', [1.0/res, 1.0/res]);
    blurV.setUniform('direction', [0.0, 1.0]);
    blurV.setUniform('u_time', frameCount*0+globalseed*.01);
    blurV.setUniform('amp', .07);
    blurV.setUniform('seed', (globalseed*.12134)%33.);
    blurpass2.shader(blurV);
    blurpass2.quad(-1,-1,1,-1,1,1,-1,1);

    effect.setUniform('tex0', blurpass2);
    effect.setUniform('tex1', pg);
    effect.setUniform('u_resolution', [res, res]);
    effect.setUniform('u_mouse', [res, res]);
    effect.setUniform('u_time', frameCount);
    effect.setUniform('incolor', [random(.99, 1.), random(.99, 1.), .99, 1.]);
    effect.setUniform('seed', globalseed);
    effectpass.shader(effect);
    effectpass.quad(-1,-1,1,-1,1,1,-1,1);
  
    // draw the second pass to the screen
    image(effectpass, 0, 0, mm-18, mm-18);

}

function draw(){

    /*let bins = fft.analyze();
    binsum = 0;
    for (let i = bins.length-10; i < bins.length; i++) {
        let val = bins[i];
        if(val>3 && timer < 0){
            binsum += val;
        }
    }
    if(binsum>50){
        generateHeads();
        timer = frameRate();
    }
    timer--;*/
    
/*effect.setUniform('u_tex', pg);
    effect.setUniform('u_resolution', [width, height]);
    effect.setUniform('u_mouse', [width, height]);
    effect.setUniform('u_time', frameCount);

    shader(effect);
    fill(255);
    quad(-1,-1,1,-1,1,1,-1,1);*/
    
    //vectorizeHeads();
}

function genHead(x0, y0, w0, h0, seed){

    w = w0;
    h = h0;

    // HEAD
    var lim = radians(random(15, 34));
    headVerts = [];
    headVertsF = [];
    eyeVertsL = [];
    eyeVertsR = [];
    eyeVertsLP = [];
    eyeVertsRP = [];
    eyeVertsLB = [];
    eyeVertsRB = [];
    earVertsL = [];
    earVertsR = [];
    noseVerts = [];
    mouthVerts = [];
    bodyVerts = [];
    bodyVertsF = [];
    var cx = -11110;
    var cy = -11110;
    var off = random(1000);
    var ww = w/2*random(1.06, 1.25);
    var hh = h/2;
    var ww0 = w/2*random(1.06, 1.25);
    var hh0 = h/2;
    var namp = rnoise(seed*3.14, 22, 23)*1.4;
    var frq = 0.01;
    var namp2 = rnoise(seed*41.14, 4, 6);
    var frq2 = 0.07;
    var fh = random(1.5, 2.1);
    var th = random(1.5, 2.15);
    var nh = random(1.3, 1.7);
    var chc = random(3);
    chc = .7;
    var eyey = random(-h/12, -h/6);
    var earseeds = [];
    var bodyseeds = [];
    var timer = 0;
    var chinthresh = random(25, 35);
    var chintrans = random(20, 40);
    var chinoffx = random(0, 0);
    var chinoffy = random(-12, 12);
    for(var a = 0; a < 2.15*PI+lim; a += 2*PI/200.){
        hh = h/2;
        var y = hh * sin(a+off);
        if(chc < 1){
            if(y>0)
                ww = ww0 + 0.6*(w/2*abs(map(abs(y), 0, hh, 1, nh/1.6)) - ww0);
            else
                ww = ww0 + 0.6*(w/2*abs(map(abs(y), 0, hh, 1, nh)) - ww0);
        }
        else if(chc < 2){
            //ww = ww + 0.01*(w/2*abs(map(y, -hh, hh, 1, fh)) - ww);
            ww = ww0 + 0.3*(w/2*abs(map(y, -hh, hh, th, 1)) - ww0);
        }
        else{
            ww = ww0 + 0.3*(w/2*abs(map(y, -hh, hh, th, 1)) - ww0);
        }
        //ww = ww*abs(map(abs(y), 0, hh, 1, 1.5));
        var x = ww * cos(a+off);
        cx = cx + .04*(x - cx);
        cy = cy + .04*(y - cy);
        if(a == 0){
            cx = x*.8;
            cy = y*.8;
        }
        namp2 = 3 + 4*power(noise((x0+cx)*.01, (y0+cy)*.01, 911.131), 5);
        frq2 = 0.06 + 0.071*power(noise((x0+cx)*.01, (y0+cy)*.01, 83081.08113), 5);
        var dx = cx + namp * (-.5 + power(noise(seed+cx*frq+width/2, 1932.314), 2)) + namp2 * (-.5 + power(noise(seed+cx*frq2+width/2, 1332.724), 2));
        var dy = cy + namp * (-.5 + power(noise(seed+cy*frq+height/2, 222.8623), 2)) + namp2 * (-.5 + power(noise(seed+cy*frq2+height/2, 112.5623), 2));
        if(cy > chinthresh){
            var ddy = cy - chinthresh;
            if(ddy < chintrans){
                dy = dy - chinoffy*power(ddy/chintrans, 3);
            }
            else{
                dy = dy - chinoffy;
            }
        }
        if(abs(dy-eyey) < 8 && earseeds.length < 2){
            if(earseeds.length == 0){
                earseeds.push([dx*1.05, dy])
            }
            else{
                if(sqrt((dx-earseeds[0][0])*(dx-earseeds[0][0])+(dy-earseeds[0][1])*(dy-earseeds[0][1])) > w/2){
                    earseeds.push([dx*1.05, dy])
                }
            }
        }
        
        if(abs(dy-eyey-10) < 8 && bodyseeds.length < 2){
            if(bodyseeds.length == 0){
                bodyseeds.push([dx, dy])
            }
            else{
                if(sqrt((dx-bodyseeds[0][0])*(dx-bodyseeds[0][0])+(dy-bodyseeds[0][1])*(dy-bodyseeds[0][1])) > w/2){
                    bodyseeds.push([dx, dy])
                }
            }
        }
        timer--;
        headVerts.push([dx, dy])
        headVertsF.push([dx*.93, dy*.93])
    }

    //EYES
    eyex = (random(-w/4, w/4))*1.2;
    //eyex = (rnoise(seed, -w/4, w/4))*1.2;
    namp = random(4, 12);
    frq = 0.4;5
    off = random(300);
    lim = radians(random(33, 34));
    var eyeSpacing = map(abs(eyex), 0, w/4, 0, 1);
    eyeSpacing = map(pow(eyeSpacing, 2), 0, 1, w/4, w/8);
    eyeSpacing = random(w/4, w/6);
    var eyew = random(6, 8)*w0/70; // / (abs(eyex*.5)+1);
    var eyeh = random(2, 4)*2*w0/70;
    pupiloffx = random(eyew/2, eyew/2)*0;
    pupiloffy = -random(eyeh/2, eyeh/2)*3;9
    var vec1 = createVector(0, 0);
    var vec2 = createVector(x0, y0);
    var vec = p5.Vector.sub(vec2, vec1);
    vec.normalize();
    vec.mult(-1);
    pupiloffx = vec.x*eyew;
    pupiloffy = vec.y*eyeh/2;
    for(var a = 0; a < 2*PI+lim; a += 2*PI/20){
        var dx = eyeSpacing+eyex + eyew * sin(a+off) + namp * (-.5 + power(noise(a*frq, 3332.44), 2));
        var dy = eyey + eyeh * cos(a+off) + namp * (-.5 + power(noise(a*frq, 142.5623), 2));
        //if(eyeSpacing+eyex < w/3)
            eyeVertsR.push([dx, dy])
    }
    eyeVertsR.push([eyex+eyeSpacing-eyew, eyey]);
    eyeVertsR.push([eyex+eyeSpacing-eyew+3, eyey+5]);
    eyeVertsR.push([eyex+eyeSpacing-eyew+13+random(-2, 2), eyey+7+random(-2, 2)]);
    for(var a = 0; a < 4*PI+lim; a += 2*PI/20){
        var dx = eyeSpacing+eyex+pupiloffx + 2 * sin(a+off) + namp/2 * (-.5 + power(noise(a*frq, 3332.44), 2));
        var dy = eyey+pupiloffy + 2 * cos(a+off) + namp/2 * (-.5 + power(noise(a*frq, 142.5623), 2));
        //if(eyeSpacing+eyex < w/3)
            eyeVertsRP.push([dx, dy])
    }

    eyew = random(6, 8); // / (abs(eyex*.5)+1);
    eyeh = random(2, 4);
    off = random(300);
    lim = radians(random(33, 34));
    for(var a = 0; a < 2*PI+lim; a += 2*PI/20){
        var dx = -eyeSpacing+eyex + eyew * sin(a+off) + namp * (-.5 + power(noise(a*frq, 113432.44), 2));
        var dy = eyey + eyeh * cos(a+off) + namp * (-.5 + power(noise(a*frq, 14452.21323), 2));
        //if(-eyeSpacing+eyex > -w/3)
            eyeVertsL.push([dx, dy])
    }
    eyeVertsL.push([eyex-eyeSpacing+eyew, eyey]);
    eyeVertsL.push([eyex-eyeSpacing+eyew-3, eyey+5]);
    eyeVertsL.push([eyex-eyeSpacing+eyew-13+random(-2, 2), eyey+7+random(-2, 2)]);
    for(var a = 0; a < 4*PI+lim; a += 2*PI/20){
        var dx = -eyeSpacing+eyex+pupiloffx + 2 * sin(a+off) + namp/2 * (-.5 + power(noise(a*frq, 113432.44), 2));
        var dy = eyey+pupiloffy + 2 * cos(a+off) + namp/2 * (-.5 + power(noise(a*frq, 14452.21323), 2));
        //if(-eyeSpacing+eyex > -w/3)
            eyeVertsLP.push([dx, dy])
    }

    
    //NOSE
    var nv = [];
    var ny1 = eyey;
    var ny2 = 0;
    var nx1 = eyex+eyeSpacing-eyew;
    var nx2 = eyex+eyeSpacing-eyew-random(4, 14);
    namp = random(25,36);
    frq = 0.06;
    if(eyex < 0){
        nx1 = eyex-eyeSpacing+eyew;
        nx2 = eyex-eyeSpacing+eyew+random(4, 14);
    }
    for(var k = 0; k < 10; k++){
        var dx = eyex+eyeSpacing-eyew;
        var dy = lerp(ny1, ny2, k/(10.-1));
        if(eyex < 0){
            dx = eyex-eyeSpacing+eyew;
        }
        dx += k/10. * namp * (-.5 + power(noise(x0+y0+k*frq, 32.44), 2));
        dy += k/10. * namp * (-.5 + power(noise(x0+y0+k*frq, 42.223), 2)); 
        noseVerts.push([dx, dy]);
    }
    for(var k = 0; k < 10; k++){
        var dx = lerp(nx1, nx2, k/(10.-1));
        var dy = k/10.*3;
        noseVerts.push([dx, dy]);
    }

    //MOUTH
    mouthx = eyex * random(0.6, 1.);
    namp = random(4, 12);
    frq = 0.4;
    off = random(2*PI);
    lim = radians(random(20, 30));
    var mouthw = random(6, 8);
    var mouthh = random(1, 3);
    var mouthy = random(h/12, h/4);
    for(var a = 0; a < 2*PI+lim; a += 2*PI/20){
        var dx = mouthx + mouthw * sin(a+off) + namp * (-.5 + power(noise(a*frq, x0+y0, 3332.44), 2));
        var dy = mouthy + mouthh * cos(a+off) + namp * (-.5 + power(noise(a*frq, x0+y0, 1423.5623), 2));
        mouthVerts.push([dx, dy])
    }

    //BODY
    bodyx = eyex * random(0.6, 1.);
    namp = random(4, 12);
    frq = 0.4;
    off = random(2*PI);
    lim = radians(random(20, 30));
    var bodyw = random(6, 8);
    var bodyh = random(60, 80);
    var bodyy = random(h/12, h/4);
    if(bodyseeds.length == 2){
        var x1 = bodyseeds[0][0];
        var y1 = bodyseeds[0][1];
        var x2 = bodyseeds[1][0];
        var y2 = bodyseeds[1][1];

        if(x1>x2){
            x2 = x1+x2;
            x1 = x2-x1;
            x2 = x2-x1;
            y2 = y1+y2;
            y1 = y2-y1;
            y2 = y2-y1;
        }

        var xc = x1;
        var yc = y1;

        for(var it = 0; it < 111; it++){
            xc = xc - 6*(111-it)/111.*power(noise(it*.1,x0), 4);
            yc = yc + 6;
            dx = xc;
            dy = yc;
            //bodyVerts.push([dx, dy])
            //bodyVertsF.push([dx*.93, dy*.93])
        }
        
        xc = x2;
        yc = y2;
        var tv = [];
        var tvF = [];
        for(var it = 0; it < 111; it++){
            xc = xc - 4*(111-it)/111.*power(noise(it*.1,x0+31.13+y0), 4);
            yc = yc + 6;
            dx = xc;
            dy = yc;
            tv.push([dx, dy])
            tvF.push([dx*.93, dy*.93])
        }
        //bodyVerts = bodyVerts.concat(tv.reverse());
        //bodyVertsF = bodyVertsF.concat(tvF.reverse());
    }

    
    //EARS
    earoff = eyex*1.;
    earSpacing = random(w/2, w/2);
    namp = random(4, 12);
    frq = 0.4;
    off = random(300);
    lim = radians(random(33, 34));
    var earw = random(1, 3);
    var earh = random(6, 8);
    var eary = eyey*0.9;
    if(earseeds.length == 1){
        for(var a = 0; a < 2*PI+lim; a += 2*PI/20){
            var dx = earseeds[0][0] + earw * sin(a+off) + namp * (-.5 + power(noise(a*frq, 3332.44), 2));
            var dy = earseeds[0][1] + earh * cos(a+off) + namp * (-.5 + power(noise(a*frq, 142.5623), 2));
            if(eyex > 0)
                earVertsL.push([dx, dy])
        }
    }
    if(earseeds.length == 2){
        for(var a = 0; a < 2*PI+lim; a += 2*PI/20){
            var dx = earseeds[1][0] + earw * sin(a+off) + namp * (-.5 + power(noise(a*frq, 3332.44), 2));
            var dy = earseeds[1][1] + earh * cos(a+off) + namp * (-.5 + power(noise(a*frq, 142.5623), 2));
            if(eyex < 0)
                earVertsR.push([dx, dy])
        }
    }
    //EARS
    eyeboff = eyex;
    eyebSpacing = eyeSpacing;
    namp = random(4, 12);
    frq = 0.4;
    off = random(300);
    lim = radians(random(33, 34));
    var eyebw = random(6, 10);
    var eyebh = random(1, 6);
    var eyeby = eyey*random(1.2, 1.8);
    for(var a = 0; a < 2*PI+lim; a += 2*PI/20){
        var dx = eyeboff + eyebSpacing + eyebw * sin(a+off) + namp * (-.5 + power(noise(a*frq, 3332.44), 2));
        var dy = eyeby + .1*eyebh * cos(a+off) + namp * (-.5 + power(noise(a*frq, 142.5623), 2));
        eyeVertsLB.push([dx, dy])
    }
    for(var a = 0; a < 2*PI+lim; a += 2*PI/20){
        var dx = eyeboff - eyebSpacing + eyebw * sin(a+off) + namp * (-.5 + power(noise(a*frq, 3332.44), 2));
        var dy = eyeby + .1*eyebh * cos(a+off) + namp * (-.5 + power(noise(a*frq, 442.5623), 2));
        eyeVertsRB.push([dx, dy])
    }

    return {
        'head': headVerts,
        'headF': headVertsF,
        'nose': noseVerts,
        'mouth': mouthVerts,
        'body': bodyVerts,
        'bodyF': bodyVertsF,
        'eyeL': eyeVertsL,
        'eyeR': eyeVertsR,
        'eyeLP': eyeVertsLP,
        'eyeRP': eyeVertsRP,
        'eyeLB': eyeVertsLB,
        'eyeRB': eyeVertsRB,
        'earL': earVertsL,
        'earR': earVertsR,
        'x0': x0,
        'y0': y0,
        'w0': w0,
        'h0': h0,
    }
}

var wheads = [];

function rnoise(s, v1, v2){
    return v1 + (v2-v1)*((power(noise(s), 3)*1)%1.0);
}

function generateHeads(num, seed){
    heads = [];
    //noiseSeed(round(random(millis()*314.1314131)));
    //randomSeed(round(random(millis()*414.2222)));
    let spread = fxrandom(res/2, res*1.0);
    spread = map(pow(fxrand(), 1), 0, 1, .73, 1.0)*res;
    allpos = [];
    var maxx = -100000;
    var maxy = -100000;
    var minx = 100000;
    var miny = 100000;
    var rsca = 1.3;
    var hfrq = fxrandom(0.02, 0.1);
    for(var k = 0; k < num; k++){
        var w = random(54, 190);
        var h = w*random(2.4, 6.9);
        h = w*random(1.4, 1.9);
        w = rnoise(seed+k*31.31, 46, 47)*0 + 70 - 30*k/num + random(-10, 10);
        h = w*rnoise(seed+k*31.31+1231.311, 1.2, 1.4);
        w = rnoise(seed+k*31.31, 46, 133)*rsca;
        h = w*rnoise(seed+k*31.31+1231.311, 1.2, 1.4);
        var oo = 0;
        if(k > num/2)
            oo = 231.411;
        var x, y;
        x = 0.61*res*(-.5+power(noise( oo+k*.33, 1312.3114, oo+frameCount*0.025, oo),3));
        y = -0.11*res*(-.5+power(noise( oo+k*.33, 224.666, oo+frameCount*0.0125, oo+21.31),3)) - h/2 + 94;
        x = spread*(-.5+power(noise( oo+k*hfrq, 1312.3114, oo+frameCount*0.025, oo),3));
        y = spread*(-.5+power(noise( oo+k*hfrq, 224.666, oo+frameCount*0.0125, oo+21.31),3)) - h/2 + 94;
        if(random(100) > 150){
            y = 266*(-.5+power(noise( oo+k*.08, 224.666, oo+frameCount*0.0125, oo+21.31),3)) - h/2 + 94;
        }
        //if(x-w < -mm/2 || x+w > +mm/2 || y-h < -mm/2 || y+h > +mm/2)
        //    continue;
        allpos.push([x, y, w, h, k])
        if(x < minx) minx = x;
        if(y < miny) miny = y;
        if(x > maxx) maxx = x;
        if(y > maxy) maxy = y;
    }

    var ccx = (minx+maxx)/2;
    var ccy = (miny+maxy)/2;

    for(var k = 0; k < allpos.length; k++){
        heads.push(genHead(allpos[k][0]-ccx,allpos[k][1]-ccy,allpos[k][2],allpos[k][3],allpos[k][4]));
    }
    
    var mw = 0.26*min(res,res);
    for(var k = 0; k < num; k++){
        var w = random(54, 90);
        var h = w*random(2.4, 6.9);
        h = w*random(1.4, 1.9);
        w = rnoise(seed+k*31.31, 54, 90)
        h = w*rnoise(seed+k*31.31+1231.311, 1.4, 1.9);
        var oo = 0;
        if(k > num/2)
            oo = 0*231.411;
        var x, y;
        x = 0.5*res*(-.5+power(noise( oo+k*.03, 1312.3114, oo+frameCount*0.025, oo),3));
        //x = 200*sin(k*.15);
        //x = map(k%11/10.0, 0, 1, 0, 1);
        //x = map(pow(x, 1), 0, 1, -200, 200);
        y = k*5 - 200 + random(-14,14);
        if(res < res){
            //x = 0.75*res*(-.5+power(noise( oo+k*.28, 1312.3114, oo+frameCount*0.025),3));
            //y = 0.24*res*(-.5+power(noise( oo+k*.28, 224.666, oo+frameCount*0.0125),3)) - h/2;
        }
        if(dist(x,y*2,0,0) < mw){
        }
        //heads.push(genHead(res/2*0+x, res/2*0+y, w, h, k));
    }

    var k = 0;
    var mw = random(0.1, 0.34)*min(res,res);
    num = mw;
    while(k < num){
        var x = random(-mw, mw);
        var y = random(-mw, mw);
        var w = random(46, 77);
        var h = w*random(2.4, 6.9);
        h = w*random(1.2, 1.4);
        if(dist(x,y,0,0) < mw * map(pow(noise(x*.07, y*.07), 5), 0, 1, .5, 1)){
            //heads.push(genHead(x, y, w, h, k));
            k++
        }
    }

    //wheads.push(genHead(0, 0, 60, 90))
    //wheads.push(genHead(0, 0, 60, 90))
}


function drawHeads(){
    mask.clear();
    mask.background(0);
    pg.clear();
    pg.background(cl1);
    pg.push();
    //pg.rotateY(mouseX/res*2*PI)
    // HEAD
    for(var k = 0; k < heads.length; k++){
        var fff = 2 + k%253;
        var xx0 = heads[k].x0;
        var yy0 = heads[k].y0;

        pg.push();
        var yyy = heads[k].headF[0][1];
        if(random(100) < 90)
            pg.translate(0, 0, -heads[k].w0*1+random(-20, 20));
        else{}
        //pg.rotateZ(radians(2229*(-.5 + power(noise(k*113.211, 134.284), 4))));
        var angle = radians(77*(-.5 + power(noise(k*113.211, 134.284), 4)));

        var v = createVector(mouseX-res/2-xx0, mouseY-res/2-yy0);
        v.normalize();
        v.mult(5);
        v.y *= 0.5;

        pg.noStroke();
        pg.fill(0, 100, heads[k].headF[0][1]/res*200);
        pg.fill(3+2*(-.5 + power(noise(k*33.211, 133414.884), 4)), 33, 85 + 10*(-.5 + power(noise(k*532.41, 1314.884), 4)));
        pg.fill(cl1);
        mask.noStroke();
        mask.fill(k*3);
        Object.entries(heads[k]).forEach(([key, value]) => {
            if(typeof(value) == 'object' && (key == 'headF' || key == 'bodyF')){
                mask.beginShape();
                pg.beginShape();
                var offx = 20*(-.5 + power(noise(k*13.41, 874.884), 4))*0;
                var offy = 20*(-.5 + power(noise(k*13.41, 314.411), 4))*0;
                for(var j = 0; j < heads[k][key].length; j++){
                    var xx = heads[k][key][j][0];
                    var yy = heads[k][key][j][1];
                    var x = xx*cos(angle) - yy*sin(angle);
                    var y = xx*sin(angle) + yy*cos(angle);
                    var offxx = 1*(-.5 + power(noise(j*.01, 345.2284), 4))*0;
                    var offyy = 1*(-.5 + power(noise(j*.01, 514.1121), 4))*0;
                    pg.vertex(x+offx+offxx+xx0, y+offy+offyy+yy0);
                    mask.vertex(x+offx+offxx+xx0, y+offy+offyy+yy0);
                }
                mask.endShape();
                pg.endShape();
            }
        });

        pg.noFill();
        pg.stroke(cl2);
        pg.stroke(0, 0, random(20,40))
        pg.strokeWeight(2);
        pg.strokeWeight(1.64+.68*power(noise(k*1.314+globalseed),4));
        Object.entries(heads[k]).forEach(([key, value]) => {
            if(typeof(value) == 'object' && key != 'headF' && key != 'bodyF'){
                pg.beginShape();
                for(var j = 0; j < heads[k][key].length; j++){
                    var xx = heads[k][key][j][0];
                    var yy = heads[k][key][j][1];
                    var x = xx*cos(angle) - yy*sin(angle);
                    var y = xx*sin(angle) + yy*cos(angle);
                    if(noise(j*0.331,k) > .79){
                        pg.vertex(x+xx0+random(-.5,.5)*0, y+yy0+random(-.5,.5)*0);
                    }
                    else{
                        pg.vertex(x+xx0+random(-.5,.5)*0, y+yy0+random(-.5,.5)*0);
                    }
                }
                pg.endShape();
            }
         });
        pg.pop();
    }
    pg.pop();
    
}

function windowResized() {
    mm = min(windowWidth, windowHeight);
    resizeCanvas(mm, mm);
    showall();
}

function power(p, g) {
    if (p < 0.5)
        return 0.5 * pow(2*p, g);
    else
        return 1 - 0.5 * pow(2*(1 - p), g);
}

var zas = 0;
var started = false;

var autoPanner;
// route an oscillator through the panner and start it
var oscillator;

function mouseClicked(){
    return;
    globalseed = random(1000000);
    Tone.start();
    //getAudioContext().resume();
    //osc.start();
    //osc2.start();
    //envelope.play(osc);
    //envelope.play(osc2);
    zas = (zas+1)%2;

    const now = Tone.now()
    // trigger the attack immediately
   
    var N = 3;
    if(!started){
        started = true;
        
        for(var k = 0; k < 10; k++){
            const autoPanner = new Tone.AutoPanner("16n").toDestination();
            // route an oscillator through the panner and start it
            const oscillator = new Tone.Oscillator(random(100, 1000), "sine").toDestination();
            panners.push(autoPanner);
            oscillators.push(oscillator);
        }
    }else{
        for(var k = 0; k < 10; k++){
            if(k <= N){
                panners[k].start();
                oscillators[k].frequency.value = random(100, 1000);
                //oscillators[k].start();
            }
            else{
                panners[k].stop();
                //oscillators[k].stop();
            }
        }
    }
    generateHeads(20, random(10000));
}
function keyPressed(){
    return;
    globalseed = random(1000000);

    Tone.start();
    //getAudioContext().resume();

    if(keyCode == 83 || keyCode == 115){ // 's'
    }

    if(keyCode-48 >=0 && keyCode-48 <= 9){
        num = (keyCode-48);
        if(num <= 3)
            num = num;
        else if(num == 4)
            num = 7;
        else if(num == 5)
            num = 12;
        else if(num == 6)
            num = 15;
        else if(num == 7)
            num = 20;
        else if(num == 8)
            num = 44;
        else if(num == 9)
            num = 255/3;

        var N = 2 + (keyCode-48-1)/4.;
        if(!started){
            started = true;
            for(var k = 0; k < 10; k++){
                const autoPanner = new Tone.AutoPanner("6n").toDestination();
                // route an oscillator through the panner and start it
                const oscillator = new Tone.Oscillator(random(100, 333), "sine").connect(autoPanner);
                panners.push(autoPanner);
                oscillators.push(oscillator);
            }
        }else{
            for(var k = 0; k < 10; k++){
                if(k < N){
                    //panners[k].start();
                    oscillators[k].frequency.value = map(pow(random(1), 2), 0, 1, 100, 333);
                    oscillators[k].volume.value = 1./N*.1;
                    //oscillators[k].start();
                }
                else{
                    panners[k].stop();
                    oscillators[k].stop();
                }
            }
        }
        //getAudioContext().resume();
        //osc.start();
        //osc2.start();
        //envelope.play(osc);
        //envelope.play(osc2);
        zas = (zas+1)%2;
        // trigger the attack immediately
    

        //getAudioContext().resume();
        
        //osc.start();
        //osc2.start();
        //envelope.play(osc);
        //envelope.play(osc2);

        generateHeads(num, 311413);
    }
}