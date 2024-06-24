import BaseComponent, { resources, getOrbitControls } from '../base';
import Environment from './Environment';
import Lights from './Lights';
import * as THREE from 'three';

export default class World extends BaseComponent {
  environment: Environment;

  constructor() {
    super();

    console.log(this);
    const orbitControls = getOrbitControls();
    // orbitControls.enableZoom = false;
    // orbitControls.minPolarAngle = Math.PI * 0.3;
    // orbitControls.maxPolarAngle = Math.PI * 0.3;
    this.init();
  }

  init() {
    this.loadResources().then(() => {
      this.setEnvironment();
      this.setLight();
      // this.setFog();
    });
  }

  loadResources() {
    return resources.load([
      {
        key: 'ant',
        type: 'glb',
        path: 'ant.glb',
      },
      {
        key: 'Zombie_Male',
        type: 'glb',
        path: 'characters/Zombie_Male.gltf',
      },
      {
        key: 'Worker_Male',
        type: 'glb',
        path: 'characters/Worker_Male.gltf',
      },
      {
        key: 'Yeti',
        type: 'glb',
        path: 'characters/Yeti.gltf',
      },
      {
        key: 'Casual2_Male',
        type: 'glb',
        path: 'characters/Casual2_Male.gltf',
      },
    ]);
  }

  setEnvironment() {
    this.environment = new Environment();
  }

  setLight() {
    this.scene.add(...Lights);
  }

  setFog() {
    this.scene.fog = new THREE.Fog(0xcccccc, 10, 60);
  }
}
