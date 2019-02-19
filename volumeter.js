
$( document ).ready(function() {
    $( "#clear" ).click(function() {
	$("#history").text("");
   });
});


navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;
if (navigator.getUserMedia) {
  navigator.getUserMedia({
      audio: true
    },
    function(stream) {
      audioContext = new AudioContext();
	    
      analyser = audioContext.createAnalyser();
      microphone = audioContext.createMediaStreamSource(stream);
      javascriptNode = audioContext.createScriptProcessor(4096 , 1, 1);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 2048;
	    
    // Create a Low Pass Filter to Isolate Low End Beat
	var filter = audioContext.createBiquadFilter();
	filter.type = "lowpass";
	filter.frequency.value = 140;
	microphone.connect(filter);
	filter.connect(analyser);

      //microphone.connect(analyser);
      analyser.connect(javascriptNode);
      javascriptNode.connect(audioContext.destination);

      canvasContext = $("#canvas")[0].getContext("2d");
      count = 0;
      frequency_threshold  = 150;

      javascriptNode.onaudioprocess = function() {
	count++;
	
	 var array_size = analyser.fftSize;    
	var array = new Uint8Array(array_size);
	
          analyser.getByteTimeDomainData(array);
	  canvasContext.fillStyle = "rgb(200, 200, 200)";
	  width =  canvasContext.canvas.width;
	  height = canvasContext.canvas.height;
	  canvasContext.fillRect(0, 0, width, height);

	  canvasContext.lineWidth = 2;
	  canvasContext.strokeStyle = "rgb(0, 0, 0)";

	  canvasContext.beginPath();

	  var sliceWidth = width * 1.0 / array_size;
	  var x = 0;
         
	  for (var i = 0; i < array_size; i++) {

	    var v = array[i] / 128.0;
	    var y = v * height / 2;

	    if (i === 0) {
	      canvasContext.moveTo(x, y);
	    } else {
	      canvasContext.lineTo(x, y);
	    }

	    x += sliceWidth;
	  }
	
      var max_frequency =  Math.max.apply(Math, array);
	if (max_frequency > frequency_threshold &&count < 500) {
		count++;	   
		$("#history").append(" " + Number((max_frequency ).toFixed(1)));
        }


	  canvasContext.lineTo(width, height / 2);
	  canvasContext.stroke();
	      
/*           var values = 0;
 * 
 *           var length = array.length;
 *           for (var i = 0; i < length; i++) {
 *             values += (array[i]);
 *           }
 * 
 *           var average = values / length;
 * 
 * //          console.log(Math.round(average - 40));
 * 
 *           canvasContext.clearRect(0, 0, 150, 300);
 *           canvasContext.fillStyle = '#BadA55';
 *           canvasContext.fillRect(0, 300 - average, 150, 300);
 *           canvasContext.fillStyle = '#262626';
 *           canvasContext.font = "48px impact";
 *           canvasContext.fillText(Math.round(average - 40), -2, 300);
 * 	  if (average > 5) {
 * 		$("#history").append(" " + Number((average).toFixed(1)));
 * 	  }
 * 
 */

        } // end fn stream
    },
    function(err) {
      console.log("The following error occured: " + err.name)
    });
} else {
  console.log("getUserMedia not supported");
}