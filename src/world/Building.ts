import BaseComponent from '../base';
import * as THREE from 'three';

export default class Building extends BaseComponent {
  mesh: THREE.Mesh;

  constructor(mesh: THREE.Mesh) {
    super();
    this.mesh = mesh;
    this.addClick(mesh, this.onClick.bind(this));
  }

  onClick() {
    console.log('click build');
  }
}
