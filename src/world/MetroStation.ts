import * as THREE from 'three';
import BaseComponent from '../base';

export default class MetroStation extends BaseComponent {
  mesh: THREE.Mesh;

  constructor(mesh: THREE.Mesh) {
    super();
    this.mesh = mesh;

    console.log(this.mesh);

    this.addClick(this.mesh, this.onClick.bind(this));
  }

  onClick() {
    console.log('click');
  }

  createAgent() {

  }
}
