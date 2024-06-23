import BaseComponent from '../base';
import * as THREE from 'three';

export default class Building extends BaseComponent {
  mesh: THREE.Mesh;

  center: THREE.Vector3;

  constructor(mesh: THREE.Mesh) {
    super();
    this.mesh = mesh;
    this.center = new THREE.Vector3().applyMatrix4(this.mesh.matrixWorld);
    this.addClick(mesh, this.onClick.bind(this));
  }

  onClick() {
    console.log('click build', this);
  }
}
