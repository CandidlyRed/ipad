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



// document.addEventListener("mousedown", onDocumentMouseDown, false);

// var points = [
//   new THREE.Vector3(),
//   new THREE.Vector3()
// ]
// var clicks = 0;

// var markerA = new THREE.Mesh(
//   new THREE.SphereGeometry(0.1, 10, 20),
//   new THREE.MeshBasicMaterial({
//     color: 0xff5555
//   })
// );
// var markerB = markerA.clone();
// var markers = [
//   markerA, markerB
// ];
// scene.add(markerA);
// scene.add(markerB);

// var lineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
// var lineMaterial = new THREE.LineBasicMaterial({
//   color: 0xff5555
// });
// var line = new THREE.Line(lineGeometry, lineMaterial);
// scene.add(line);

// function getIntersections(event) {
//   var vector = new THREE.Vector2();

//   vector.set(
//     event.clientX / window.innerWidth * 2 - 1,
//     -(event.clientY / window.innerHeight) * 2 + 1
//   );

//   var raycaster = new THREE.Raycaster();
//   raycaster.setFromCamera(vector, camera);

//   var intersects = raycaster.intersectObjects(scene.children);

//   return intersects;
// }

// function setLine(vectorA, vectorB) {
//   line.geometry.attributes.position.setXYZ(0, vectorA.x, vectorA.y, vectorA.z);
//   line.geometry.attributes.position.setXYZ(1, vectorB.x, vectorB.y, vectorB.z);
//   line.geometry.attributes.position.needsUpdate = true;
// }

// function onDocumentMouseDown(event) {
//   var intersects = getIntersections(event);

//   if (intersects.length > 0) {

//     points[clicks].copy(intersects[0].point);
//     markers[clicks].position.copy(intersects[0].point);
//     setLine(intersects[0].point, intersects[0].point);
//     clicks++;
//     if (clicks > 1){
//       var distance = points[0].distanceTo(points[1]);
//       console.log(distance);
//       setLine(points[0], points[1]);
//       clicks = 0;
//     }
//   }
// }
    }
    render() {
        return <div 
            ref={(ref) => (this.mount = ref)} />;
    }
}