import * as THREE from 'three';
import BaseComponent, { getGui } from '../base';
import Character from './Character';
import Environment from './Environment';

const gui = getGui();
const debug = {
  helpers: [],
  visible: false,
  isCreate: false,
};
export default class MetroStation extends BaseComponent {
  mesh: THREE.Mesh;

  center: THREE.Vector3;

  // 方向
  dir: THREE.Vector3;

  environment: Environment;

  collision: THREE.Mesh;

  plane: THREE.Mesh;

  constructor(mesh: THREE.Mesh, env: Environment) {
    super();
    this.mesh = mesh;
    this.environment = env;
    this.center = new THREE.Vector3().applyMatrix4(this.mesh.matrixWorld);

    this.getDir();
    this.createPlane();
    this.addClick(this.mesh, this.onClick.bind(this));

    setTimeout(() => {
      this.createAgent();
    }, 500 + Math.random() * 200);

    if (gui) {
      const arrowHelper = new THREE.ArrowHelper(
        this.dir,
        this.center,
        this.dir.length(),
        new THREE.Color(0, 0, 255),
      );
      this.scene.add(arrowHelper);
      arrowHelper.visible = debug.visible;
      debug.helpers.push(arrowHelper);
      if (!debug.isCreate) {
        debug.isCreate = true;
        gui.addFolder('metro').add(debug, 'visible').name('dir').onChange((v) => {
          debug.helpers.forEach(item => item.visible = v);
        });
      }
    }
  }

  onClick() {
    this.createAgent();
  }

  createAgent() {
    const character = new Character({
      environment: this.environment,
      position: this.center,
    });
    const position = new THREE.Vector3().addVectors(this.center, this.dir);
    character.walk(position, 3);

    // @ts-ignore
    window.test = character;
  }

  getDir() {
    const boundingBox = this.mesh.geometry.boundingBox.clone().applyMatrix4(this.mesh.matrixWorld);

    THREE.BoxHelper;

    const { max, min } = boundingBox.clone();

    const dir0 = new THREE.Vector3().subVectors(
      max.clone().setY(0),
      min.clone().setY(0),
    );

    const dir1 = new THREE.Vector3().subVectors(
      new THREE.Vector3(max.x, 0, min.z),
      new THREE.Vector3(min.x, 0, max.z),
    );

    const dir2 = new THREE.Vector3().subVectors(
      new THREE.Vector3(min.x, 0, max.z),
      new THREE.Vector3(max.x, 0, min.z),
    );

    const dir3 = new THREE.Vector3().subVectors(dir1, dir0.clone().negate());
    const dir4 = new THREE.Vector3().subVectors(dir2, dir0.clone().negate());

    let dir = dir3;

    if (dir.length() < dir4.length()) {
      dir = dir4;
    }

    dir.normalize();
    this.dir = dir;
    // 有问题
    this.collision = new THREE.Mesh(
      new THREE.BoxGeometry(
        boundingBox.max.x - boundingBox.min.x,
        boundingBox.max.y - boundingBox.min.y,
        boundingBox.max.z - boundingBox.min.z,
      ),
      new THREE.MeshLambertMaterial({ color: 0xff0000 }),
    );
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
    this.plane.position.copy(this.center);
    this.scene.add(this.plane);
  }
}
