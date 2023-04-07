const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const notes = ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"];
const repeatInput = document.getElementById("repeat");
const bpmInput = document.getElementById("bpm");
const bpmSlider = document.getElementById("bpm-slider");
const sharpCheckbox = document.getElementById("sharpCheckbox");
const flatCheckbox = document.getElementById("flatCheckbox");
const muteCheckbox = document.getElementById("mute");
const toggleButton = document.getElementById("toggle");
const noteDiv = document.querySelector(".note");

let currentNote = "";
let repeatCount = 1;
let isPlaying = false;
let intervalId = null;
let notesCycle = [];
let currentIndex = 0;
const naturalNotes = ["C", "D", "E", "F", "G", "A", "B"];

function playSound(note, duration) {
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = getFrequency(note);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + duration / 1000 - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration / 1000);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000 + 0.1);
  } catch (error) {
    console.error(error);
  }
}

function getFrequency(note) {
  const pitches = {
    "C": 130.81,
    "C#": 138.59,
    "Db": 138.59,
    "D": 146.83,
    "D#": 155.56,
    "Eb": 155.56,
    "E": 164.81,
    "F": 174.61,
    "F#": 185.00,
    "Gb": 184.997,
    "G": 196.00,
    "G#": 207.65,
    "Ab": 207.65,
    "A": 220.00,
    "A#": 233.08,
    "Bb": 233.08,
    "B": 246.94
  };
  const octave = 4;
  const frequency = pitches[note] * Math.pow(2, octave - 4);
  return frequency;
}
function playCountdown(countdown = 4) {
  const bpm = parseInt(bpmInput.value);
  const intervalTime = 60000 / bpm;

  // Reset the current note and repeat count
  currentNote = "";
  repeatCount = 1;

  // Play the countdown beats
  for (let i = countdown; i > 0; i--) {
    playSound("C", intervalTime * 0.8);
    repeatCount += 1;
    if (repeatCount > repeatInput.value) {
      currentNote = "";
      repeatCount = 1;
    }
    // Wait for the interval time before playing the next beat
    setTimeout(() => {
      // If this is the final beat of the countdown and the app is playing, start the normal note cycle
      if (i === 1 && isPlaying) {
        startInterval();
      }
    }, intervalTime);
  }
}
function toggle() {
  isPlaying = !isPlaying;
  if (isPlaying) {
    currentNote = "";
    repeatCount = 1;
    toggleButton.textContent = "Stop";
    
    // Check if the countdown toggle is checked
    const countdownToggle = document.getElementById("countdown-toggle").checked;
    
    // If the countdown toggle is checked, play the countdown beats
    if (countdownToggle) {
      playCountdown(4);
    } else {
      // If the countdown toggle is not checked, start the normal note cycle immediately
      startInterval();
    }
  } else {
    clearInterval(intervalId);
    toggleButton.textContent = "Start";
    resetNotesCycle();
    noteDiv.textContent = "";
  }
}


function startInterval() {
  const bpm = parseInt(bpmInput.value);
  const intervalTime = 60000 / bpm;
  let nextNote = getRandomNote();
  noteDiv.textContent = nextNote;
  intervalId = setInterval(() => {
    if (repeatCount <= repeatInput.value) {
      currentNote = nextNote;
      if (!muteCheckbox.checked) {
        setTimeout(() => {
          playSound(currentNote, intervalTime);
        }, intervalTime * 0.2);
      }
      repeatCount += 1;
      if (repeatCount > repeatInput.value) {
        repeatCount = 1;
        nextNote = getRandomNote();
        noteDiv.textContent = nextNote;
      }
    } else {
      repeatCount = 1;
      nextNote = getRandomNote();
      noteDiv.textContent = nextNote;
    }
  }, intervalTime);
}



function getRandomNote() {
  let useSharps = sharpCheckbox.checked;
  let useFlats = flatCheckbox.checked;
  let notesInCycle = [];
  if (useSharps && useFlats) {
    notesInCycle = notes;
  } else if (useSharps) {
  notesInCycle = notes.filter(note => !note.includes("b") || note.includes("#"));
} else if (useFlats) {
  notesInCycle = notes.filter(note => note.includes("b") || note === "C" || note === "D" || note === "F" || note === "G" || note === "A" || note === "B");
} else {
    notesInCycle = naturalNotes;
  }
  let cycleLength = notesInCycle.length;

  if (notesCycle.length === 0) {
    // If notesCycle is empty, create a new cycle of notes
    for (let i = 0; i < cycleLength; i++) {
      notesCycle.push(notesInCycle[i]);
    }
    shuffleArray(notesCycle);
  }

  let note = notesCycle[currentIndex];
  currentIndex += 1;

  if (currentIndex === cycleLength) {
    // If we've reached the end of the cycle, shuffle the notes again
    currentIndex = 0;
    shuffleArray(notesCycle);
  }

  return note;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}


function startWithSpacebar(event) {
  if (event.keyCode === 32) { // 32 is the keyCode for spacebar
    event.preventDefault(); // Prevent the default behavior of the spacebar
    toggle(); // Call the toggle function to start or stop the app
  }
}

repeatInput.addEventListener("change", () => {
  if (isPlaying) {
    clearInterval(intervalId);
    startInterval();
  }
});

bpmInput.addEventListener("input", () => {
  bpmSlider.value = bpmInput.value;
  if (isPlaying) {
    clearInterval(intervalId);
    startInterval();
  }
});

bpmSlider.addEventListener("input", () => {
  bpmInput.value = bpmSlider.value;
  if (isPlaying) {
    clearInterval(intervalId);
    startInterval();
  }
});

toggleButton.addEventListener("click", toggle);

muteCheckbox.addEventListener("change", () => {
  if (muteCheckbox.checked) {
    noteDiv.textContent = "Muted";
  } else {
    noteDiv.textContent = currentNote;
  }
});

sharpCheckbox.addEventListener("change", () => {
  if (isPlaying) {
    clearInterval(intervalId);
    startInterval();
  }
});

flatCheckbox.addEventListener("change", () => {
  if (isPlaying) {
    clearInterval(intervalId);
    startInterval();
  }
});

document.addEventListener("keydown", startWithSpacebar);

function resetNotesCycle() {
  notesCycle = [];
  currentIndex = 0;
}

const countdownToggle = document.getElementById("countdown-toggle");

countdownToggle.addEventListener("click", () => {
  if (countdownToggle.checked) {
    // If the countdown toggle is checked, play the countdown beats
    playCountdown(4);
  }
});

