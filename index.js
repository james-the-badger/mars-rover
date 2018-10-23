const readLine = require('readline');
const {
  processNewGrid,
  processNewRover,
  processRoverInstructions,
} = require('./lib/processRover');

const args = process.argv;

if(args.length < 3) {
  console.log('Missing input');
  process.exit(1);
}

// args[0] is index.js
const input = args[2];

const rl = readLine.createInterface({
  input: require('fs').createReadStream(input),
});

rl.on('line', processLine);

let grid;
let currentRover;

function processLine (line) {
  if(line === '') {
    // do nothing
    return;
  }

  const instructions = line.split(' ');

  if(instructions.length === 1) {
    // rover instructions
    const { 
      rover: newRover,
      grid: newGrid,
    } = processRoverInstructions(grid, currentRover, instructions[0]);
    grid = newGrid;
    logFinalPosition(newRover);
  } else if (instructions.length === 2) {
    grid = processNewGrid(...instructions);
  } else if (instructions.length === 3) {
    currentRover = processNewRover(...instructions);
  } else {
    // unknown instructions
    console.log(`'${line}' is an unknown instruction`);
    process.exit(1);
  }
}

function logFinalPosition (rover) {
  console.log(`${rover.x} ${rover.y} ${rover.orientation} ${rover.lost ? 'LOST' : ''}`);
}
