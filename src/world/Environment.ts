import * as THREE from 'three';
import BaseComponent, { resources } from '../base';
import MetroStation from './MetroStation';
import Building from './Building';

export default class Environment extends BaseComponent {
  floor: THREE.Mesh;

  meshs: THREE.Mesh[] = [];

  metroStations: MetroStation[] = [];

  buildings: Building[] = [];

  constructor() {
    super();
    this.init();
  }

  init() {
    this.floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100, 200, 200),
      new THREE.MeshStandardMaterial({ color: 0xe9e9e9 }),
    );

    this.floor.name = 'floor';
    this.floor.rotation.x = -Math.PI / 2;
    this.scene.add(this.floor);
    this.floor.receiveShadow = true;

    this.meshs.push(this.floor);

    const { data } = resources.get('ant');
    data.scene.traverse(item => {
      if (item.name === 'floor') {
        item.visible = false;
      }

      if (item instanceof THREE.Mesh) {
        item.receiveShadow = true;
        item.castShadow = true;

        if (item.name === 'item') {
          item.receiveShadow = false;
        }

        if (item.name.includes('metroStation')) {
          this.metroStations.push(new MetroStation(item));
        }

        if (item.name === 'Cube') {
          this.buildings.push(new Building(item));
        }
      }
    });

    this.scene.add(data.scene);
  }
}
