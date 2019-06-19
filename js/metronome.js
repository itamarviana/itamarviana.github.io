class Metronome {
    /**
     * 
     * @param {Canvas} canvas_context to draw.
     */
    constructor(canvas_context, canvas_color) {
        this.canvas_context = canvas_context;
        this.canvas_color = canvas_color;
        this.last_date = Date.now();
        this.note_width = canvas_context.canvas.height * 0.05;

        this.CreateStrokeBar();
        this.active_notes = [this.CreateNote(0), 
            this.CreateNote(1),
            this.CreateNote(2),
            this.CreateNote(4),
           ];
        this.wait_line_ms = 0;
        this.last_stroke = Date.now();
        this.stroke_count = 0;
        this.sound_data_lock = false;
        this.sound_data_size = 1;
        this.sound_data = [];
        this.points = 0;
        this.UpdateSpeed(0);
        this.UpdateSpeed(/*bpm=*/0);
        this.Draw();
    }

    Start(bpm) {
        this.UpdateSpeed(bpm);
    }

    Stop() {
        this.UpdateSpeed(/*bpm=*/0);
    }

    UpdateSpeed(bpm) {
        bpm = bpm * 4;
        this.schedule_m = 2. * 1. * bpm;
        this.speed_m = this.schedule_m * this.note_width;
    }

    ClearCanvas() {
        this.stroke_count = 0;
        $("#stroke-count").text("" + this.stroke_count);
        this.active_notes = [];
        let width = this.canvas_context.canvas.width;
        let height = this.canvas_context.canvas.height;
        this.canvas_context.clearRect(0, 0, width, height);
        this.ClearSoundData();
    }

    Draw() {

        // this.canvas_context.globalCompositeOperation = 'destination-over';
        this.canvas_context.fillStyle = this.canvas_color;
        let width = this.canvas_context.canvas.width;
        let height = this.canvas_context.canvas.height;

        // Skips the stroke bar.
        this.canvas_context.clearRect(0, 0, width, this.stroke_bar.y);
        this.canvas_context.clearRect(0, this.stroke_bar.y +
            this.stroke_bar.height, width, height);
            

        this.DrawSoundWave(this.GetAvgSoundData());
       

        var i;
        let curr_date = Date.now();
        let time = (curr_date - this.last_date) / 1000.0 / 60.0;
        let distance = time * this.speed_m;
        this.last_date = curr_date;
        for (i = 0; i < this.active_notes.length; i++) {
            this.active_notes[i].Update(distance);
            if (this.active_notes[i].y > height) {
                this.active_notes[i].y = 0;
            }

        }

        requestAnimationFrame(this.Draw.bind(this));
    }

    DrawHit(hit_value) {
        this.canvas_context.font = "16px Arial";
        this.canvas_context.fillStyle = "#0095DD";
        this.canvas_context.fillText("Hit Value: "+hit_value, this.canvas_context.canvas.width-120, 20);
        this.canvas_context.fillText("Count: "+ this.stroke_count, this.canvas_context.canvas.width-120, 40);
        this.canvas_context.fillText("Points: "+ this.points, this.canvas_context.canvas.width-120, 60);
      }



    AddSoundData(sound_data) {
        if (this.sound_data_lock) {
            return;
        }
        this.sound_data_lock = true;
        this.sound_data.push(sound_data);
        if (this.sound_data.length > this.sound_data_size) {
            this.sound_data.shift();
        }
        this.sound_data_lock = false;
    }

    ClearSoundData() {
        if (this.sound_data_lock) {
            return;
        }
        this.sound_data_lock = true;
        this.sound_data = [];
        this.sound_data_lock = false;
    }

    GetAvgSoundData() {
        if (this.sound_data_lock || this.sound_data.length == 0) {
            return [];
        }
        this.sound_data_lock = true;
        let avg = new Array(this.sound_data[0].length).fill(0.0);
        var i, j;
        for (i = 0; i < this.sound_data.length; i++) {
            for (j = 0; j < this.sound_data[i].length; j++) {
                avg[j] += this.sound_data[i][j];
            }
        }
        for (i = 0; i < avg.length; i++) {
            avg[i] /= this.sound_data.length;
        }

      
        this.sound_data_lock = false;

        return avg;
    }

    HitNote() {
        let is_hit = false;
        var i = 0;
        for (i = 0; i < this.active_notes.length; i++) {
            if (this.active_notes[i].Intersects(this.stroke_bar)) {
                is_hit = true;
                break;
            }
        }
        if (is_hit) {
            this.points += 1;
        } else{
            this.points -= 1;
        }
    }

    DetectStroke(sound_data) {

        let time_diff = Date.now() - this.last_stroke;
        if (time_diff < 80) {
            return;
        }
        this.AddSoundData(sound_data);

        let max_value = Math.max.apply(null, sound_data) / 128.0;
        if (max_value > 1.4) {
            this.HitNote();
            this.stroke_count += 1;
            $("#stroke-count").text("" + this.stroke_count);
            $('#table-debug').append(`<tr><td>${time_diff} ${max_value}</td></tr>`);
        }


        this.last_stroke = Date.now();
    }

    DrawSoundWave(sound_data) {
        let hit_value = Math.max.apply(null, sound_data) / 128.0;
        this.DrawHit(hit_value);
        this.stroke_bar.Draw();
        let fill_style = "rgba(113, 2, 239, 0.5)";
        if (hit_value > 1.1) {
            fill_style = "rgba(255, 2, 239, 0.5)";
        }
        this.stroke_bar.Draw(fill_style);

        if (sound_data == null || sound_data.length == 0) {
            return;
        }

        let width = this.stroke_bar.width;
        let height = this.stroke_bar.height;

        let y_b = this.stroke_bar.y;

        this.canvas_context.lineWidth = 2;
        this.canvas_context.strokeStyle = "rgba(0, 0, 0, 0.9)";

        this.canvas_context.beginPath();

        let slice_width = width * 1.0 / sound_data.length;
        let x = 0;

        for (let i = 0; i < sound_data.length; i++) {

            let v = sound_data[i] / 128.0;
            let y = y_b + v * height / 2;

            if (i === 0) {
                this.canvas_context.moveTo(x, y);
            } else {
                this.canvas_context.lineTo(x, y);
            }

            x += slice_width;
        }

        this.canvas_context.lineTo(width, height / 2 + y_b);
        this.canvas_context.stroke();

    }

    CreateNote(position) {
        let width = this.note_width;
        let height = this.note_width;
        let x = this.canvas_context.canvas.width / 2. - width / 2.;
        let y = position * height * 2;
        let fill_style = "rgba(53, 18, 61, 0.8)";
        let note = new Rectangle(width, height,
            x, y, this.canvas_context, fill_style);
        note.enable = true;
        return note;
    }

    CreateStrokeBar() {
        let width = this.canvas_context.canvas.width;
        let height = this.note_width;
        let x = 0;
        let y = this.canvas_context.canvas.height - 4 * height;
        let fill_style = "rgba(113, 2, 239, 0.5)";
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
        return this._y;
    }

    set y(value) {
        this._y = value;
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
        if (distance != 0) {
            this._y += distance;
        }
        if (this._enable) {
            this.Draw();
        }
    }

    Draw(fill_style) {
        this._canvas_context.beginPath();
        if (fill_style) {
            this._canvas_context.fillStyle = fill_style;
        } else {
         this._canvas_context.fillStyle = this._fill_style;
        }
        this._canvas_context.fillRect(this._x, this._y, this._width, this._height);
        this._canvas_context.fill();
        this._canvas_context.closePath();
    }

    Intersects(rectangle) {
        if (!this._enable || !rectangle._enable) {
            return false;
        }
        return rectangle.x + rectangle.width > this.x &&
            rectangle.y + rectangle.height > this.y &&
            this.x + this.width > rectangle.x &&
            this.y + this.height > rectangle.y;
    }
}