let time = 0;
let timeInterval = 0.1;
let repellingForce = 0.1;
class Particle {
    pos;
    vel;
    acc;
    child;
    constructor(pos, vel, acc, size = 5) {
        this.pos=pos;
        this.vel=vel;
        this.acc=acc;
        this.size = size;
    }
    move() {
        this.vel.x+=this.acc.x;
        this.vel.y+=this.acc.y;
        this.pos.x+=this.vel.x;
        this.pos.y+=this.vel.y;
        /*particles.forEach(particle=>{
            let distance = Math.hypot(particle.pos.x-this.pos.x, particle.pos.y-this.pos.y);
            console.log(particle.pos);
            this.pos.x+=repellingForce/distance;
            this.pos.y+=repellingForce/distance;
        })*/
        console.log( -(Math.pow(this.pos.y, 2))-Math.pow(time, 2)+(time*this.pos.x))/*
       if(counter>replicationRate && (this.child==null||this.child==undefined) && ) {
        
        this.child=new Particle({x: -(Math.pow(this.pos.y, 2))-Math.pow(time, 2)+(time*this.pos.x), y: (this.pos.y*time)+(this.pos.x*this.pos.y)}, this.vel, this.acc, this.size)
        particles.push(this.child);
        counter=0;
       }*/
       
    }
    draw(ctx) {
        ctx.fillStyle = "rgba(256,256,256,1)";
        ctx.fillRect(this.pos.x,this.pos.y,this.size,this.size);
    }
    reverseVelocity(axis) {
        if(axis=='x') {
            this.vel.x = -this.vel.x;
        } else if(axis=='y'){
            this.vel.y = -this.vel.y;
        }
    }
    isWithinBounds(x, y, width, height) {
        if(this.pos.x>x && this.pos.y>y && this.pos.x<width && this.pos.y<height) {
            return true;
        } else {
            return false;
        }
    }
    isWithinCanvas() {
    }
}
window.addEventListener('load',
    ()=>{
        let frameRate = 60;
        let updateInterval = setInterval(()=>{Update()}, 1000/);
    }
)
let x = 0;
let y=0;
let particles = [];
particles.push(new Particle({x: 10, y: 10}, {x: 10, y: 10}, {x: 0, y: 0}));
let counter = 0;
let replicationRate = 1000;
function Update() {
    let canvas = [...document.getElementsByTagName("canvas")][0];
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = "rgba(0,0,0,0.1)"
    ctx.fillRect(0,0, canvas.width, canvas.height);
    
    particles.forEach(particle=>{
        particle.move();
        particle.draw(ctx);
        if(particle.pos.x>canvas.width || particle.pos.x<0) {
            particle.reverseVelocity('x');
        }
        if(particle.pos.y>canvas.height || particle.pos.y<0) {
            particle.reverseVelocity('y');
        }
    });
    
    counter++;
    if(time>(replicationRate*2)&&timeInterval>0) {
        timeInterval=-1;
    } else if(time<-(replicationRate*2)&&timeInterval<0){
        timeInterval=1;
    }
    //console.log(timeInterval)
    time+=timeInterval;
}

//update
