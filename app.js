// Configuration object - centralized settings (Module Pattern)
const config = {
    width: 800,
    height: 600,
    backgroundColor: 0xffffff,
    antialias: true,
};

// global variables
const MAX_SHAPES = 50; // limit the maximum number of shapes
let app;
let shapes = [];
let shapeGenerationRate = 1; // shapes per second
let gravity = 1; // gravity effect on shapes
let lastShapeGeneration = 0;
let shapeClickHandled = false; // flag to prevent canvas click when clicking shapes

// statistics elements
let shapeCount = 0;
let totalSurfaceArea = 0;

// base shape class
class Shape {
    constructor(x, y, color = 0x3498db) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocityY = 0;
        this.velocityX = (Math.random() - 0.5) * 2; // random horizontal movement
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;

        // create Pixi graphics object
        this.graphics = new PIXI.Graphics();
        this.graphics.interactive = true;
        this.graphics.buttonMode = true;

        // add click event for shape removal (desktop)
        this.graphics.on('click', (event) => {
            shapeClickHandled = true; // Set flag to prevent canvas click
            this.destroy();

            // Reset flag after a short delay
            setTimeout(() => {
                shapeClickHandled = false;
            }, 10);
        });

        // add touch event for shape removal (mobile)
        this.graphics.on('touchstart', (event) => {
            shapeClickHandled = true; // Set flag to prevent canvas touch
            this.destroy();

            // Reset flag after a short delay
            setTimeout(() => {
                shapeClickHandled = false;
            }, 10);
        });

        app.stage.addChild(this.graphics);
        this.draw();
    }

    update(delta) {
        // apply gravity (increased speed)
        this.velocityY += gravity * delta * 0.3;

        //update position
        this.y += this.velocityY * delta;
        this.x += this.velocityX * delta;

        // update rotation
        this.rotation += this.rotationSpeed * delta;

        // update graphics position and rotation
        this.graphics.x = this.x;
        this.graphics.y = this.y;
        this.graphics.rotation = this.rotation;

        // check if shape is outside the canvas
        // return this.y < config.height + 100;
        return this.y < config.height + 50; // faster cleanup
    }

    destroy() {
        this.graphics.removeAllListeners(); // remove all event listeners

        app.stage.removeChild(this.graphics);
        this.graphics.destroy();

        // remove from shapes array
        const index = shapes.indexOf(this);
        if (index > -1) {
            shapes.splice(index, 1);
        }
    }

    // template methods - each subclass implements these differently (Template Method Pattern)
    draw() {
        // to be implemented by subclasses
    }
    getArea() {
        // to be implemented by subclasses
        return 0;
    }
}

class Triangle extends Shape {
    constructor(x, y, color) {
        super(x, y, color);
        this.size = 20 + Math.random() * 30; // random size between 20 and 50
        // Redraw after setting size
        this.draw();
    }
    draw() {
        this.graphics.clear();
        this.graphics.beginFill(this.color);
        this.graphics.drawPolygon([
            -this.size / 2, this.size / 2,
            this.size / 2, this.size / 2,
            0, -this.size / 2
        ]);
        this.graphics.endFill();
    }
    // Triangle area calculation strategy (Strategy Pattern)
    getArea() {
        return (this.size * this.size) / 2; // base * height / 2
    }
}

class Square extends Shape {
    constructor(x, y, color) {
        super(x, y, color);
        this.size = 20 + Math.random() * 30;
        // Redraw after setting size
        this.draw();
    }
    draw() {
        this.graphics.clear();
        this.graphics.beginFill(this.color);
        this.graphics.drawRect(-this.size / 2, -this.size / 2, this.size, this.size);
        this.graphics.endFill();
    }
    getArea() {
        return this.size * this.size; // side * side
    }
}

class Pentagon extends Shape {
    constructor(x, y, color) {
        super(x, y, color);
        this.radius = 15 + Math.random() * 20;
        // Redraw after setting radius
        this.draw();
    }
    draw() {
        this.graphics.clear();
        this.graphics.beginFill(this.color);

        const points = [];
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            points.push(Math.cos(angle) * this.radius);
            points.push(Math.sin(angle) * this.radius);
        }
        this.graphics.drawPolygon(points);
        this.graphics.endFill();
    }
    getArea() {
        return (5 * this.radius * this.radius * Math.sin(Math.PI * 2 / 5)) / 2; //(5 * r^2 * sin(2π/5)) / 2
    }
}

class Hexagon extends Shape {
    constructor(x, y, color) {
        super(x, y, color);
        this.radius = 15 + Math.random() * 20;
        // Redraw after setting radius
        this.draw();
    }
    draw() {
        this.graphics.clear();
        this.graphics.beginFill(this.color);

        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            points.push(Math.cos(angle) * this.radius);
            points.push(Math.sin(angle) * this.radius);
        }
        this.graphics.drawPolygon(points);
        this.graphics.endFill();
    }
    getArea() {
        return (3 * Math.sqrt(3) * this.radius * this.radius) / 2; //(3√3 * r^2) / 2
    }
}

class Circle extends Shape {
    constructor(x, y, color) {
        super(x, y, color);
        this.radius = 15 + Math.random() * 20; // increased size
        // Redraw after setting radius
        this.draw();
    }
    draw() {
        this.graphics.clear();
        this.graphics.beginFill(this.color);
        this.graphics.drawCircle(0, 0, this.radius);
        this.graphics.endFill();
    }
    // Circle area calculation strategy (Strategy Pattern)
    getArea() {
        return Math.PI * this.radius * this.radius; // π * r^2
    }
}

class Ellipse extends Shape {
    constructor(x, y, color) {
        super(x, y, color);
        this.radiusX = 15 + Math.random() * 15;
        this.radiusY = 10 + Math.random() * 20;
        // Redraw after setting radius
        this.draw();
    }
    draw() {
        this.graphics.clear();
        this.graphics.beginFill(this.color);
        this.graphics.drawEllipse(0, 0, this.radiusX, this.radiusY);
        this.graphics.endFill();
    }
    getArea() {
        return Math.PI * this.radiusX * this.radiusY; // π * a * b
    }
}
class Star extends Shape {
    constructor(x, y, color) {
        super(x, y, color);
        this.outerRadius = 20 + Math.random() * 15;
        this.innerRadius = this.outerRadius * 0.5;
        // Redraw after setting radius
        this.draw();
    }
    draw() {
        this.graphics.clear();
        this.graphics.beginFill(this.color);

        const points = [];
        for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5 - Math.PI / 2;
            const radius = i % 2 === 0 ? this.outerRadius : this.innerRadius;
            points.push(Math.cos(angle) * radius);
            points.push(Math.sin(angle) * radius);
        }
        this.graphics.drawPolygon(points);
        this.graphics.endFill();
    }
    getArea() {
        return (5 * this.innerRadius * this.outerRadius * Math.sin(Math.PI / 5)); // (5 * r * R * sin(π/5))
    }
}

// initialize the PixiJS application
function init() {
    // create the PixiJS application
    app = new PIXI.Application({
        width: config.width,
        height: config.height,
        backgroundColor: config.backgroundColor,
        antialias: config.antialias,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    });

    app.renderer.roundPixels = true; // optimize rendering

    // add canvas into the container
    document.getElementById("gameContainer").appendChild(app.view);

    // config event listeners
    setEventListeners();

    // start the game loop
    app.ticker.add(gameLoop);

    console.log("PixiJS initialized!");
}

// Game loop function
function gameLoop(delta) {
    const currentTime = Date.now();

    // automatically generate shapes
    if (currentTime - lastShapeGeneration > 1000 / shapeGenerationRate) {
        generateRandomShape();
        lastShapeGeneration = currentTime;
    }

    // update existing shapes
    updateShapes(delta);

    // update statistics
    updateStats();
}

// Event listeners that observe user interactions and update UI (Observer Pattern)
function setEventListeners() {
    // shape generation rate controls
    document.getElementById("increaseRate").addEventListener("click", () => {
        shapeGenerationRate = Math.min(shapeGenerationRate + 1, 10);
        document.getElementById("shapeRate").textContent = shapeGenerationRate; // UI update
    });

    document.getElementById("decreaseRate").addEventListener("click", () => {
        shapeGenerationRate = Math.max(shapeGenerationRate - 1, 0);
        document.getElementById("shapeRate").textContent = shapeGenerationRate;
    });

    // gravity controls
    document.getElementById("increaseGravity").addEventListener("click", () => {
        gravity = Math.min(gravity + 1, 10);
        document.getElementById("gravityValue").textContent = gravity;
    });

    document.getElementById("decreaseGravity").addEventListener("click", () => {
        gravity = Math.max(gravity - 1, 0);
        document.getElementById("gravityValue").textContent = gravity;
    });

    // click on canvas to generate shapes (desktop)
    app.view.addEventListener("click", (event) => {
        // Don't generate shape if we just clicked on an existing shape
        if (shapeClickHandled) {
            return;
        }

        const rect = app.view.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        generateShapeAt(x, y);
    });

    // touch events for mobile devices
    app.view.addEventListener("touchstart", (event) => {
        // Prevent default to avoid double events and scrolling
        event.preventDefault();

        // don't generate shape if we just touched an existing shape
        if (shapeClickHandled) {
            return;
        }

        const rect = app.view.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        generateShapeAt(x, y);
    });

    // prevent scrolling when touching canvas
    app.view.addEventListener("touchmove", (event) => {
        event.preventDefault();
    });

    app.view.addEventListener("touchend", (event) => {
        event.preventDefault();
    });
}

// Factory method - creates shapes without specifying exact type (Factory Pattern)
function generateRandomShape() {
    if (shapes.length >= MAX_SHAPES) {
        return; // do not generate if too many shapes
    }
    const x = Math.random() * config.width;
    const y = -30; // start at top of canvas
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57, 0xff9ff3, 0x54a0ff];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Dynamic shape creation based on random selection
    const shapeTypes = [Triangle, Square, Pentagon, Hexagon, Circle, Ellipse, Star];
    const ShapeClass = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];

    const shape = new ShapeClass(x, y, color);
    shapes.push(shape);
}

function generateShapeAt(x, y) {
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57, 0xff9ff3, 0x54a0ff];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const shapeTypes = [Triangle, Square, Pentagon, Hexagon, Circle, Ellipse, Star];
    const ShapeClass = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];

    const shape = new ShapeClass(x, y, color);
    shapes.push(shape);
}

function updateShapes(delta) {
    // Update all shapes and remove those that are outside canvas
    for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        const isAlive = shape.update(delta);

        // Remove shape if it's outside canvas bounds
        if (!isAlive) {
            shape.destroy();
        }
    }
}

function updateStats() {
    // Calculate total surface area
    totalSurfaceArea = shapes.reduce((total, shape) => total + shape.getArea(), 0);

    // Update display
    document.getElementById("shapeCount").textContent = shapes.length;
    document.getElementById("surfaceArea").textContent = Math.round(totalSurfaceArea);
}

// Start application when page loads
window.addEventListener('load', init);