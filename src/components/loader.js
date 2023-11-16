import React, { Component } from 'react';
import './loader.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import PropTypes from 'prop-types';

const loader = new STLLoader();

const scaleBox3 = (box, scale) => {
  // Step 1: Get the center of the Box3
  const center = new THREE.Vector3();
  box.getCenter(center);

  // Step 2: Apply the scale to the dimensions
  const newDimensions = new THREE.Vector3();
  box.getSize(newDimensions);
  newDimensions.multiplyScalar(scale);

  const newMin = new THREE.Vector3().copy(center).sub(newDimensions.clone().multiplyScalar(0.5));
  const newMax = new THREE.Vector3().copy(center).add(newDimensions.clone().multiplyScalar(0.5));

  box.setFromPoints([newMin, newMax]);
};

export class StlViewer extends Component {
  static propTypes = {
    file: PropTypes.instanceOf(ArrayBuffer),
    rescaleValue: PropTypes.number,
    isMeasuring: PropTypes.bool,
    isHighlighting: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.mesh = null;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(750, window.innerWidth / window.innerHeight, 1, 2000);
    this.renderer = new THREE.WebGLRenderer();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.controls.maxDistance = 700;
    this.controls.minDistance = 100;

    this.boundingBoxIndex = 0;
    this.currentDimension = new THREE.Vector3( );
    this.currentCenter = new THREE.Vector3( );
    this.boundingboxes = [[150, 150, 150, -150, -150, -150]];
    this.box3Arr = [];
    this.box3HelperArr = [];

    this.measurePoints = [];
    this.pointsVisualization = [];
    this.pointLine = null;
    this.curDistance = 0;

    this.state = {
      animateCallbacks: [],
    };
  }

  componentDidMount() {
    this.setupScene();
    this.loadSTLModel();
    this.setupWindowResizeHandler();
    this.animate();
  }

  componentDidUpdate(prevProps) {
    if (this.props.isHighlighting !== prevProps.isHighlighting) {
      this.rebuildBoxes();
    }
    if (this.props.file !== prevProps.file) {
      this.scene.remove(this.mesh);
      const geometry = loader.parse(this.props.file)
      const material = new THREE.MeshMatcapMaterial({
        color: 0xffffff,
      });
      this.mesh = new THREE.Mesh(geometry, material);

      this.mesh.geometry.computeVertexNormals(true);
      this.mesh.geometry.center();

      this.mesh.scale.set(this.props.rescaleValue, this.props.rescaleValue, this.props.rescaleValue);
      this.scene.add(this.mesh);
    }
    if (this.props.rescaleValue !== prevProps.rescaleValue) {
      this.mesh.scale.set(this.props.rescaleValue, this.props.rescaleValue, this.props.rescaleValue);
      this.rebuildBoxes();
      this.renderer.render(this.scene, this.camera);
    }
  }

  setupScene() {
    this.renderer.setSize(0.6 * window.innerWidth, 0.6 * window.innerHeight);
    this.mount.appendChild(this.renderer.domElement);

    this.camera.position.z = 500;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);

    this.scene.add(cube);

    const secondaryLight = new THREE.PointLight(0xff0000, 1, 100);
    secondaryLight.position.set(5, 5, 5);
    this.scene.add(secondaryLight);
  }

  loadSTLModel() {
    const geometry = loader.parse(this.props.file)
      const material = new THREE.MeshMatcapMaterial({
        color: 0xffffff,
      });
      this.mesh = new THREE.Mesh(geometry, material);

      this.mesh.geometry.computeVertexNormals(true);
      this.mesh.geometry.center();

      this.mesh.scale.set(this.props.rescaleValue, this.props.rescaleValue, this.props.rescaleValue);

      this.scene.add(this.mesh);

      //For bounding box, allow user to input left and right corner of box, then iterate to select which one
      if (this.props.isHighlighting) {
        for (let i = 0; i < this.boundingboxes.length; i++) {
          const vec1 = new THREE.Vector3(this.boundingboxes[i][0],this.boundingboxes[i][1],this.boundingboxes[i][2]);
          const vec2 = new THREE.Vector3(this.boundingboxes[i][3],this.boundingboxes[i][4],this.boundingboxes[i][5]);
          const box3 = new THREE.Box3();
          box3.setFromPoints([vec1,vec2]);
          scaleBox3(box3,this.props.rescaleValue);
          this.box3Arr.push(box3);
          let color = 0xff0000;
          if (i === this.boundingBoxIndex) {
            color = 0xffffff;
            const size = new THREE.Vector3();
            this.currentDimension = box3.getSize(size);
            const cent = new THREE.Vector3();
            this.currentCenter = box3.getCenter(cent);
          }
          const boxHelper = new THREE.Box3Helper(box3, color);
          this.box3HelperArr.push(boxHelper);
          this.scene.add(boxHelper);
        }
      }

      this.setState((prevState) => ({
        animateCallbacks: [...prevState.animateCallbacks, this.rotateModel],
      }));
  }

  rebuildBoxes = () => {
    // Clear existing boxes
    this.box3Arr.forEach((box) => this.scene.remove(box));
    this.box3HelperArr.forEach((boxHelper) => this.scene.remove(boxHelper));
  
    // Clear arrays
    this.box3Arr = [];
    this.box3HelperArr = [];
  
    // Iterate through boundingboxes and create new boxes
    if (this.props.isHighlighting) {
      this.boundingboxes.forEach((bbox, index) => {
        const vec1 = new THREE.Vector3(bbox[0], bbox[1], bbox[2]);
        const vec2 = new THREE.Vector3(bbox[3], bbox[4], bbox[5]);
        const box3 = new THREE.Box3();
        box3.setFromPoints([vec1, vec2]);
        scaleBox3(box3, this.props.rescaleValue);
        this.box3Arr.push(box3);
    
        
    
        let color = 0xff0000;
        if (index === this.boundingBoxIndex) {
          color = 0xffffff;
          const size = new THREE.Vector3();
          this.currentDimension = box3.getSize(size);
          const cent = new THREE.Vector3();
          this.currentCenter = box3.getCenter(cent);
        }

        const boxHelper = new THREE.Box3Helper(box3, color);
        this.box3HelperArr.push(boxHelper);
        this.scene.add(boxHelper);
      });
    }
  
    // Update state to trigger a re-render
    this.setState((prevState) => ({
      animateCallbacks: [...prevState.animateCallbacks, this.rotateModel],
    }));
  };

  setupWindowResizeHandler() {
    window.addEventListener('resize', this.handleWindowResize, false);
  }

  handleWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(0.6 * window.innerWidth, 0.6 * window.innerHeight);
  };

  animate = () => {
    requestAnimationFrame(this.animate);

    this.state.animateCallbacks.forEach((callback) => {
      callback();
    });

    this.renderer.render(this.scene, this.camera);
  };

  rotateModel = () => {
    // You can add rotation logic here
  };

  handleNew = () => {
    const newBoundingBox = [50, 50, 50, -50, -50, -50];
    this.boundingboxes.push(newBoundingBox);
    this.boundingBoxIndex = this.boundingboxes.length - 1;
    this.rebuildBoxes();
  };

  handleCornerChange = (e, v) => {
    const newValue = e.target.value;
    this.setState(
      () => {
        const newBoundingBoxes = this.boundingboxes;
        newBoundingBoxes[this.boundingBoxIndex][v] = newValue;
        return { boundingboxes: newBoundingBoxes };
      },
      () => {
        this.rebuildBoxes();
      }
    );
  };  

  handlePrev = () => {
    if (this.boundingBoxIndex > 0) {
      this.boundingBoxIndex -= 1; 
    } else {
      this.boundingBoxIndex = this.boundingboxes.length - 1
    }
    this.rebuildBoxes();
  };
  
  handleNext = () => {
    if (this.boundingBoxIndex < this.boundingboxes.length - 1) {
      this.boundingBoxIndex += 1;
    } else {
      this.boundingBoxIndex = 0
    }
    this.rebuildBoxes();
  };

  handleDelete = () => {
    if (this.boundingboxes.length > 1) {
      this.boundingboxes.splice(this.boundingBoxIndex, 1);
  
      if (this.boundingBoxIndex === this.boundingboxes.length) {
        this.boundingBoxIndex -= 1;
      }
  
      this.rebuildBoxes();
    }
  };

  handleMouseDown = (event) => {
    if (this.props.isMeasuring && this.measurePoints.length >= 2) {
      this.measurePoints = [];
      this.scene.remove(this.pointsVisualization[0]);
      this.scene.remove(this.pointsVisualization[1]);
      this.pointsVisualization = [];
      this.scene.remove(this.pointLine);
      this.pointLine = null;
    }
    if (this.props.isMeasuring && this.measurePoints.length < 2) {
      const scaleX = this.renderer.domElement.clientWidth / (0.6 * window.innerWidth);
      const scaleY = this.renderer.domElement.clientHeight / (0.6 * window.innerHeight);
      const rect = this.renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / this.renderer.domElement.clientWidth) * 2 - 1,
        -((event.clientY - rect.top) / this.renderer.domElement.clientHeight) * 2 + 1
      );
      mouse.x *= scaleX;
      mouse.y *= scaleY;
      

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.camera);

      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);

      this.measurePoints.push(intersection.clone());
      // console.log(intersection.clone())
      const sphereGeometry = new THREE.SphereGeometry(1, 10, 20);
      const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.copy(this.measurePoints[this.measurePoints.length-1]);
      this.pointsVisualization.push(sphere);
      this.scene.add(sphere);
      
    }
    if (this.measurePoints.length === 2) {
      this.drawMeasurements()
    };
    this.setState((prevState) => ({
      animateCallbacks: [...prevState.animateCallbacks, this.rotateModel],
    }));
  };

  drawMeasurements = () => {
    const distance = this.measurePoints[0].distanceTo(this.measurePoints[1]);
    this.curDistance = distance;

    let material = new THREE.LineBasicMaterial( { color: 0x00ffff } );
    let geometry = new THREE.BufferGeometry().setFromPoints( this.measurePoints );
    this.pointLine = new THREE.Line( geometry, material );
    this.scene.add(this.pointLine);

    this.setState((prevState) => ({
      animateCallbacks: [...prevState.animateCallbacks, this.rotateModel],
    }));
  };
  

  render() {
    return (
      <div>
        {this.props.isMeasuring && (
          <div className="buttons2">
            <label>Distance: {this.curDistance}</label>
          </div>
        )}
        {this.props.isHighlighting && (
          <div>
          <div className="buttons2">
            <button onClick={this.handlePrev}>Prev</button>
            <button onClick={this.handleNext}>Next</button>
            <button onClick={this.handleNew}>New</button>
            <button onClick={this.handleDelete}>Delete</button>
  
            <form>
              
              {this.boundingBoxIndex !== -1 && (
                <label>Dim: {JSON.stringify(this.currentDimension)} Center: {JSON.stringify(this.currentCenter)}</label>
              )}
            </form>
          </div>
          <div className="buttons2">

          <form>
            <label>
              <label>
                Corner 1: &nbsp;
                <input type="text" name="leftCornerx" value={this.boundingboxes[this.boundingBoxIndex][0]} onChange={(e) => this.handleCornerChange(e,0)}/>
                <input type="text" name="leftCornery" value={this.boundingboxes[this.boundingBoxIndex][1]} onChange={(e) => this.handleCornerChange(e,1)}/>
                <input type="text" name="leftCornerz" value={this.boundingboxes[this.boundingBoxIndex][2]} onChange={(e) => this.handleCornerChange(e,2)}/>
              </label>
              Corner 2: &nbsp;
              <input type="text" name="rightCornerx" value={this.boundingboxes[this.boundingBoxIndex][3]} onChange={(e) => this.handleCornerChange(e,3)}/>
              <input type="text" name="rightCornery" value={this.boundingboxes[this.boundingBoxIndex][4]} onChange={(e) => this.handleCornerChange(e,4)}/>
              <input type="text" name="rightCornerz" value={this.boundingboxes[this.boundingBoxIndex][5]} onChange={(e) => this.handleCornerChange(e,5)}/>
            </label>
          </form>
        </div>
        </div>
        )}
  
        <div ref={(ref) => (this.mount = ref)} onClick={this.handleMouseDown}/>
      </div>
    );
  }
}

export default StlViewer;
