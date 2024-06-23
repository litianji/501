import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { withTimeout } from '../utils';

export interface ResourceItem {
  key: string,
  type: 'glb' | 'texture',
  path?: string,
  data?: any
}

export default class Resources {
  loaders: Record<string, Function>;

  sources: ResourceItem[];

  data: ResourceItem[];

  constructor() {
    // super();
    this.loaders = {};
    this.setLoaders();
  }

  // 设置loader
  setLoaders(): void {
    const gltfLoader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();

    // glb
    this.loaders.glb = withTimeout((path: string) => new Promise((resolve) => {
      gltfLoader.load(path, resolve);
    }));

    // texture
    this.loaders.texture = withTimeout((path: string) => new Promise((resolve) => {
      textureLoader.load(path, resolve);
    }));
  }

  // 根据不同的资源类型执行对应loader
  async load(sources: ResourceItem[]): Promise<ResourceItem[]> {
    const loadingInfo = {
      total: sources.length,
      loaded: 0,
      percent: 0,
      currentResource: null,
    };

    const res = await Promise.all(sources.map(async (item) => {
      const data = item.path ? await this.loaders[item.type]?.(item.path) : null;
      loadingInfo.loaded++;
      loadingInfo.percent = loadingInfo.loaded / loadingInfo.total;
      loadingInfo.currentResource = data;
      return {
        ...item,
        data,
      };
    }));
    this.data = (this.data || []).concat(res);
    return this.data;
  }

  get(key: string): ResourceItem {
    return this.data?.find((item) => item.key === key) || { key, type: 'texture' };
  }
}
