let canvas;
var pg;

const res = 1400;
var mm;

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
  
}

function setup(){
    mm = min(windowWidth, windowHeight);
    pixelDensity(1);
    canvas = createCanvas(mm, mm);
    imageMode(CENTER);
    
    randomSeed(globalseed);
    noiseSeed(fxrand()*100000);

    pg = createGraphics(res, res);
    pg.noStroke();
    pg.colorMode(HSB, 100);
    pg.imageMode(CENTER);
    colorMode(HSB, 100);
    imageMode(CENTER);
    
    initDrawing();
    showall();
}

function initDrawing(){
    pg.push();
    pg.background(0,0,0);
    pg.fill(random(100), 60, 80);
    pg.ellipse(res/2, res/2, res*.15, res*.15)
    pg.pop();
}


function showall(){
    background(0, 0, 30);
    image(pg, mm/2, mm/2, mm-18, mm-18);
}

function draw(){

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