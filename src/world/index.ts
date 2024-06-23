import BaseComponent, { resources } from '../base';
import Environment from './Environment';
import Lights from './Lights';

export default class World extends BaseComponent {
  environment: Environment;

  constructor() {
    super();

    console.log(this);
    this.init();
  }

  init() {
    this.loadResources().then(() => {
      this.setEnvironment();
      this.setLight();
    });
  }

  loadResources() {
    return resources.load([
      {
        key: 'ant',
        type: 'glb',
        path: 'ant.glb',
      },
    ]);
  }

  setEnvironment() {
    this.environment = new Environment();
  }

  setLight() {
    this.scene.add(...Lights);
  }
}
