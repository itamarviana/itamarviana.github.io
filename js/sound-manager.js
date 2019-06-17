/**
 * Conects to to microphone, and starts to listening it.
 */
class SoundManager {
    /**
     * 
     * @param {Metronome} metronome 
     */
    constructor(metronome) {
        this.metronome = metronome;
        this.analyser = null;
        this.stream = null;
        this.audio_context = null;
        this.started = false;
    }

    StartListeningMicrophone() {
        if (this.started) {
            this.Stop();
            return;
        }
        this.started = true;
        var constraints = { audio: true };
        var obj = this;
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {
                var javascriptNode = obj.GetJavascriptNode(stream);
                javascriptNode.onaudioprocess = function () {
                    var array_size = obj.analyser.fftSize;
                    var sound_data = new Uint8Array(array_size);
                    obj.analyser.getByteTimeDomainData(sound_data);
                    obj.metronome.DetectStroke(sound_data);
                }
            })
            .catch(function (err) { console.log(err.name + ": " + err.message); });
    }

    Stop() {
        this.metronome.ClearCanvas();
        this.started = false;
        if (this.audio_context.state === 'closed') {
            return;
        }
        try {
            this.stream.getTracks()[0].stop();
            this.audio_context.close(); // returns a promise;
        } catch (ex) {
            // This fails in some older versions of chrome. Nothing we can do about it.
        }
    }

    GetJavascriptNode(stream) {
        this.stream = stream;
        this.audio_context = new AudioContext();

        this.analyser = this.audio_context.createAnalyser();
        var microphone = this.audio_context.createMediaStreamSource(stream);
        var javascript_node = this.audio_context.createScriptProcessor(4096, 1, 1);

        this.analyser.smoothingTimeConstant = 0.8;
        this.analyser.fftSize = 2048;

        // Create a Low Pass Filter to Isolate Low End Beat
        var filter = this.audio_context.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 580;
        microphone.connect(filter);
        filter.connect(this.analyser);

        //microphone.connect(analyser);
        this.analyser.connect(javascript_node);
        javascript_node.connect(this.audio_context.destination);

        return javascript_node;
    }
}