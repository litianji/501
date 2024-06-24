import BaseComponent, { getGui } from '../base';
import * as THREE from 'three';
import CollisionPhysics from './CollisionPhysics';
import Environment from './Environment';
import PhysicsWorld from './PhysicsWorld';

const gui = getGui();
const debugHelper = { visible: true, helpers: [], isCreated: false };

export type ParamsType = {
  environment: Environment,
  position: THREE.Vector3,
  mesh?: THREE.Mesh | THREE.Object3D,
  speed?: number,
  radius?: number,
  height?: number,
}

export default class Agent extends BaseComponent {
  id: string;

  mesh: THREE.Mesh | THREE.Object3D;

  color: number = 0xffffff;

  position: THREE.Vector3 = new THREE.Vector3(0, 0.5, 0);

  radius: number = 0.1;

  height: number = 0.2;

  speed: number = 1.4;

  collisionPhysics: CollisionPhysics;

  physicsWorld: PhysicsWorld;

  walkDir: THREE.Vector3;

  environment: Environment;

  lookDir: THREE.Vector3;

  lookQuaternion: THREE.Quaternion;

  clock: THREE.Clock = new THREE.Clock();

  constructor(params: ParamsType) {
    super();

    this.id = (Math.floor(Math.random() * 1e8)).toString(16);
    this.speed = params.speed || this.speed;
    this.radius = params.radius || this.radius;
    this.height = params.height || this.height;
    this.position = params.position || this.position;
    this.mesh = params.mesh;
    this.physicsWorld = params.environment.physicsWorld;
    this.environment = params.environment;
    this.lookDir = new THREE.Vector3(0, 0, 1);

    this.init();

    if (gui) {
      debugHelper.helpers.push(this);

      if (!debugHelper.isCreated) {
        debugHelper.isCreated = true;
        const folder = gui.addFolder('agent');
        folder.add(this, 'speed').onChange((value) => {
          debugHelper.helpers.forEach(item => {
            item.speed = value;
          });
        }); ;
      }
    }
  }

  init() {
    const { radius, height } = this;

    this.mesh = this.mesh || this.createBody();
    this.scene.add(this.mesh);

    this.collisionPhysics = new CollisionPhysics({
      type: 'agent',
      mesh: this.mesh,
      physicsWorld: this.physicsWorld,
      capsuleInfo: {
        radius: radius,
        segment: new THREE.Line3(new THREE.Vector3(), new THREE.Vector3(0, height, 0)),
      },
      movement: (delta) => {
        if (!this.walkDir || this.walkDir.length() <= 0) {
          return;
        }
        this.walkDir.normalize();
        this.mesh.position.addScaledVector(this.walkDir, this.speed * delta);
        this.applyLook();
        return this.walkDir;
      },
    });
    this.physicsWorld.addBox(this.collisionPhysics);
  }

  createBody() {
    const body = new THREE.Object3D();
    const mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(this.radius, this.height, 10, 20),
      new THREE.MeshLambertMaterial(),
    );
    mesh.name = 'body';
    mesh.geometry.translate(0, this.height / 2, 0);

    body.name = 'character';
    body.add(mesh);
    body.position.copy(this.position);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return body;
  }

  applyLook() {
    // if (this.lookDir === this.walkDir) {
    //   return;
    // }
    // const z = new THREE.Vector3(0, 0, 1);
    // if (!this.lookQuaternion) {
    //   this.lookQuaternion = new THREE.Quaternion().setFromUnitVectors(z, this.walkDir);
    //   this.mesh.rotation.setFromQuaternion(this.lookQuaternion);
    // } else {
    //   const lookSpeed = 1;
    //   const step = THREE.MathUtils.clamp(this.clock.getElapsedTime() * lookSpeed, 0, 1);
    //   console.log('step', step);
    //   const total = new THREE.Quaternion().setFromUnitVectors(z, this.walkDir);
    //   this.lookQuaternion = new THREE.Quaternion().slerpQuaternions(
    //     this.lookQuaternion,
    //     total,
    //     1 - step,
    //   );

    //   this.mesh.rotation.setFromQuaternion(this.lookQuaternion);

    //   if (step === 1) {
    //     this.clock = new THREE.Clock();
    //     this.lookDir = this.walkDir;
    //   }
    // }

    const z = new THREE.Vector3(0, 0, 1);
    this.lookQuaternion = new THREE.Quaternion().setFromUnitVectors(z, this.walkDir);
    this.mesh.rotation.setFromQuaternion(this.lookQuaternion);
  }
}
