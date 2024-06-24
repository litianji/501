import BaseComponent from '../base';
import * as THREE from 'three';

export default class Action extends BaseComponent {
  isFinish: boolean = false;

  isActive: boolean = false;

  name: string;

  update: Function;

  finish: Function;

  clock: THREE.Clock = new THREE.Clock();

  animateName: string;

  constructor(name: string) {
    super();
    this.name = name;
    // this.animateName = animateName;
  }

  set onUpdate(value) {
    this.update = value;
  }

  set onFinish(value) {
    this.finish = value;
  }

  render() {
    const delta = this.clock.getDelta();
    if (this.update && this.isActive && !this.isFinish) {
      this.isFinish = this.update(delta);
    }

    if (this.isFinish) {
      this.finish?.();
    }
  }
}
