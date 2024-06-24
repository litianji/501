import BaseComponent from '../base';
import * as THREE from 'three';

export default class Building extends BaseComponent {
  mesh: THREE.Mesh;

  center: THREE.Vector3;

  plane: THREE.Mesh;

  constructor(mesh: THREE.Mesh) {
    super();
    this.mesh = mesh;
    this.center = new THREE.Vector3().applyMatrix4(this.mesh.matrixWorld);
    this.createPlane();
    this.addClick(mesh, this.onClick.bind(this));
  }

  onClick() {
    console.log('click build', this);
  }

  createPlane() {
    const border = 0.5;
    const boundingBox = this.mesh.geometry.boundingBox.clone().applyMatrix4(this.mesh.matrixWorld);
    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(
        boundingBox.max.x - boundingBox.min.x + border,
        boundingBox.max.z - boundingBox.min.z + border,
      ),
      new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0 }),
    );
    this.plane.name = 'metro-plane';
    this.plane.rotation.x = -Math.PI / 2;
    this.plane.position.copy(this.center.clone().setY(0.1));

    this.scene.add(this.plane);
  }
}
