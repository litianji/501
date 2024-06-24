import Agent from './Agent';
import * as THREE from 'three';
import Faction from './Faction';
import Action from './Action';
import { resources } from '../base';
import { cloneGltf } from '../utils';

export default class Character extends Agent {
  targetPosition: THREE.Vector3;

  action: Action;

  mixer: THREE.AnimationMixer;

  animations: THREE.AnimationClip[];

  animationName: string;

  constructor(params) {
    const characterGlb = resources.get('Casual2_Male');
    const character = new THREE.Object3D();
    const cloned = cloneGltf(characterGlb.data);
    cloned.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        child.computeBoundingBox();
      }
    });
    character.add(cloned.scene);
    character.scale.set(0.15, 0.15, 0.15);
    character.position.copy(params.position);
    character.updateMatrixWorld(true);

    super({
      ...params,
      mesh: character,
    });

    this.animations = cloned.animations;
    const animatAction = new Action('animate');
    animatAction.isActive = true;
    animatAction.onUpdate = (delta) => {
      if (this.mixer) {
        this.mixer.update(delta * 2);
      }
    };
    Faction.add(this);
  }

  walk(position: THREE.Vector3, speed: number = 1.2) {
    console.log('walk');

    this.speed = speed;

    this.playAnimate('Walk');

    this.targetPosition = position.clone();
    this.action = new Action('walk');
    this.action.isActive = true;
    this.action.onUpdate = () => {
      if (this.targetPosition) {
        const currentPosition = this.mesh.position.clone().setY(0);
        const targetPosition = this.targetPosition.clone().setY(0);
        this.walkDir = new THREE.Vector3().subVectors(targetPosition, currentPosition);

        if (this.walkDir.length() < 0.01) {
          this.targetPosition = null;
          this.walkDir = null;
          return true;
        }
      }
      return false;
    };
  }

  sleep(time: number) {
    console.log('sleep', time);
    let totalTime = 0;

    this.playAnimate('Idle');

    this.action = new Action('sleep');
    this.action.isActive = true;

    this.action.onUpdate = (delta) => {
      totalTime += delta;
      return totalTime > (time / 1000);
    };
  }

  goToWork() {
    console.log('work');
    const minTime = 1;
    let totalTime = 0;
    this.playAnimate('Idle');
    this.action = new Action('work');
    this.action.isActive = true;
    this.action.onUpdate = (delta) => {
      totalTime += delta;
      return totalTime > minTime;
    };
  }

  goOffWork() {
    console.log('offWork');
    const minTime = 1;
    let totalTime = 0;
    this.playAnimate('Idle');
    this.action = new Action('offWork');
    this.action.isActive = true;
    this.action.onUpdate = (delta) => {
      totalTime += delta;
      return totalTime > minTime;
    };
  }

  doSomeThing() {
    const random = Math.random();

    switch (true) {
      case random < 0.1:

        const currentPosition = this.mesh.position.clone().setY(0);
        const randomDir = new THREE.Vector3(
          1 - Math.random() * 2,
          0,
          1 - Math.random() * 2,
        ).normalize();
        const targetPosition = currentPosition.addScaledVector(randomDir, 1);

        if (this.environment.checkValidPoint(targetPosition)) {
          this.walk(targetPosition);
        }
        break;
      case random < 0.3:
        this.goToWork();
        break;

      case random < 0.5:
        this.goOffWork();
        break;
      case random < 0.8:
        this.goOffWork();
        break;
      default:
        this.sleep(Math.random() * 1000);
        break;
    }
  }

  playAnimate(name) {
    if (this.animationName === name) {
      return;
    }
    this.animationName = name || 'Idle';
    this.mixer = new THREE.AnimationMixer(this.mesh);
    const animation = this.animations.find(item => item.name === this.animationName);
    const animationAction = this.mixer.clipAction(animation);
    animationAction.play();
  }

  render() {
    if (!this.action || this.action.isFinish) {
      this.doSomeThing();
    }
  }
}
