import * as THREE from 'three';
import BaseComponent, { getGui } from '../base';
import PhysicsWorld from './PhysicsWorld';

export type ParamsType = {
  mesh: THREE.Mesh | THREE.Object3D,
  physicsWorld: PhysicsWorld,
  capsuleInfo?: any,
  type?: string,
  movement?: Function,
}

const gui = getGui();
const debugHelper = { visible: true, helpers: [], isCreated: false };

// 处理的物体重力和与静态物理环境的碰撞
// 这个类包含物体速度和方向等属性
export default class CollisionPhysics extends BaseComponent {
  mesh: THREE.Mesh | THREE.Object3D;

  physicsWorld: PhysicsWorld;

  type: string;

  params: ParamsType;

  isOnGround: Boolean = false;

  velocity: THREE.Vector3 = new THREE.Vector3();

  gravity: number = -9.8;

  clock: THREE.Clock = new THREE.Clock();

  tempVector: THREE.Vector3 = new THREE.Vector3();

  tempVector2: THREE.Vector3 = new THREE.Vector3();

  tempBox: THREE.Box3 = new THREE.Box3();

  tempMat: THREE.Matrix4 = new THREE.Matrix4();

  tempSegment: THREE.Line3 = new THREE.Line3();

  mass: number = 10;

  force: THREE.Vector3 = new THREE.Vector3();

  moveVec: THREE.Vector3;

  isInsert: boolean = false;

  constructor(params: ParamsType) {
    super();

    this.mesh = params.mesh;
    this.physicsWorld = params.physicsWorld;
    this.type = params.type || 'default';
    this.params = params;

    if (gui && this.params.capsuleInfo) {
      const helper = new THREE.Box3Helper(this.tempBox, new THREE.Color(0, 0, 0));
      debugHelper.helpers.push(helper);
      this.scene.add(helper);
      helper.visible = debugHelper.visible;

      if (!debugHelper.isCreated) {
        this.physicsWorld.colliderDebug
          .add(debugHelper, 'visible')
          .name('tempBox')
          .onChange((visible) => {
            debugHelper.helpers.forEach(item => {
              item.visible = visible;
            });
          });
        debugHelper.isCreated = true;
      }
    }
  }

  update(delta) {
    // 重力部分
    // v = g * t总 = v' + g * △t ==> v += g * △t
    if (this.isOnGround) {
      this.velocity.y = delta * this.gravity;
    } else {
      this.velocity.y += delta * this.gravity;
    }

    // 每帧下落高度 △h = v * △t
    this.mesh.position.addScaledVector(this.velocity, delta);

    // 移动
    // const tempVector = new THREE.Vector3();
    this.moveVec = this.params?.movement?.(delta, this.mesh) || new THREE.Vector3();

    // 受力
    if (this.force && this.force.length() > 0) {
      this.mesh.position.addScaledVector(this.force, delta);
    }

    this.mesh.updateMatrixWorld();

    // 环境碰撞部分
    this.handleCollision(delta);

    this.force.set(0, 0, 0);
  }

  handleCollision(delta) {
    const capsuleInfo = this.params.capsuleInfo;
    this.tempBox.makeEmpty();
    this.tempMat.copy(this.physicsWorld.collider.matrixWorld).invert();
    this.tempSegment.copy(capsuleInfo.segment);

    // get the position of the capsule in the local space of the collider
    this.tempSegment.start.applyMatrix4(this.mesh.matrixWorld).applyMatrix4(this.tempMat);
    this.tempSegment.end.applyMatrix4(this.mesh.matrixWorld).applyMatrix4(this.tempMat);

    // get the axis aligned bounding box of the capsule
    this.tempBox.expandByPoint(this.tempSegment.start);
    this.tempBox.expandByPoint(this.tempSegment.end);

    this.tempBox.min.addScalar(-capsuleInfo.radius);
    this.tempBox.max.addScalar(capsuleInfo.radius);

    this.physicsWorld.collider.geometry.boundsTree.shapecast({

      intersectsBounds: box => box.intersectsBox(this.tempBox),

      intersectsTriangle: tri => {
        // check if the triangle is intersecting the capsule and adjust the
        // capsule position if it is.
        const triPoint = this.tempVector;
        const capsulePoint = this.tempVector2;

        const distance = tri.closestPointToSegment(this.tempSegment, triPoint, capsulePoint);
        if (distance < capsuleInfo.radius) {
          const depth = capsuleInfo.radius - distance;
          const direction = capsulePoint.sub(triPoint).normalize();

          this.tempSegment.start.addScaledVector(direction, depth);
          this.tempSegment.end.addScaledVector(direction, depth);
        }
      },

    });

    const deltaVector = this.correctPosition(delta);

    if (!this.isOnGround) {
      deltaVector.normalize();
      this.velocity.addScaledVector(deltaVector, -deltaVector.dot(this.velocity));
    } else {
      this.velocity.set(0, 0, 0);
    }
  }

  correctPosition(delta) {
    // get the adjusted position of the capsule collider in world space after checking
    // triangle collisions and moving it. capsuleInfo.segment.start is assumed to be
    // the origin of the player model.
    const newPosition = this.tempVector;
    newPosition.copy(this.tempSegment.start).applyMatrix4(this.physicsWorld.collider.matrixWorld);

    // check how much the collider was moved
    const deltaVector = this.tempVector2;
    deltaVector.subVectors(newPosition, this.mesh.position);

    // if the player was primarily adjusted vertically
    // we assume it's on something we should consider ground
    this.isOnGround = deltaVector.y > Math.abs(delta * this.velocity.y * 0.25);

    const offset = Math.max(0.0, deltaVector.length() - 1e-5);
    deltaVector.normalize().multiplyScalar(offset);

    // adjust the player model
    this.mesh.position.add(deltaVector);

    return deltaVector;
  }

  addCollisionMesh() {
    this.physicsWorld.addBox(this);
  }

  render() {
    const delta = Math.min(this.clock.getDelta(), 0.1);

    if (this.physicsWorld.collider) {
      this.update(delta);
    }
  }
}
