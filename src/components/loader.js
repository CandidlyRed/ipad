import React from 'react';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import pathToStl from "../g.stl";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import PropTypes from 'prop-types'

const loader = new STLLoader();

function createAnimate({ scene, camera, renderer }) {
  const triggers = [];

  function animate() {
    requestAnimationFrame(animate);

    triggers.forEach((trigger) => {
      trigger();
    });

    renderer.render(scene, camera);
  }
  function addTrigger(cb) {
    if (typeof cb === "function") triggers.push(cb);
  }
  function offTrigger(cb) {
    const triggerIndex = triggers.indexOf(cb);
    if (triggerIndex !== -1) {
      triggers.splice(triggerIndex, 1);
    }
  }

  return {
    animate,
    addTrigger,
    offTrigger
  };
}

export class StlViewer extends React.Component {
    
    static propTypes = {
        file: PropTypes.object,
        width: PropTypes.number,
        height: PropTypes.number,
    };
    
    componentDidMount() {
        this.renderModel(this.props);
        }

    renderModel(props) {
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
        750,
        window.innerWidth / window.innerHeight,
        1,
        2000);

        loader.load(pathToStl, (geometry) => {
        const material = new THREE.MeshMatcapMaterial({
            color: 0xffffff,
        });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.geometry.computeVertexNormals(true);
        mesh.geometry.center();

        mesh.scale.set(props.rescaleValue, props.rescaleValue, props.rescaleValue);

        scene.add(mesh);

        mesh.rotation.x = -1.2;

        let box3 = new THREE.Box3().setFromObject(mesh);
        let size = new THREE.Vector3();
        console.log(box3.getSize(size));

        animate.addTrigger(() => {
            
            // mesh.rotation.x += 0.05;
            // mesh.rotation.y += 0.05;
        });
        });

        


        const renderer = new THREE.WebGLRenderer();

        const controls = new OrbitControls(camera, renderer.domElement);

        controls.maxDistance = 700;
        controls.minDistance = 100;

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        /**
         * Light setup
         */
        const secondaryLight = new THREE.PointLight(0xff0000, 1, 100);
        secondaryLight.position.set(5, 5, 5);
        scene.add(secondaryLight);

        renderer.setSize(.6*window.innerWidth, .6*window.innerHeight);
        this.mount.appendChild(renderer.domElement);

        function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(.6*window.innerWidth, .6*window.innerHeight);
        }

        window.addEventListener("resize", onWindowResize, false);

        const animate = createAnimate({ scene, camera, renderer });

        camera.position.z = 500;

        animate.animate();


    }
    render() {
        return <div 
            ref={(ref) => (this.mount = ref)} />;
    }
}