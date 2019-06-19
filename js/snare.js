 class Snare {
    constructor() {
        this.tom_strong = this.BuildTom(/*vol=*/12);
        this.snare_strong = this.BuildSnare(/*vol=*/12);


        this.tom_weak = this.BuildTom(/*vol=*/-12);
        this.snare_weak = this.BuildSnare(/*vol=*/-12); 
    }

    BuildTom(vol){
      let tom = new Tone.MembraneSynth({volume: vol});
      let gate = new Tone.Gate(-50)
      let compressor = new Tone.MidSideCompressor();
      let gain = new Tone.Gain();
      tom.chain(gate, compressor, gain);
      gain.chain(Tone.Master); 

      return tom;
    }

    BuildSnare(vol) {
    
        let snare = new Tone.NoiseSynth(
          {
            volume: vol,
            noise: {
              type: "brown"
            },
            envelope: {
              attack: 0.005,
              decay: 0.1,
              sustain: 0.02
            }
          }
        )
    
    
        let reverb = new Tone.Freeverb({
          roomSize: 0.7,
          dampening: 8000
        });
        let feedbackDelay = new Tone.FeedbackDelay({
          delayTime: "32n",
          feedback: 0.25
        });
        let gate = new Tone.Gate(-50)
        let compressor = new Tone.MidSideCompressor();
        let gain = new Tone.Gain();
    
        snare.chain(reverb, gate, compressor, gain);
        snare.chain(gate, compressor, gain);
        gain.chain(Tone.Master); // dry

        return snare;
    }

    PlayStrong() {
        this.snare_strong.triggerAttackRelease("8n");
        this.tom_strong.triggerAttackRelease("C1", "8n");
    }

    PlayWeak() {
      this.snare_weak.triggerAttackRelease("8n");
      this.tom_weak.triggerAttackRelease("C1", "8n");
  }


}