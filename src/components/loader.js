import React, { Component } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import PropTypes from 'prop-types';

import pathToStl from '../g.stl';

const loader = new STLLoader();

export class StlViewer extends Component {
  static propTypes = {
    rescaleValue: PropTypes.number,
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
    if (this.props.rescaleValue !== prevProps.rescaleValue) {
      this.mesh.scale.set(this.props.rescaleValue, this.props.rescaleValue, this.props.rescaleValue);
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
    loader.load(pathToStl, (geometry) => {
      const material = new THREE.MeshMatcapMaterial({
        color: 0xffffff,
      });
      this.mesh = new THREE.Mesh(geometry, material);

      this.mesh.geometry.computeVertexNormals(true);
      this.mesh.geometry.center();

      this.mesh.scale.set(this.props.rescaleValue, this.props.rescaleValue, this.props.rescaleValue);

      this.scene.add(this.mesh);

      const box3 = new THREE.Box3().setFromObject(this.mesh);
      const size = new THREE.Vector3();
      console.log(box3.getSize(size));
      const boxHelper = new THREE.Box3Helper(box3, 0xff0000); // Specify the color you want
      this.scene.add(boxHelper);
      //For bounding box, allow user to input left and right corner of box, then iterate to select which one

      this.setState((prevState) => ({
        animateCallbacks: [...prevState.animateCallbacks, this.rotateModel],
      }));
    });
  }

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

  render() {
    return <div ref={(ref) => (this.mount = ref)} />;
  }
}

export default StlViewer;
