// get the dfa-canvas and complment-canvas elements
const dfaCanvas = document.getElementById('dfa-canvas');
const complementCanvas = document.getElementById('complement-dfa-canvas');

// get the test string
const testStringButton = document.getElementById('test-string-btn')


// test string button function
testStringButton.addEventListener('click', async()=> {
  const result = await isStringInLanguage();

  const dfaStatus = document.getElementById('dfa-status')
  const complementStatue = document.getElementById('complement-status')

  dfaStatus.textContent = '';
  complementStatue.textContent = '';

  if (result !== null) {
    updateStringStatus(result);
  } 

});

// checks if the string accepts or rejects
async function isStringInLanguage() {
  const inputString = document.getElementById('input-string').value;
  const selectedDFA = document.getElementById('dfa-select').value;

  if (!selectedDFA) {
    alert("Please select a DFA first.");
    return null;
  }

  // Load the DFA JSON
  const response = await fetch(`${selectedDFA}.json`);
  const dfa = await response.json();

  // First, check if input string only contains symbols from the DFA's alphabet
  if (!isStringAlphabetInLanguage(dfa, inputString)) {
    alert("String contains symbols outside of the DFA's alphabet.");
    return null;
  }

  // Simulate DFA
  let currentState = dfa.startState;
  for (const symbol of inputString) {
    if (!dfa.transitions[currentState] || !dfa.transitions[currentState][symbol]) {
      return false;
    }
    currentState = dfa.transitions[currentState][symbol];
  }

  // Check if the final state is accepting
  if (dfa.acceptStates.includes(currentState)) {
    return true; // Accepted
  } else {
    return false; // Rejected
  }
}


// Checks if the input string alphabet is in the language
// params: dfa - current selected language
//         inputString - user input string
//
// return: boolean
function isStringAlphabetInLanguage(dfa, inputString) {
  for (const symbol of inputString) {
    // Build the alphabet from all transitions
    let symbolFound = false;
    
    for (const state in dfa.transitions) {
      if (dfa.transitions[state][symbol]) {
        symbolFound = true;
        break;
      }
    }
    
    if (!symbolFound) {
      return false;
    }
  }
  return true;
}

// updates each both canvas by drawing the DFAs
// param: selectedDFA - current selected DFA
// 
function updateCanvas(selectedDFA) {
  // selected json file
  const selectedJsonFile = `${selectedDFA}.json`;

  // get json file
  fetch(selectedJsonFile)
    .then(response => response.json())
    .then(dfaData => {
      // draw the DFA on the dfa-canvas
      drawDFA(dfaCanvas, dfaData);

      // create the complement DFA
      const complementDFA = createComplementDFA(dfaData);

      console.log('Original DFA:', dfaData);
      console.log('Complement DFA:', complementDFA);

      // draw the complement DFA on the complement-canvas
      drawDFA(complementCanvas, complementDFA);
    });
}

// updates the string displays under each canvas
// param: accept - resulting boolean
// 
function updateStringStatus(accept) {
  const dfaStatus = document.getElementById('dfa-status')
  const complementStatue = document.getElementById('complement-status')

  if (accept) {
    dfaStatus.textContent = 'Accept';
    dfaStatus.style.color = 'limegreen';
    complementStatue.textContent = 'Reject';
    complementStatue.style.color = 'red';
  } else {
    dfaStatus.textContent = 'Reject';
    dfaStatus.style.color = 'red';
    complementStatue.textContent = 'Accept';
    complementStatue.style.color = 'limegreen';
  }
}

// convert the original DFA to complement version
function createComplementDFA(dfa) {
  // create a deep copy of the original DFA
  const complementDFA = JSON.parse(JSON.stringify(dfa));
  // swap accept and non-accept states
  const newAcceptStates = dfa.states.filter(state => !dfa.acceptStates.includes(state));
  complementDFA.acceptStates = newAcceptStates;
  return complementDFA;
}

// draws each DFA
function drawDFA(canvas, dfa) {
  // Placeholder function to draw DFA on the given canvas
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '16px Arial';

  const radius = 120;
  const statePositions = {};
  const angleStep = (2 * Math.PI) / dfa.states.length;

  dfa.states.forEach((state, index) => {
    const angle = index * angleStep;
    const x = canvas.width / 2 + radius * Math.cos(angle);
    const y = canvas.height / 2 + radius * Math.sin(angle);
    statePositions[state] = { x, y };
  });


  // draw transitions
  for (const fromState in dfa.transitions) {
    for (const symbol in dfa.transitions[fromState]) {
      const toState = dfa.transitions[fromState][symbol];
      const fromPos = statePositions[fromState];
      const toPos = statePositions[toState];
    

      drawTransitionArrow(ctx, fromState, toState, fromPos, toPos, dfa, symbol);
    }
  }

  // draw state circles 
  for (const state in statePositions) {
    const { x, y } = statePositions[state];
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.arc(x, y, 30, 0, 3 * Math.PI);
    ctx.fill();
    ctx.stroke()

    if (dfa.acceptStates.includes(state)) {
      ctx.beginPath()
      ctx.arc(x, y, 25, 0, 3 * Math.PI);
      ctx.stroke()
    }

    if (state === dfa.startState) {
      // draw a small triangle toward the state indicating start state
      ctx.moveTo(x - 30, y);
      ctx.lineTo(x - 45, y - 10);
      ctx.lineTo(x - 45, y + 10);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.fillStyle = 'black';
    ctx.fillText(state, x - 10, y + 5);
  }

}

// draws each transtion arrow that exists in the JSON file
// param: ctx - canvas context
//        fromState - start state
//        toState - destination state
//        fromPos - start of transition
//        toPos - end of transition
//        dfa - current selected dfa
//        symbol - transition alphabet
//        headlen - length of arrow head
// 
function drawTransitionArrow(ctx, fromState, toState, fromPos, toPos, dfa, symbol, headlen = 10){
  if (fromState === toState) {
    // Self-loop - check for multiple symbols on the same loop
    const selfLoopSymbols = [];
    if (dfa.transitions[fromState]) {
      for (const [sym, targetState] of Object.entries(dfa.transitions[fromState])) {
        if (targetState === fromState) {
          selfLoopSymbols.push(sym);
        }
      }
    }
    
    // Draw the loop (same for all symbols)
    ctx.beginPath();
    ctx.arc(fromPos.x, fromPos.y - 40, 20, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Sort symbols for consistent ordering
    selfLoopSymbols.sort();
    const symbolIndex = selfLoopSymbols.indexOf(symbol);
    
    // Calculate horizontal offset for the label
    const totalSymbols = selfLoopSymbols.length;
    const symbolSpacing = 15; // Horizontal spacing between symbols
    const totalWidth = (totalSymbols - 1) * symbolSpacing;
    const xOffset = (symbolIndex * symbolSpacing) - (totalWidth / 2);
    
    // Draw the symbol label with offset
    ctx.fillText(symbol, fromPos.x + xOffset, fromPos.y - 65);
  } else {
    // Calculate the angle between the two states
    const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
    
    // Calculate adjusted start and end points (30px from center = circle radius)
    const radius = 30;
    const startX = fromPos.x + radius * Math.cos(angle);
    const startY = fromPos.y + radius * Math.sin(angle);
    const endX = toPos.x - radius * Math.cos(angle);
    const endY = toPos.y - radius * Math.sin(angle);
    
    // Draw the main line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw the arrowhead
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), 
               endY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), 
               endY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Check for bidirectional arrows and offset label if needed
    let offset = 0;
    if (dfa.transitions[toState] && Object.values(dfa.transitions[toState]).includes(fromState)) {
      offset = 15; // Shift perpendicular to avoid overlap
    }

    // Calculate perpendicular direction for label offset
    const perpX = Math.cos(angle + Math.PI / 2);
    const perpY = Math.sin(angle + Math.PI / 2);

    // Draw the symbol label at the midpoint
    const midX = (startX + endX) / 2 + offset * perpX;
    const midY = (startY + endY) / 1.95 + offset * perpY;
    ctx.fillText(symbol, midX, midY);
  }
}

