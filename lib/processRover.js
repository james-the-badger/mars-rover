function processNewGrid (x, y) {
  const numX = +x;
  const numY = +y;

  return {
    x: numX,
    y: numY,
    lostMap: Array(numX).fill([]),
  }
}

function processNewRover(x, y, orientation) {
  const numX = +x;
  const numY = +y;

  return {
    x: numX,
    y: numY,
    orientation,
  }
}

const orientationChangeMap = {
  L: {
    N: 'W',
    W: 'S',
    S: 'E',
    E: 'N',
  },
  R: {
    N: 'E',
    E: 'S',
    S: 'W',
    W: 'N',
  },
};

function processOrientationChange (rover, instruction) {
  return {
    ...rover,
    orientation: orientationChangeMap[instruction][rover.orientation],
  };
}

const moveMap = {
  N: (rover) => ({...rover, y: rover.y + 1}),
  S: (rover) => ({...rover, y: rover.y - 1}),
  W: (rover) => ({...rover, x: rover.x - 1}),
  E: (rover) => ({...rover, x: rover.x + 1}),
}

function processMoveForward (grid, rover) {
  const newRover = moveMap[rover.orientation](rover);
  if(newRover.x < grid.x + 1 && newRover.y < grid.y + 1 && newRover.x > -1 && newRover.y > -1) {
    // rover is still within the grid
    return {
      grid,
      rover: newRover,
    }
  } else if (grid.lostMap[rover.x][rover.y]) {
    // another rover has driven off here already, so don't move forward
    return {
      rover,
      grid,
    }
  } else {
    // poor rover has driven off the edge!
    const newLostMap = grid.lostMap;
    newLostMap[rover.x][rover.y] = true;
    return {
      rover: {...rover, lost: true },
      grid: {...grid, lostMap: newLostMap},
    }
  }

}

function processRoverInstructions(grid, rover, instructions) {
  return instructions.split('').reduce((acc, instruction) => {
    if(acc.rover.lost) {
      return acc;
    }
    
    if(instruction === 'F') {
      return processMoveForward(acc.grid, acc.rover, instruction);
    }

    return {
      grid,
      rover: processOrientationChange(acc.rover, instruction)
    }
  }, {
    grid,
    rover,
  });
}


module.exports = {
  processNewGrid,
  processNewRover,
  processRoverInstructions,
  processOrientationChange,
  processMoveForward,
}