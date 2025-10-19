// get the dfa-canvas and complment-canvas elements
const dfaCanvas = document.getElementById('dfa-canvas');
const complementCanvas = document.getElementById('complement-dfa-canvas');

// get selected json file from dropdown
// const dfaSelect = document.getElementById('dfa-select');
// const selectedDFA = dfaSelect.value;


function update(selectedDFA) {
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



function createComplementDFA(dfa) {
  // create a deep copy of the original DFA
  const complementDFA = JSON.parse(JSON.stringify(dfa));
  // swap accept and non-accept states
  const newAcceptStates = dfa.states.filter(state => !dfa.acceptStates.includes(state));
  complementDFA.acceptStates = newAcceptStates;
  return complementDFA;
}

drawDFA = (canvas, dfa) => {
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
    

      drawTransitionArrow(ctx, fromState, toState, fromPos, toPos, symbol);
    }
  }

  // draw state circles 
  for (const state in statePositions) {
    const { x, y } = statePositions[state];
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, 3 * Math.PI);
    ctx.fillStyle = 'white';

    if (dfa.acceptStates.includes(state)) {
      ctx.arc(x, y, 25, 0, 3 * Math.PI);
    }

    if (state === dfa.startState) {
      // draw a small triangle toward the state indicating start state
      ctx.moveTo(x - 30, y);
      ctx.lineTo(x - 45, y - 10);
      ctx.lineTo(x - 45, y + 10);
      ctx.closePath();
    }

    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'black';
    ctx.fillText(state, x - 10, y + 5);
  }

}

drawTransitionArrow = (ctx, fromState, toState, fromPos, toPos, symbol, headlen = 10) => {
  if (fromState === toState) {
    ctx.beginPath();
    ctx.arc(fromPos.x, fromPos.y - 40, 20, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillText(symbol, fromPos.x, fromPos.y - 65);
    

  } else {
    // calculate the angle between the two states
    const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
    
    // calculate adjusted start and end points (40px from center = 30px circle radius + 10px shorter)
    const startX = fromPos.x + 30 * Math.cos(angle);
    const startY = fromPos.y + 40 * Math.sin(angle);
    const endX = toPos.x - 30 * Math.cos(angle);
    const endY = toPos.y - 40 * Math.sin(angle);
    
    // draw the main line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // draw the arrowhead
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    
    // draw the symbol label at the midpoint
    const midX = (startX + endX) / 2.1;
    const midY = (startY + endY) / 2;
    ctx.fillText(symbol, midX, midY);
  }
}
