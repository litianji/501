import * as THREE from 'three';
import BaseComponent, { resources } from '../base';
import MetroStation from './MetroStation';
import Building from './Building';
import PhysicsWorld from './PhysicsWorld';

export default class Environment extends BaseComponent {
  floor: THREE.Mesh;

  meshs: THREE.Mesh[] = [];

  metroStations: MetroStation[] = [];

  buildings: Building[] = [];

  physicsWorld: PhysicsWorld;

  constructor() {
    super();
    this.init();
  }

  init() {
    this.floor = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50, 200, 200),
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
          const metro = new MetroStation(item, this);
          this.meshs.push(item);
          this.metroStations.push(metro);
        }

        if (item.name === 'Cube') {
          this.meshs.push(item);
          this.buildings.push(new Building(item));
        }
      }
    });

    this.scene.add(data.scene);

    // 物理世界
    this.physicsWorld = new PhysicsWorld();
    this.physicsWorld.attach(this.meshs);
    this.physicsWorld.setColliderEnviroment();
  }

  checkValidPoint(point: THREE.Vector3) {
    const raycaster = new THREE.Raycaster();
    const down = new THREE.Vector3(0, -1, 0);
    const target = point.clone().setY(100);
    raycaster.set(target, down);
    const intersects = raycaster.intersectObjects(this.meshs);

    if (!intersects.length) {
      return false;
    }

    if (intersects[0].object.name === 'floor') {
      return true;
    } else {
      return false;
    }
  }
}
