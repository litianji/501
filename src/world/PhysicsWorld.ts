import * as THREE from 'three';
import {
  StaticGeometryGenerator,
  MeshBVH,
  MeshBVHHelper,
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
} from 'three-mesh-bvh';
import BaseComponent from '../base';
import CollisionPhysics from './CollisionPhysics';
import { getGui } from '../base';

const gui = getGui();

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

// 碰撞环境，存储所有需要碰撞的物体
export default class PhysicsWorld extends BaseComponent {
  environment: THREE.Group = new THREE.Group();

  boxs: CollisionPhysics[] = [];

  collider: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;

  displayCollider: boolean = false;

  displayBVH: boolean = false;

  visualizer: MeshBVHHelper;

  static gravity: number = -9.8;

  clock: THREE.Clock = new THREE.Clock();

  colliderDebug: any;

  constructor() {
    super();
    this.environment.name = 'environment';

    if (gui) {
      const folder = gui.addFolder('collider');
      folder.add(this, 'displayCollider');
      folder.add(this, 'displayBVH');
      this.colliderDebug = folder;
    }
  }

  attach(meshs) {
    if (!Array.isArray(meshs)) {
      return;
    }
    meshs.forEach(mesh => {
      const meshCollider = mesh.clone();
      this.environment.attach(meshCollider);
    });
  }

  addBox(box) {
    if (!this.boxs.includes(box)) {
      this.boxs.push(box);
    }
  }

  setColliderEnviroment() {
    const staticGenerator = new StaticGeometryGenerator(this.environment);
    staticGenerator.attributes = ['position'];

    const mergedGeometry = staticGenerator.generate();
    mergedGeometry.boundsTree = new MeshBVH(mergedGeometry);

    this.collider = new THREE.Mesh(mergedGeometry);
    this.collider.material.wireframe = true;
    this.collider.material.opacity = 1;
    this.collider.material.transparent = true;
    this.collider.material.color = new THREE.Color('#000000');
    this.collider.name = 'collider';

    this.visualizer = new MeshBVHHelper(this.collider, 10);

    this.scene.add(this.collider);
    this.scene.add(this.visualizer);
  }

  // 角色之间的碰撞处理
  handleCharacterCollision() {
    if (this.boxs.length < 2) {
      return;
    }

    // 清除状态
    this.boxs.forEach(item => item.isInsert = false);

    for (let i = 0; i < this.boxs.length - 1; i++) {
      for (let j = i + 1; j < this.boxs.length; j++) {
        const c0 = this.boxs[i];
        const c1 = this.boxs[j];

        // 只考虑x和z方向上的距离
        const deltaVec = new THREE.Vector3();
        const start = c0.tempSegment.start.clone().setY(0);
        const end = c1.tempSegment.start.clone().setY(0);

        deltaVec.subVectors(end, start);
        const aDistance = deltaVec.length();
        const minDistance = c0.params.capsuleInfo.radius + c1.params.capsuleInfo.radius;
        const depth = aDistance - minDistance;

        if (depth <= 0) {
          c0.isInsert = true;
          c1.isInsert = true;

          deltaVec.normalize();

          // 根据质量分配受力
          const r = c0.mass / (c0.mass + c1.mass);
          if (aDistance === 0) {
            const vec2 = new THREE.Vector3(1, 0, 0);
            c0.force.sub(vec2.clone().multiplyScalar(1 - r));
            c1.force.add(vec2.clone().multiplyScalar(r));
          } else {
            const num = aDistance / minDistance;
            let num7 = 1 - num;
            num7 = 3 * num7 * num7 - 2 * num7 ** 3;
            num7 *= 12;

            const vec3 = deltaVec.clone().multiplyScalar(num7);
            const vec = vec3.clone().negate().multiplyScalar(1 - r);
            const vec2 = vec3.clone().multiplyScalar(r);

            c0.force.add(vec);
            c1.force.add(vec2);
          }
        }
      }
    }
  }

  render() {
    if (this.collider) {
      this.collider.visible = this.displayCollider;
      this.visualizer.visible = this.displayBVH;
    }

    this.handleCharacterCollision();

    // debug
    // this.boxs.forEach(item => {
    //   // @ts-ignore
    //   item.mesh.children[0].material.color = item.isInsert
    //     ? new THREE.Color(0x000000) : new THREE.Color(item.character.color);
    // });
  }
}
