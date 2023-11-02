import React, { Component } from 'react';
import './App.css';
import { StlViewer } from "./components/loader.js";

class App extends Component {
  state = {
    stlFile: null,
    rescaleValue: 1.0,
    isMeasuring: false,
    isHighlighting: false,
    loadedFileName: "",
  };

  handleFileChange = (e) => {
    const file = e.target.files[0];
    this.setState({
      stlFile: file,
      loadedFileName: file ? file.name : "",
    });
  }

  toggleMeasuring = () => {
    this.setState((prevState) => ({ isMeasuring: !prevState.isMeasuring }));
  }

  toggleHighlighting = () => {
    this.setState((prevState) => ({ isHighlighting: !prevState.isHighlighting }));
  }

  render() {
    const { loadedFileName, rescaleValue, isMeasuring, isHighlighting, stlFile } = this.state;

    return (
      <div className="App">
        <div className="buttons">
            <label className="load-button" htmlFor="obj-file">
            Load
            <input
                type="file"
                name="obj-file"
                id="obj-file"
                onChange={this.handleFileChange}
                style={{ display: 'none' }}
            />
            </label>
            <p className="loaded-file-message">Loaded STL File: {loadedFileName}</p>
            <p>Rescale: </p>
          <input
            type="number"
            step="0.1"
            value={rescaleValue}
            onChange={(e) => this.setState({ rescaleValue: parseFloat(e.target.value) })}
          />
          <button onClick={this.toggleMeasuring}>
            {isMeasuring ? "Stop Measure" : "Measure"}
          </button>
          <button onClick={this.toggleHighlighting}>
            {isHighlighting ? "Stop Highlight" : "Highlight"}
          </button>
        </div>
        <div className="container" id="div2">
          {stlFile && (
            <StlViewer
              file={stlFile}
              rescaleValue={rescaleValue}
              isMeasuring={isMeasuring}
              isHighlighting={isHighlighting}
            />
          )}
        </div>
      </div>
    );
  }
}

export default App;
