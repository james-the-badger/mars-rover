const { expect } = require('chai');

const {
  processNewGrid,
  processNewRover,
  processRoverInstructions,
  processOrientationChange,
  processMoveForward,
} = require('./processRover');

describe(__filename, () => {
  describe('processNewGrid', () => {
    it('creates a new grid', () => {
      const instructions = ['5', '6'];
      const newGrid = processNewGrid(...instructions);
      expect(newGrid.x).to.equal(5);
      expect(newGrid.y).to.equal(6);
      expect(newGrid.lostMap.length).to.equal(5);
    });
  });

  describe('processNewRover', () => {
    it('creates a new rover', () => {
      const instructions = ['2', '3', 'N'];
      const newRover = processNewRover(...instructions);
      expect(newRover.x).to.equal(2);
      expect(newRover.y).to.equal(3);
      expect(newRover.orientation).to.equal('N');
    });
  });

  describe('processOrientationChange', () => {
    [
      {rover: { x: 1, y: 2, orientation: 'N' },  instruction: 'L', expectedOrientation: 'W', label: 'can turn left N => W'},
      {rover: { x: 1, y: 2, orientation: 'W' },  instruction: 'L', expectedOrientation: 'S', label: 'can turn left W => S'},
      {rover: { x: 1, y: 2, orientation: 'S' },  instruction: 'L', expectedOrientation: 'E', label: 'can turn left S => E'},
      {rover: { x: 1, y: 2, orientation: 'E' },  instruction: 'L', expectedOrientation: 'N', label: 'can turn left E => N'},
      {rover: { x: 1, y: 2, orientation: 'N' },  instruction: 'R', expectedOrientation: 'E', label: 'can turn right N => E'},
      {rover: { x: 1, y: 2, orientation: 'E' },  instruction: 'R', expectedOrientation: 'S', label: 'can turn right E => S'},
      {rover: { x: 1, y: 2, orientation: 'S' },  instruction: 'R', expectedOrientation: 'W', label: 'can turn right S => W'},
      {rover: { x: 1, y: 2, orientation: 'W' },  instruction: 'R', expectedOrientation: 'N', label: 'can turn right W => N'},
    ].forEach(({ label, rover, instruction, expectedOrientation }) => {
      it(label, () => {
        const newRover = processOrientationChange(rover, instruction);
        expect(newRover.orientation).to.equal(expectedOrientation);
        expect(newRover.x).to.equal(rover.x);
        expect(newRover.y).to.equal(rover.y);
      });
    });
  });

  describe('processMoveForward', () => {
    describe('can move forward within the grid', () => {
      const grid = {
        x: 5,
        y: 6,
      };

      const rover = {
        x: 2,
        y: 2,
      };

      it('north', () => {
        const { rover: newRover } = processMoveForward(grid, {...rover, orientation: 'N'});
        expect(newRover.y).to.equal(rover.y + 1);
      });

      it('south', () => {
        const { rover: newRover } = processMoveForward(grid, {...rover, orientation: 'S'});
        expect(newRover.y).to.equal(rover.y - 1);
      });

      it('west', () => {
        const { rover: newRover } = processMoveForward(grid, {...rover, orientation: 'W'});
        expect(newRover.x).to.equal(rover.x - 1);
      });

      it('east', () => {
        const { rover: newRover } = processMoveForward(grid, {...rover, orientation: 'E'});
        expect(newRover.x).to.equal(rover.x + 1);
      });
    });

    describe('can move forward to the edge the grid', () => {
      const grid = {
        x: 5,
        y: 6,
      };

      it('north', () => {
        const rover = {x: 4, y: 5, orientation: 'N'};
        const { rover: newRover } = processMoveForward(grid, rover);
        expect(newRover.y).to.equal(rover.y + 1);
      });

      it('south', () => {
        const rover = {x: 4, y: 1, orientation: 'S'};
        const { rover: newRover } = processMoveForward(grid, rover);
        expect(newRover.y).to.equal(rover.y - 1);
      });

      it('west', () => {
        const rover = {x: 4, y: 5,  orientation: 'W'};
        const { rover: newRover } = processMoveForward(grid, rover);
        expect(newRover.x).to.equal(rover.x - 1);
      });

      it('east', () => {
        const rover = {x: 1, y: 5, orientation: 'E'};
        const { rover: newRover } = processMoveForward(grid, rover);
        expect(newRover.x).to.equal(rover.x + 1);
      });
    });

    it('can move forward off the grid in positive direction', () => {
      const grid = {
        x: 2,
        y: 2,
        lostMap: [[], [], []]
      };

      const rover = {
        x: 2,
        y: 2,
        orientation: 'N'
      };

      const { rover: newRover, grid: newGrid } = processMoveForward(grid, rover);
      expect(newRover.lost).to.equal(true);
      expect(grid.lostMap[rover.x][rover.y]).to.equal(true);
    });

    it('can move forward off the grid in negative direction', () => {
      const grid = {
        x: 2,
        y: 2,
        lostMap: [[], [], []],
      };

      const rover = {
        x: 2,
        y: 0,
        orientation: 'S'
      };

      const { rover: newRover, grid: newGrid } = processMoveForward(grid, rover);
      expect(newRover.lost).to.equal(true);
      expect(newGrid.lostMap[rover.x][rover.y]).to.equal(true);
    });

    it('will be saved by a previous rover', () => {
      const grid = {
        x: 2,
        y: 2,
        lostMap: [[], [], []],
      };
      const rover = { x: 2, y: 2, orientation: 'N'};

      const { grid: newGrid } = processMoveForward(grid, rover);
      const { rover: savedRover } = processMoveForward(newGrid, rover);

      expect(savedRover.x).to.equal(rover.x);
      expect(savedRover.x).to.equal(rover.x);
    });
  });

  describe('processRoverInstructions', () => {
    it('first sample instructions', () => {
      const rover = {
        x: 1,
        y: 1,
        orientation: 'E',
      };

      const grid = {
        x: 5,
        y: 3,
        lostMap: [[],[],[],[],[],[]],
      };

      const instructions = 'RFRFRFRF';

      const { rover: newRover } = processRoverInstructions(grid, rover, instructions);
      expect(newRover.x).to.equal(1);
      expect(newRover.y).to.equal(1);
      expect(newRover.orientation).to.equal('E');
    });

    it('second sample instructions', () => {
      const rover = {
        x: 3,
        y: 2,
        orientation: 'N',
      };

      const grid = {
        x: 5,
        y: 3,
        lostMap: [[],[],[],[],[],[]],
      };

      const instructions = 'FRRFLLFFRRFLL';

      const { rover: newRover } = processRoverInstructions(grid, rover, instructions);
      expect(newRover.x).to.equal(3);
      expect(newRover.y).to.equal(3);
      expect(newRover.orientation).to.equal('N');
      expect(newRover.lost).to.equal(true);
    });

    it('third sample instructions', () => {
      const rover = {
        x: 0,
        y: 3,
        orientation: 'W',
      };

      const grid = {
        x: 5,
        y: 3,
        lostMap: [[],[],[],[false,false,false,true,false,false],[],[]], // previous rover drove off at 3,3
      };

      const instructions = 'LLFFFLFLFL';

      const { rover: newRover } = processRoverInstructions(grid, rover, instructions);
      expect(newRover.x).to.equal(2);
      expect(newRover.y).to.equal(3);
      expect(newRover.orientation).to.equal('S');
    });
  });
});