class Metronome {
    /**
     * 
     * @param {Canvas} canvas_context to draw.
     */
    constructor(canvas_context, canvas_color) {
        this.canvas_context = canvas_context;
        this.canvas_color = canvas_color;
        this.count = 0;
        this.last_date = Date.now();
        this.note_color = "rgba(255,0,0,0.3)";
        this.CreateStrokeBar();
    }

    Init(bpm) {
        let distance = this.canvas_context.canvas.height;
        let time_ms = 60. / bpm * 1000;
        this.speed_ms = distance  / time_ms;
        this.Draw();
    }

    Draw() {

        this.canvas_context.fillStyle = this.canvas_color;
        let width = this.canvas_context.canvas.width;
        let height = this.canvas_context.canvas.height;
        this.canvas_context.clearRect(0, 0, width, height);

        this.stroke_bar.Draw();
        
        this.canvas_context.globalCompositeOperation = 'destination-over';



        requestAnimationFrame(this.Draw.bind(this));
    }

    CreateStrokeBar() {
        let width = this.canvas_context.canvas.width;
        let height = this.canvas_context.canvas.height * 0.05;
        let x = 0;
        let y = this.canvas_context.canvas.height - 4*height;
        let fill_style =  "rgba(113, 2, 239, 0.5)";
        this.stroke_bar = new Rectangle(width, height, 
            x, y, this.canvas_context, fill_style);
        this.stroke_bar.enable = true;
    }

}

class Rectangle {
    constructor(width, height, x, y, canvas_context, fill_style) {
        this._width = width;
        this._height = height;
        this._x = x;
        this._y = y;
        this._begin_x = x;
        this._begin_y = y;
        this._canvas_context = canvas_context;
        this._fill_style = fill_style;
        this._enable = false;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._x;
    }

    get height() {
        return this._height;
    }

    get width() {
        return this._width;
    }

    get enable() {
        this._enable;
    }

    set enable(value) {
        this._enable = value;
    }

    Update(distance) {
        if (this._enable) {
            this._y += distance;
            this.draw();
        }
    }

    Draw() {
        this._canvas_context.beginPath();
        this._canvas_context.fillStyle = this._fill_style;
        this._canvas_context.fillRect(this._x, this._y, this._width, this._height);
        this._canvas_context.fill();
        this._canvas_context.closePath();
    }

    Intersects(rectangle) {
        if (!this.enable || !rectangle.enable) {
            return false;
        }
        return rectangle.x + rectangle.width > this.x &&
            rectangle.y + rectangle.height > this.y &&
            this.x + this.width > rectangle.x &&
            this.y + this.height > rectangle.height;
    }
}