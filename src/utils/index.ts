import * as THREE from 'three';

export const getQueryString = (key) => {
  const res = window.location.search.match(new RegExp(`[\?\&]${key}=([^\&]+)`));
  return res && res[1];
};

export const withTimeout = (fn: Function, timeout: number = 2500) => (...arg) => Promise.race([
  fn(...arg),
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, timeout);
  }),
]);

export const cloneGltf = (gltf) => {
  const clone = {
    animations: gltf.animations,
    scene: gltf.scene.clone(true),
  };

  const skinnedMeshes = {};

  gltf.scene.traverse(node => {
    if (node.isSkinnedMesh) {
      skinnedMeshes[node.name] = node;
    }
  });

  const cloneBones = {};
  const cloneSkinnedMeshes = {};

  clone.scene.traverse(node => {
    if (node.isBone) {
      cloneBones[node.name] = node;
    }

    if (node.isSkinnedMesh) {
      cloneSkinnedMeshes[node.name] = node;
    }
  });

  // eslint-disable-next-line no-restricted-syntax
  for (let name in skinnedMeshes) {
    const skinnedMesh = skinnedMeshes[name];
    const skeleton = skinnedMesh.skeleton;
    const cloneSkinnedMesh = cloneSkinnedMeshes[name];

    const orderedCloneBones = [];

    for (let i = 0; i < skeleton.bones.length; ++i) {
      const cloneBone = cloneBones[skeleton.bones[i].name];
      orderedCloneBones.push(cloneBone);
    }

    cloneSkinnedMesh.bind(
      new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses),
      cloneSkinnedMesh.matrixWorld,
    );
  }

  return clone;
};
export * from './logTime';
