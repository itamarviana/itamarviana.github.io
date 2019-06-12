/**
 * 
 */

class StrokeDetection {
    /**
     * 
     * @param {Canvas} canvas_context to draw the sound waves.
     */
    constructor(canvas_context, canvas_color) {
        this.canvas_context = canvas_context;
        this.canvas_color = canvas_color;
        this.last_stroke = Date.now();
        this.stroke_count = 0;

    }

    OnAudioProcess(sound_data) {
        let time_diff = Date.now() - this.last_stroke;
        if (time_diff < 80) {
            return;
        }

        this.DrawSoundWave(sound_data);
        let max_value = Math.max.apply(null, sound_data) / 128.0;
        if (max_value > 1.2) {
            this.stroke_count += 1;
            $("#stroke-count").text("" + this.stroke_count);
            $('#table-debug').append(`<tr><td>${time_diff} ${max_value}</td></tr>`);
        }


        this.last_stroke = Date.now();
        return;
    }

    ClearCanvas() {
        this.stroke_count = 0;
        $("#stroke-count").text("" + this.stroke_count);
        let width = this.canvas_context.canvas.width;
        let height = this.canvas_context.canvas.height;
        this.canvas_context.clearRect(0, 0, width, height);
    }

    DrawSoundWave(sound_data) {
        if (sound_data.length == 0) {
            return;
        }
        this.canvas_context.fillStyle = this.canvas_color;
        let width = this.canvas_context.canvas.width;
        let height = this.canvas_context.canvas.height;
        this.canvas_context.fillRect(0, 0, width, height);

        this.canvas_context.lineWidth = 2;
        this.canvas_context.strokeStyle = "rgb(0, 0, 0)";

        this.canvas_context.beginPath();

        let slice_width = width * 1.0 / sound_data.length;
        let x = 0;

        for (let i = 0; i < sound_data.length; i++) {

            let v = sound_data[i] / 128.0;
            let y = v * height / 2;

            if (i === 0) {
                this.canvas_context.moveTo(x, y);
            } else {
                this.canvas_context.lineTo(x, y);
            }

            x += slice_width;
        }

        this.canvas_context.lineTo(width, height / 2);
        this.canvas_context.stroke();
    }
}

// Export node module.
if (typeof module !== 'undefined' && module.hasOwnProperty('exports')) {
    module.exports = StrokeDetection;
}