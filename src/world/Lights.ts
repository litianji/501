import { AmbientLight, DirectionalLight, Vector2 } from 'three';
// import { getGui } from '../base';

// const gui = getGui();
const resolution = new Vector2(10, 10);

const ambLight = new AmbientLight(0xffffff, 1);
const dirLight = new DirectionalLight(0xffffff, 3);

dirLight.position.set(15, 30, 10);
dirLight.target.position.set(resolution.x / 2, 0, resolution.y / 2);
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.radius = 7;
dirLight.shadow.normalBias = 0.05;
dirLight.castShadow = true;

const lights = [dirLight, ambLight];

export default lights;
