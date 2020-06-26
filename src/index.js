import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { ButtonToolbar, Dropdown, DropdownButton } from 'react-bootstrap';

// This is the class for invidual boxes.
class Box extends React.Component {
	selectBox = () => {
		this.props.selectBox(this.props.row, this.props.col);
	}

	render() {
		return (
			<div
				className={this.props.boxClass}
				id={this.props.id}
				onClick={this.selectBox}
			/>
		);
	}
}

class Grid extends React.Component {
	render() {
    // setting the width of the grid
    const width = (this.props.cols * 16);
    // setting an empty rowsArr
		var rowsArr = [];

    // setting boxClasss equal to an empty string
    var boxClass = "";
    // looping over each cell in the Array's ROW
		for (var i = 0; i < this.props.rows; i++) {
      // looping over each cell in the Array's COLUMNS
			for (var j = 0; j < this.props.cols; j++) {
        // setting the boxId = i_j
				let boxId = i + "_" + j;

        // setting boxClass equal to the grids cells i, j and either "On" or "Off"
        boxClass = this.props.gridFull[i][j] ? "box on" : "box off";
        // For every iteration of the loop, create a box (a cell) which will be a row with a column [i], [j]
				rowsArr.push(
          // Pushing the box component into the rowsArr with the following props.
					<Box
						boxClass={boxClass}
						key={boxId}
						boxId={boxId}
						row={i}
						col={j}
						selectBox={this.props.selectBox}
					/>
				);
			}
		}

		return (
			<div className="grid" style={{width: width}}>
				{rowsArr}
			</div>
		);
	}
}

class Buttons extends React.Component {

	handleSelect = (evt) => {
		this.props.gridSize(evt);
	}

	render() {
		return (
			<div className="center">
					<button className="btn btn-default" onClick={this.props.playButton}>
						Play
					</button>
					<button className="btn btn-default" onClick={this.props.pauseButton}>
					  Pause
					</button>
					<button className="btn btn-default" onClick={this.props.clear}>
					  Clear
					</button>
					<button className="btn btn-default" onClick={this.props.slow}>
					  Slow
					</button>
					<button className="btn btn-default" onClick={this.props.fast}>
					  Fast
					</button>
					<button className="btn btn-default" onClick={this.props.seed}>
					  Seed
					</button>

            <DropdownButton title="Grid Size" id="size-menu" onSelect={this.handleSelect}>
              <Dropdown.Item eventKey="1">25x25</Dropdown.Item>
              <Dropdown.Item eventKey="2">50x50</Dropdown.Item>
            </DropdownButton>
			</div>
			)
	}
}

class Main extends React.Component {
	constructor() {
    super();
    // speed of the game
    this.speed = 100;
    // amount of rows
	this.rows = 50;
    // amount of columns
	this.cols = 50;

	this.state = {
      // setting generation = 0 at start
      generation: 0,
      // this is our default grid. It's an Array of the rows which we're mapping over and filling with columns all set to "dead" by default for every cell in the grid.
			gridFull: Array(this.rows).fill().map(() => Array(this.cols).fill(false))
		}
	}

	randomColor = () => {
		Math.floor(Math.random()*16777215).toString(16);
	}

	selectBox = (row, col) => {
		let gridCopy = arrayClone(this.state.gridFull);
		gridCopy[row][col] = !gridCopy[row][col];
		this.setState({
			gridFull: gridCopy
		});
	}

	seed = () => {
		let gridCopy = arrayClone(this.state.gridFull);
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				if (Math.floor(Math.random() * 4) === 1) {
					gridCopy[i][j] = true;
				}
			}
		}
		this.setState({
			gridFull: gridCopy
		});
	}

	playButton = () => {
		clearInterval(this.intervalId);
		this.intervalId = setInterval(this.play, this.speed);
	}

	pauseButton = () => {
		clearInterval(this.intervalId);
	}

	slow = () => {
		this.speed = 1000;
		this.playButton();
	}

	fast = () => {
		this.speed = 100;
		this.playButton();
	}

	clear = () => {
		var grid = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
		this.setState({
			gridFull: grid,
			generation: 0
		});
	}

	gridSize = (size) => {
		switch (size) {
			case "1":
				this.cols = 25;
				this.rows = 25;
			break;
			case "2":
				this.cols = 50;
				this.rows = 50;
			break;
		}
		this.clear();

	}

	play = () => {
		// our original grid
		let g = this.state.gridFull;
		// our cloned grid which we will mutate
		let g2 = arrayClone(this.state.gridFull);

		// go through every cell in the grid [i][j]
		for (let i = 0; i < this.rows; i++) {
		  for (let j = 0; j < this.cols; j++) {
			let count = 0;
			// our conditionals for if a cell is alive or dead
		    if (i > 0) if (g[i - 1][j]) count++;
		    if (i > 0 && j > 0) if (g[i - 1][j - 1]) count++;
		    if (i > 0 && j < this.cols - 1) if (g[i - 1][j + 1]) count++;
		    if (j < this.cols - 1) if (g[i][j + 1]) count++;
		    if (j > 0) if (g[i][j - 1]) count++;
		    if (i < this.rows - 1) if (g[i + 1][j]) count++;
		    if (i < this.rows - 1 && j > 0) if (g[i + 1][j - 1]) count++;
		    if (i < this.rows - 1 && j < this.cols - 1) if (g[i + 1][j + 1]) count++;
		    if (g[i][j] && (count < 2 || count > 3)) g2[i][j] = false;
		    if (!g[i][j] && count === 3) g2[i][j] = true;
		  }
		}
		this.setState({
		  gridFull: g2,
		  generation: this.state.generation + 1
		});

	}

	componentDidMount() {
		this.seed();
		this.playButton();
	}

	render() {
		return (
			<div className="board">
				<h1>The Game of Life</h1>
				<Buttons
					playButton={this.playButton}
					pauseButton={this.pauseButton}
					slow={this.slow}
					fast={this.fast}
					clear={this.clear}
					seed={this.seed}
					gridSize={this.gridSize}
				/>
				<Grid
					gridFull={this.state.gridFull}
					rows={this.rows}
					cols={this.cols}
					selectBox={this.selectBox}
				/>
				<h2>Generations: {this.state.generation}</h2>

				<div className="rules">
					<h1>
						The Rules:<br/>
						Any live cell with two or three live neighbours survives.<br/>
						Any dead cell with three live neighbours becomes a live cell.<br/>
						All other live cells die in the next generation. Similarly, all other dead cells stay dead.
					</h1>
				</div>
			</div>
		);
	}
}

function arrayClone(arr) {
	return JSON.parse(JSON.stringify(arr));
}

ReactDOM.render(<Main />, document.getElementById('root'));