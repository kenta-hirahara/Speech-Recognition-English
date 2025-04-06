const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    alert("this browser cannot recognize audio.");
} else {
    var capitalize = function(str) { 
        if (typeof str !== 'string' || !str) return str; 
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(); 
    };
    //constructor to initiate speech recognition obj
    const recognition = new SpeechRecognition();
    //config of the obj
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    //button and display elements
    const startBtn = document.getElementById('start-btn');
    const buttonText = document.getElementById('button-text');
    const micIcon = document.getElementById('mic-icon');
    const resultP = document.getElementById('result');
    const responseP = document.getElementById('response');
    const recordingWave1 = document.getElementById('recording-wave-1');
    const recordingWave2 = document.getElementById('recording-wave-2');
    
    let isRecording = false;
    
    // microphone icon in svg
    const micSvg = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14v7m0 0h3m-3 0H9m3-7a4 4 0 004-4V5a4 4 0 00-8 0v5a4 4 0 004 4z" />`;
    
    // play icon
    const playSvg = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l14 9-14 9V3z" />`;
    
    //start button click event
    startBtn.addEventListener('click', () => {
        if (!isRecording) {
            startRecording();
        }
    });
    
    function startRecording() {
        isRecording = true;
        recognition.start();
        
        // change button style
        startBtn.classList.remove('normal-button');
        startBtn.classList.add('recording-button', 'animate-recording');
        
        buttonText.textContent = "Recording...";
        
        // change icon to microphone
        micIcon.innerHTML = micSvg;
        
        // add wave animation
        recordingWave1.classList.add('animate-wave');
        recordingWave2.classList.add('animate-wave');
    }
    
    function stopRecording() {
        isRecording = false;
        
        // original button style
        startBtn.classList.remove('recording-button', 'animate-recording');
        startBtn.classList.add('normal-button');
        
        // update text
        buttonText.textContent = "Start Recording";
        
        // get play icon back
        micIcon.innerHTML = playSvg;
        
        // stop wave animation
        recordingWave1.classList.remove('animate-wave');
        recordingWave2.classList.remove('animate-wave');
    }
    
    //speech recog results handling
    recognition.onresult = (event) => {
        let resultText = '';
        for (let i = 0; i < event.results.length; i++) {
            // capitalize the 1st char of 1st word
            if (i === 0) {
                const text = event.results[i][0].transcript;
                const words = text.split(' ');
                
                if (words.length > 0) {
                    words[0] = capitalize(words[0]);
                    resultText += words.join(' ');
                } else {
                    resultText += text;
                }
            } else {
                resultText += event.results[i][0].transcript;
            }
        }
        resultP.textContent = resultText;
        
        // back to the original button design
        stopRecording();
        
        // send data to flask server
        fetch('/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({text:resultText})
        })
        .then(response => response.json())
        .then(data => {
            if (data.answer) {
                responseP.innerHTML = marked.parse(data.answer);
            } else {
                responseP.textContent = "Error!!!";
            }
        })
        .catch(error => {
            console.error("Error:", error);
            responseP.textContent = "Error occured";
        });
    }
    
    // process after audio recognition
    recognition.onend = () => {
        // get the original style back only during recording
        if (isRecording) {
            stopRecording();
        }
    };
    
    // upon error
    recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        stopRecording();
        resultP.textContent = `Recognition error: ${event.error}`;
    };
}
