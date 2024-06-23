import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import Stats from 'stats.js';
import Resources from './Resources';
import { getQueryString } from '../utils';

let camera: THREE.PerspectiveCamera;
let cameraOrt: THREE.OrthographicCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let orbitControls: OrbitControls;
let resources: Resources;
let coordinates: THREE.Vector2;
let needsUpdate: boolean;
let debug: dat.GUI;
let hasEvent: boolean;
let hasHelper: boolean;
let isDebug: boolean;
let mouseInObject: THREE.Object3D;
let intersect: THREE.Intersection;
let stats: Stats;

const viewSize: number[] = [window.innerWidth, window.innerHeight];
const loopCallbacks: Function[] = [];
const resizeCallbacks: Function[] = [];
const raycaster: THREE.Raycaster = new THREE.Raycaster();
const mouseClickEventCallbacksMap: Map<any, Function[]> = new Map();
const mouseMoveEventCallbacksMap: Map<any, Function[]> = new Map();
const clock = new THREE.Clock();
window.THREE = THREE;

const setCamera = () => {
  if (camera) {
    return camera;
  }
  camera = new THREE.PerspectiveCamera(30, viewSize[0] / viewSize[1], 1, 1000);
  camera.position.x = 20;
  camera.position.y = 14;
  camera.position.z = 9;
  camera.lookAt(0, 0, 0);

  cameraOrt = new THREE.OrthographicCamera(
    viewSize[0] / -2,
    viewSize[0] / 2,
    viewSize[1] / 2,
    viewSize[1] / -2,
    0.1,
    1000,
  );

  return camera;
};

const setRenderer = (canvas) => {
  if (renderer) {
    return renderer;
  }
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    canvas: canvas,
  });
  // renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.VSMShadowMap;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(viewSize[0], viewSize[1]);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.CineonToneMapping;
  renderer.toneMappingExposure = 1.75;
  !canvas && document.body.appendChild(renderer.domElement);

  return renderer;
};

const setScene = () => {
  if (scene) {
    return scene;
  }
  scene = new THREE.Scene();
  return scene;
};

const setResources = () => {
  if (resources) {
    return resources;
  }
  resources = new Resources();
  return resources;
};

const setControls = () => {
  if (orbitControls) {
    return orbitControls;
  }
  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;

  if (debug) {
    debug.add(orbitControls, 'enabled').name('orbitControls');
  }
  return orbitControls;
};

const setEvent = (resizeCb, renderCb) => {
  renderCb && loopCallbacks.push(renderCb);
  resizeCb && resizeCallbacks.push(resizeCb);

  if (hasEvent) {
    return;
  }

  window.addEventListener('resize', (e) => {
    viewSize[0] = window.innerWidth;
    viewSize[1] = window.innerHeight;
    resizeCallbacks.forEach((fn) => fn && fn?.(viewSize, e));

    renderer.setSize(viewSize[0], viewSize[1]);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = viewSize[0] / viewSize[1];
    camera.updateProjectionMatrix();
  });

  renderer.domElement.addEventListener('mousemove', (e) => {
    coordinates = new THREE.Vector2(
      (e.clientX / viewSize[0]) * 2 - 1,
      -(e.clientY / viewSize[1]) * 2 + 1,
    );
    needsUpdate = true;
  });

  renderer.domElement.addEventListener('click', (e) => {
    if (mouseInObject) {
      mouseClickEventCallbacksMap.get(mouseInObject)?.forEach((fn) => fn?.(e, intersect));
      mouseClickEventCallbacksMap.get(mouseInObject?.parent)?.forEach((fn) => fn?.(e, intersect));
    }
  });

  loop();
  hasEvent = true;
};

// loop
const loop = () => {
  if (stats) {
    stats.update();
  }
  window.requestAnimationFrame(loop);
  orbitControls?.update();
  loopCallbacks.forEach((fn) => fn && fn?.());

  if (needsUpdate) {
    needsUpdate = false;

    raycaster.setFromCamera(coordinates, camera);
    raycaster.firstHitOnly = true;
    const allIntersections = [
      ...mouseClickEventCallbacksMap.keys(),
      ...mouseMoveEventCallbacksMap.keys(),
    ].map((item) => (item.children?.length ? item.children : item))
      .flat()
      .filter(item => item.visible);
    const intersects = raycaster.intersectObjects(allIntersections);

    if (intersects.length && allIntersections.find(
      (item) => intersects[0].object || item.children?.find(() => intersects[0].object),
    )) {
      intersect = intersects[0];
      mouseInObject = intersects[0].object;
      renderer.domElement.style.cursor = 'pointer';
    } else {
      mouseInObject = null;
      renderer.domElement.style.cursor = 'auto';
    }

    [...mouseMoveEventCallbacksMap.keys()].forEach((key) => {
      mouseMoveEventCallbacksMap.get(key)?.forEach(
        (fn) => fn?.(key === mouseInObject || key === mouseInObject?.parent),
      );
    });
  }

  renderer.render(scene, camera);
};

const setHelpers = () => {
  if (hasHelper || !debug) {
    return;
  }

  const axesHelper = new THREE.AxesHelper(5);
  const gridHelper = new THREE.GridHelper(12, 50);
  gridHelper.visible = false;

  scene.add(axesHelper);
  scene.add(gridHelper);
  hasHelper = true;

  const helperFloder = debug.addFolder('helpers');
  helperFloder.add(axesHelper, 'visible').name('showAxesHelper');
  helperFloder.add(gridHelper, 'visible').name('showGridHelper');
};

const setDebug = () => {
  if (debug) {
    return debug;
  }

  if (isDebug === undefined) {
    // @ts-ignore
    // eslint-disable-next-line no-underscore-dangle
    isDebug = getQueryString('debug') === '1' || window.__env === 'development';
  }

  if (isDebug) {
    debug = new dat.GUI();
    // 性能检测
    stats = new Stats();
    document.body.appendChild(stats.dom);
  }

  return debug;
};
setResources();
setDebug();

export {
  resources,
};
export const getGui = (): dat.GUI => debug;
export const getOrbitControls = (): OrbitControls => orbitControls;
export * from './Resources';

/**
 * 包含
 * 1. 事件处理（全局事件，组件事件）
 * 2. 资源加载
 * 3. 相机，renderer
 * 4. 生命周期
 */
export default class BaseComponent {
  camera: THREE.PerspectiveCamera;

  cameraOrt: THREE.OrthographicCamera;

  scene: THREE.Scene;

  renderer: THREE.WebGLRenderer;

  viewSize: number[];

  constructor(canvas?: HTMLCanvasElement) {
    this.createApplication(canvas);
  }

  // 所有继承BaseComponent的类都共用了这些对象方便使用
  private createApplication(canvas) {
    setCamera();
    setRenderer(canvas);
    setScene();
    setControls();
    setHelpers();

    this.camera = camera;
    this.cameraOrt = cameraOrt;
    this.renderer = renderer;
    this.scene = scene;

    setEvent(this.viewportResize.bind(this), this.render.bind(this));
  }

  // Frame 动画
  render() {}

  // render 区域大小变化
  viewportResize(_size: number[]) {}

  addClick(mesh: THREE.Object3D, callback: Function): Function {
    if (mouseClickEventCallbacksMap.get(mesh)) {
      mouseClickEventCallbacksMap.get(mesh).push(callback);
    } else {
      mouseClickEventCallbacksMap.set(mesh, [callback]);
    }

    return () => {
      mouseClickEventCallbacksMap.delete(mesh);
    };
  }

  removeClick(mesh) {
    mouseClickEventCallbacksMap.delete(mesh);
  }

  addMouseMove(mesh: THREE.Object3D, callback: Function): Function {
    if (mouseMoveEventCallbacksMap.get(mesh)) {
      mouseMoveEventCallbacksMap.get(mesh).push(callback);
    } else {
      mouseMoveEventCallbacksMap.set(mesh, [callback]);
    }

    return () => {
      mouseMoveEventCallbacksMap.delete(mesh);
    };
  }
}
