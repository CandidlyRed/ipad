import React, { Component } from 'react';
import './App.css';
import { StlViewer } from "./components/loader.js";

class App extends Component {
  constructor() {
    super();
    this.state = {
      stlFile: null,
      rescaleValue: 1.0,
      isMeasuring: false,
      isHighlighting: false,
      loadedFileName: "",
    };
  }

  handleFileChange = (e) => {
    console.log(e.target.files);
    const file = e.target.files[0];
    this.setState({
      stlFile: file,
      loadedFileName: file ? file.name : "",
    });
  }

  render() {
    return (
      <div className="App">
        <div className="buttons">
          <p className="loaded-file-message">Loaded STL File: {this.state.loadedFileName}</p>
          <label className="load-button" htmlFor="obj-file">
            Load STL by file
            <input
              type="file"
              name="obj-file"
              id="obj-file"
              onChange={this.handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
          <button onClick={this.handleRescale}>
            Rescale
          </button>
          <input
            type="number"
            step="0.1"
            value={this.state.rescaleValue}
            onChange={(e) => this.setState({ rescaleValue: parseFloat(e.target.value) })}
          />
          <button onClick={() => this.setState({ isMeasuring: !this.state.isMeasuring })}>
            {this.state.isMeasuring ? "Stop Measure" : "Measure"}
          </button>
          <button onClick={() => this.setState({ isHighlighting: !this.state.isHighlighting })}>
            {this.state.isHighlighting ? "Stop Highlight" : "Highlight"}
          </button>
        </div>
        <div className="container" id="div2">
          {this.state.stlFile ? (
            <StlViewer
              file={this.state.stlFile}
              rescaleValue={this.state.rescaleValue}
              isMeasuring={this.state.isMeasuring}
              isHighlighting={this.state.isHighlighting}
            />
          ) : null}
        </div>
      </div>
    );
  }
}

export default App;