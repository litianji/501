import Agent from './Agent';
import * as THREE from 'three';
import Faction from './Faction';
import Action from './Action';

export default class Character extends Agent {
  targetPosition: THREE.Vector3;

  action: Action;

  constructor(params) {
    super(params);

    Faction.add(this);
  }

  walk(position: THREE.Vector3) {
    console.log('walk');
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
        this.goToWork();
        break;
      case random < 0.3:

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

  render() {
    if (!this.action || this.action.isFinish) {
      this.doSomeThing();
    }
  }
}
