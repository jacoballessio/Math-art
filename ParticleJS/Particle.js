//create a particle class
function random(min, max) {
    return Math.random() * (max - min) + min;
}
class Particle {
  constructor(x, y, radius, color, particleSystem) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = {
      x: random(-1, 1),
      y: random(-1, 1)
    };
    this.acceleration = {
      x: 0,
      y: 0
    };
    this.particleSystem = particleSystem;
  }
    //draw the particle 
    draw() {
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.collisionDetection();
        this.collisionDetectionWalls();
        this.draw();
    }
    
    //collision detection
    collisionDetection() {
        let length = this.particleSystem.particles.length;
        for (let i = 0; i < length; i++) {
            let other = this.particleSystem.particles[i];
            if (other != this) {
                let dx = this.x - other.x;
                let dy = this.y - other.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < this.radius + other.radius) {
                    this.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
                    other.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
                }
            }
        }
    }

    //detect collision with the walls
    collisionDetectionWalls() {
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext(
            '2d'
        );
        let width = canvas.width;
        let height = canvas.height;

        if (this.x + this.radius > width || this.x - this.radius < 0) {
            this.velocity.x = -this.velocity.x;
        }

        if (this.y + this.radius > height || this.y - this.radius < 0) {
            this.velocity.y = -this.velocity.y;
        }
    }
    
    isZip() {
        return false;
    }
}


//create a particle system
class ParticleSystem {
    constructor(x, y, radius) {
        this.particles = [];
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.particles.push(new Particle(this.x, this.y, this.radius, "white", this));
    }
    //add a particle to the system
    addParticle(particle) {
        this.particles.push(particle?particle:new Particle(this.x+random(-100,100), this.y+random(-100,100), this.radius, "white", this.canvas, this.ctx, this));
    }
    //update the particle system
    update() {
        //clear screen
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');

        //fill the rect so that there are tracers
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update();
        }
        //set each particle to a rainbow color based on its position
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].color = "hsl(" + (this.particles[i].x / canvas.width * 360) + ", 100%, 50%)";
        }
    }


    //get distance between two particles
    getDistance(p1, p2) {
        let xDistance = p1.x - p2.x;
        let yDistance = p1.y - p2.y;
        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    }

    closestParticle(particleA) {
        //return the closest particle to the particleA
        //make sure it's not a zip particle
        //use isZip() method
        let closest = null;
        let closestDistance = Infinity;
        for (let i = 0; i < this.particles.length; i++) {
            let distance = this.getDistance(particleA, this.particles[i]);
            if (distance < closestDistance && !this.particles[i].isZip()) {
                closest = this.particles[i];
                closestDistance = distance;
            }
        }
        //if null, set to a random particle
        if (closest == null) {
            closest = this.particles[Math.floor(Math.random() * this.particles.length)];
        }
        return closest;
    }
}


//create a new type of particle
//this is a wiggle particle
class WiggleParticle extends Particle {
    constructor(x, y, radius, color, particleSystem) {
        super(x, y, radius, color, particleSystem);
        this.wiggle = 0;
    }
    update() {
        this.wiggle += 0.1;
        this.x += Math.sin(this.wiggle);
        this.y += Math.cos(this.wiggle);
        super.update();
    }

}
//create a particle system and draw to 
//the canvas


//make a particle that zips between other particles
class ZipParticle extends Particle {
//a zip particle takes in a particle system, and gets the closest particle
    constructor(x, y, radius, color, particleSystem) {
        super(x, y, radius, color);
        this.particleSystem = particleSystem;
        this.closest = this.particleSystem.closestParticle(this);
        // this.velocity = {
        //     x: (this.closest.x - this.x) / 100,
        //     y: (this.closest.y - this.y) / 100
        // };
        //fast
        this.velocity = {
            x: (this.closest.x - this.x) / 100,
            y: (this.closest.y - this.y) / 100
        };
    }
    update() {
        //interpolate towards the closest particle
        this.x += (this.closest.x - this.x) * 0.01;
        this.y += (this.closest.y - this.y) * 0.01;
        super.update();
    }
    isZip() {
        return true;
    }

}

//attracter particle
class AttracterParticle extends Particle {
    constructor(x, y, radius, color, particleSystem) {
        super(x, y, radius, color);
        this.particleSystem = particleSystem;
        this.closest = this.particleSystem.closestParticle(this);
        this.velocity = {
            x: (this.closest.x - this.x) / 100,
            y: (this.closest.y - this.y) / 100
        };
    }
    update() {
        //interpolate towards the closest particle
        this.x += (this.closest.x - this.x) * 0.01;
        this.y += (this.closest.y - this.y) * 0.01;
        this.attract();
        super.update();
    }
    //attract all particles with a fall off
    attract() {
        for (let i = 0; i < this.particleSystem.particles.length; i++) {
            let distance = this.particleSystem.getDistance(this, this.particleSystem.particles[i]);
            let force = 10000000 / distance;
            this.particleSystem.particles[i].velocity.x += (this.x - this.particleSystem.particles[i].x) / force;
            this.particleSystem.particles[i].velocity.y += (this.y - this.particleSystem.particles[i].y) / force;
        }
    }
    
}


//add a particle that is repulsive to all other particles
//but attactive when particles are a certain distance away
class AttractorRepulsorParticle extends Particle {
    constructor(x, y, radius, color, particleSystem) {
        super(x, y, radius, color);
        this.particleSystem = particleSystem;
        this.closest = this.particleSystem.closestParticle(this);
        this.velocity = {
            x: (this.closest.x - this.x) / 100,
            y: (this.closest.y - this.y) / 100
        };
    }
    update() {
        //interpolate towards the closest particle
        this.x += (this.closest.x - this.x) * 0.01;
        this.y += (this.closest.y - this.y) * 0.01;
        this.attract();
        this.repell();
        super.update();
    }

    //attract all particles with a fall off
    attract() {
        for (let i = 0; i < this.particleSystem.particles.length; i++) {
            let distance = this.particleSystem.getDistance(this, this.particleSystem.particles[i]);
            if(distance > 100) {
                //equalize the velocity
                this.particleSystem.particles[i].velocity.x = (this.x - this.particleSystem.particles[i].x) / 100;
                this.particleSystem.particles[i].velocity.y = (this.y - this.particleSystem.particles[i].y) / 100;

            }
        }
    }
    //the closer two particles are, the more repulsive they are
    //the closer they are, the more they repulse
    repell() {
        for (let i = 0; i < this.particleSystem.particles.length; i++) {
            let distance = this.particleSystem.getDistance(this, this.particleSystem.particles[i]);
            //incorperate distance
            //if they are really close, make them fly away
            if(distance < 100) {
                this.particleSystem.particles[i].velocity.x -= (this.x - this.particleSystem.particles[i].x) / 70;
                this.particleSystem.particles[i].velocity.y -= (this.y - this.particleSystem.particles[i].y) / 70;
            }
            if(distance<2) {
                //random velocity
                this.particleSystem.particles[i].velocity.x = Math.random() * 20-10;
                this.particleSystem.particles[i].velocity.y = Math.random() * 20-2;
            }
        }
    }
}

//create a particle that repells all other particles
class RepulsorParticle extends Particle {
    constructor(x, y, radius, color, particleSystem) {
        super(x, y, radius, color);
        this.particleSystem = particleSystem;
        this.closest = this.particleSystem.closestParticle(this);
        this.velocity = {
            x: (this.closest.x - this.x) / 100,
            y: (this.closest.y - this.y) / 100
        };
    }
    update() {
        //repelling all particles
        for (let i = 0; i < this.particleSystem.particles.length; i++) {
            let distance = this.particleSystem.getDistance(this, this.particleSystem.particles[i]);
            let force = 1000000000 / distance;
            this.particleSystem.particles[i].velocity.x -= (this.x - this.particleSystem.particles[i].x) / force;
            this.particleSystem.particles[i].velocity.y -= (this.y - this.particleSystem.particles[i].y) / force;
        }
        super.update();
    }
}

//flipper particle that repels and attracts particles. It repells by default, and attracts if it touches a wall
class FlipperParticle extends Particle {
    constructor(x, y, radius, color, particleSystem) {
        super(x, y, radius, color, particleSystem);
        this.closest = this.particleSystem.closestParticle(this);
        this.velocity = {
            x: (this.closest.x - this.x) / 100,
            y: (this.closest.y - this.y) / 100
        };
        this.attracting = false;
    }
    update() {
        //interpolate towards the closest particle
        this.x += (this.closest.x - this.x) * 0.01;
        this.y += (this.closest.y - this.y) * 0.01;
        this.attract();
        this.repell();
        super.update();
    }
    //attract all particles with a fall off
    attract() {
        for (let i = 0; i < this.particleSystem.particles.length; i++) {
            let distance = this.particleSystem.getDistance(this, this.particleSystem.particles[i]);
            let force = 10000000 / distance;
            if(this.attracting) {
                this.particleSystem.particles[i].velocity.x += (this.x - this.particleSystem.particles[i].x) / force;
                this.particleSystem.particles[i].velocity.y += (this.y - this.particleSystem.particles[i].y) / force;
            }
        }
    }
    //the closer two particles are, the more repulsive they are
    //the closer they are, the more they repulse
    repell() {
        for (let i = 0; i < this.particleSystem.particles.length; i++) {
            let distance = this.particleSystem.getDistance(this, this.particleSystem.particles[i]);
            let force = 10000000 / distance;
            if(!this.attracting) {
                this.particleSystem.particles[i].velocity.x -= (this.x - this.particleSystem.particles[i].x) / force;
                this.particleSystem.particles[i].velocity.y -= (this.y - this.particleSystem.particles[i].y) / force;
            }
        }
    }

    collisionDetectionWalls() {
        super.collisionDetectionWalls();
        this.attracting = !this.attracting;
    }
}

//make a particle that acts like an atom and has a charge
class ElectronParticle extends Particle {
    constructor(x, y, radius, color, particleSystem) {
        super(x, y, radius, color, particleSystem);
        this.charge = 1;
        this.closest = this.particleSystem.closestParticle(this);
        this.velocity = {
            x: (this.closest.x - this.x) / 100,
            y: (this.closest.y - this.y) / 100
        };
    }
    update() {
        //interpolate towards the closest particle
        this.x += (this.closest.x - this.x) * 0.01;
        this.y += (this.closest.y - this.y) * 0.01;
        this.attract();
        this.repell();
        super.update();
        //color based on position to make rainbow effect
        this.color = this.particleSystem.getColor(this);

        //expload if the particle is too close to the closest particle
        //expload means to accelerate away from the closest particle
        if(this.particleSystem.getDistance(this, this.closest) < 10) {
            this.charge = -1;
        }
        //if they get too far away, make them impolode
        if(this.particleSystem.getDistance(this, this.closest) > 300) {
            this.charge = !this.charge;
        }

    }
    //attract particles with different charges
    //repel particles with the same charge
    attract() {
        for (let i = 0; i < this.particleSystem.particles.length; i++) {
            let distance = this.particleSystem.getDistance(this, this.particleSystem.particles[i]);
            let force = 10000000000 / distance;
            if(this.charge === this.particleSystem.particles[i].charge) {
                this.particleSystem.particles[i].velocity.x -= (this.x - this.particleSystem.particles[i].x) / force;
                this.particleSystem.particles[i].velocity.y -= (this.y - this.particleSystem.particles[i].y) / force;
            } else {
                this.particleSystem.particles[i].velocity.x += (this.x - this.particleSystem.particles[i].x) / force;
                this.particleSystem.particles[i].velocity.y += (this.y - this.particleSystem.particles[i].y) / force;
            }
        }
    }
    //the closer two particles are, the more repulsive they are
    //the closer they are, the more they repulse
    repell() {
        for (let i = 0; i < this.particleSystem.particles.length; i++) {
            let distance = this.particleSystem.getDistance(this, this.particleSystem.particles[i]);
            let force = 10000000000 / distance;
            if(this.charge !== this.particleSystem.particles[i].charge) {
                this.particleSystem.particles[i].velocity.x += (this.x - this.particleSystem.particles[i].x) / force;
                this.particleSystem.particles[i].velocity.y += (this.y - this.particleSystem.particles[i].y) / force;
            }
        }
    }
    getColor(particle) {
        let distance = this.particleSystem.getDistance(this, particle);
        let color = {
            r: 0,
            g: 0,
            b: 0
        };
        if(distance < 100) {
            color.r = 255;
            color.g = 255;
            color.b = 255;
        } else if(distance < 200) {
            color.r = 200;
            color.g = 200;
            color.b = 200;
        } else if(distance < 300) {
            color.r = 150;
            color.g = 150;
            color.b = 150;
        } else if(distance < 400) {
            color.r = 100;
            color.g = 100;
            color.b = 100;
        } else if(distance < 500) {
            color.r = 50;
            color.g = 50;
            color.b = 50;
        } else if(distance < 600) {
            color.r = 0;
            color.g = 0;
            color.b = 0;
        }
        return color;
    }
    
}

class PositronParticle extends ElectronParticle {
    constructor(x, y, radius, color, particleSystem) {
        super(x, y, radius, color, particleSystem);
        this.charge = -1;
    }
}

//create a particle that has two sides
//one side has a negative charge, the other has a positive charge
//create a class for a Lipid side, and a class for a Lipid
//if a particle is to the left of the Lipids direction, it is attracted to the Lipid
//if a particle is to the right of the Lipids direction, it is repelled from the Lipid
class LipidParticle extends Particle {
    constructor(x, y, radius, color, particleSystem) {
        super(x, y, radius, color, particleSystem);

    }
    update() {
        super.update();
        //attract particles to the left of the Lipid
        //repel particles to the right of the Lipid
        for (let i = 0; i < this.particleSystem.particles.length; i++) {
            let distance = this.particleSystem.getDistance(this, this.particleSystem.particles[i]);
            let force = 10000000000 / distance;
            if(this.particleSystem.particles[i].x < this.x) {
                this.particleSystem.particles[i].velocity.x += (this.x - this.particleSystem.particles[i].x) / force;
                this.particleSystem.particles[i].velocity.y += (this.y - this.particleSystem.particles[i].y) / force;
            } else {
                this.particleSystem.particles[i].velocity.x -= (this.x - this.particleSystem.particles[i].x) / force;
                this.particleSystem.particles[i].velocity.y -= (this.y - this.particleSystem.particles[i].y) / force;
            }
        }
    }
}


//create a grid particle system
//a grid particle system contains a gridParticle array
//representing the particles in the grid
//the particles each have a greyscale value
//the particles start with a random greyscale value
//if a particle is next to a particle with a greyscale value less than it, it will grow closer to that value
//if a particle is next to a particle with a greyscale value greater than it, it will shrink closer to that value

window.onload = function() {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    let particleSystem = new ParticleSystem(canvas.width / 2, canvas.height / 2, 1, "red");
    
    for (let i = 0; i < 550; i++) {
        
        particleSystem.addParticle(new LipidParticle(Math.random() * canvas.width, Math.random() * canvas.height, 5, "white", particleSystem));
        //positrons
        particleSystem.addParticle(new WiggleParticle(Math.random() * canvas.width, Math.random() * canvas.height, 5, "white", particleSystem));
        if(i % 5 === 0) {
            particleSystem.addParticle(new AttracterParticle(Math.random() * canvas.width, Math.random() * canvas.height, 5, "white", particleSystem));
        }
    }
    setInterval(function() {
        particleSystem.update();
    }
    , 1000 / 60);
    
}