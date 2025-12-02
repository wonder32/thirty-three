"use strict";
(globalThis["webpackChunkthirty_three"] = globalThis["webpackChunkthirty_three"] || []).push([["src_thirty-three_viewer-runtime_js"],{

/***/ "./src/thirty-three/viewer-runtime.js":
/*!********************************************!*\
  !*** ./src/thirty-three/viewer-runtime.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loadThreeDeps: () => (/* binding */ loadThreeDeps),
/* harmony export */   mountViewer: () => (/* binding */ mountViewer)
/* harmony export */ });
// Shared viewer runtime that lazy-loads Three.js and mounts a viewer on demand.

let threeDepsPromise;
const loadThreeDeps = () => {
  if (threeDepsPromise) {
    return threeDepsPromise;
  }
  threeDepsPromise = (async () => {
    const threeNamespace = window.THREE || (await __webpack_require__.e(/*! import() */ "vendors-node_modules_three_build_three_module_js").then(__webpack_require__.bind(__webpack_require__, /*! three */ "./node_modules/three/build/three.module.js")));
    const THREE = threeNamespace.default || threeNamespace;
    const loaderModule = await Promise.all(/*! import() */[__webpack_require__.e("vendors-node_modules_three_build_three_module_js"), __webpack_require__.e("vendors-node_modules_three_examples_jsm_loaders_3MFLoader_js")]).then(__webpack_require__.bind(__webpack_require__, /*! three/examples/jsm/loaders/3MFLoader.js */ "./node_modules/three/examples/jsm/loaders/3MFLoader.js"));
    const ThreeMFLoader = loaderModule.ThreeMFLoader || loaderModule.default || loaderModule;
    if (!window.THREE) {
      window.THREE = THREE;
    }
    return {
      THREE,
      ThreeMFLoader
    };
  })();
  return threeDepsPromise;
};
const degToRad = (value = 0, THREE) => THREE.MathUtils.degToRad(Number.isFinite(value) ? value : Number(value) || 0);
const parseColor = value => {
  const hex = (value || '0x004100').toString().replace(/^#/, '').replace(/^0x/, '');
  const parsed = parseInt(hex, 16);
  return Number.isFinite(parsed) ? parsed : 0x004100;
};
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const initViewerWithLibs = (root, libs, options = {}) => {
  const {
    THREE,
    ThreeMFLoader
  } = libs;
  const {
    interactive = true,
    logTransforms = true
  } = options;
  const data = root.dataset || {};
  const viewport = root.querySelector('.thirty-three-viewport');
  const placeholder = root.querySelector('.thirty-three-placeholder');
  const status = root.querySelector('.thirty-three-status');
  const modelUrl = data.fileUrl || '';
  const setStatus = text => {
    if (status) {
      status.textContent = text;
    }
  };
  if (!viewport) {
    return () => {};
  }
  const placeholderImage = data.imageUrl || '';
  let targetScale = clamp(Number(data.scale) || 1, 0.1, 2);
  let targetRotation = {
    x: degToRad(Number(data.rotationX) || 0, THREE),
    y: degToRad(Number(data.rotationY) || 0, THREE),
    z: degToRad(Number(data.rotationZ) || 0, THREE)
  };
  let targetColor = parseColor(data.color);
  if (placeholderImage && placeholder?.querySelector('img')) {
    placeholder.querySelector('img').src = placeholderImage;
  }
  if (!modelUrl) {
    setStatus('No 3MF file selected.');
    return () => {};
  }
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(viewport.clientWidth, viewport.clientHeight || 320);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  viewport.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1220);
  const camera = new THREE.PerspectiveCamera(50, viewport.clientWidth / Math.max(viewport.clientHeight, 1), 0.1, 5000);
  camera.position.set(0, 0, 30);
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
  keyLight.position.set(28, 22, 24);
  keyLight.castShadow = true;
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.6);
  rimLight.position.set(-16, -10, -22);
  scene.add(rimLight);
  let model;
  let pointerDown = false;
  let lastPointer = {
    x: 0,
    y: 0
  };
  let cameraDistance = 30;
  let minCameraDistance = 4;
  let maxCameraDistance = 200;
  const manager = new THREE.LoadingManager();
  const loader = new ThreeMFLoader(manager);
  manager.onStart = () => {
    placeholder?.classList.remove('is-hidden');
    setStatus('Loading 3D model…');
  };
  manager.onError = url => {
    setStatus('Could not load 3D model. Check console for details.');
    // eslint-disable-next-line no-console
    console.error('[thirty-three] LoadingManager error', url);
  };
  const centerModel = object => {
    const aabb = new THREE.Box3().setFromObject(object);
    const center = aabb.getCenter(new THREE.Vector3());
    object.position.sub(center);
    const size = aabb.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const fitDistance = maxDimension / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)));
    cameraDistance = Math.max(fitDistance * 1.4, 6);
    minCameraDistance = Math.max(cameraDistance * 0.25, 2);
    maxCameraDistance = Math.max(cameraDistance * 8, 50);
    camera.position.set(0, 0, cameraDistance);
    camera.lookAt(0, 0, 0);
  };
  const applyLook = object => {
    object.rotation.set(targetRotation.x, targetRotation.y, targetRotation.z);
    object.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = child.material.clone();
        child.material.color = new THREE.Color(targetColor);
      }
    });
  };
  const render = () => {
    renderer.render(scene, camera);
  };
  const logObjectTransform = () => {
    if (!logTransforms) {
      return;
    }
    if (!model) {
      return;
    }
    const rotationX = THREE.MathUtils.radToDeg(model.rotation.x);
    const rotationY = THREE.MathUtils.radToDeg(model.rotation.y);
    const rotationZ = THREE.MathUtils.radToDeg(model.rotation.z);
    const {
      x,
      y,
      z
    } = model.position;

    /* eslint-disable no-console */
    console.clear();
    console.log(`Position X: ${x.toFixed(2)}`);
    console.log(`Position Y: ${y.toFixed(2)}`);
    console.log(`Position Z: ${z.toFixed(2)}`);
    console.log(`Rotation X: ${rotationX.toFixed(2)} degrees`);
    console.log(`Rotation Y: ${rotationY.toFixed(2)} degrees`);
    console.log(`Rotation Z: ${rotationZ.toFixed(2)} degrees`);
    console.log(`Scale: ${model.scale.x.toFixed(2)}`);
    console.log(`Camera Distance: ${cameraDistance.toFixed(2)}`);
    /* eslint-enable no-console */
  };
  const loadModel = () => {
    if (!modelUrl) {
      setStatus('No 3MF file selected.');
      return;
    }
    loader.load(modelUrl, group => {
      setStatus('3D model ready');
      placeholder?.classList.add('is-hidden');
      if (model) {
        scene.remove(model);
      }
      model = group;
      applyLook(model);
      model.scale.setScalar(targetScale);
      centerModel(model);
      scene.add(model);
      render();
      logObjectTransform();
    }, undefined, error => {
      setStatus('Could not load 3D model. Check console for details.');
      placeholder?.classList.remove('is-hidden');
      /* eslint-disable no-console */
      console.error('[thirty-three] 3MFLoader error', error);
      /* eslint-enable no-console */
    });
  };
  const onPointerDown = event => {
    pointerDown = true;
    lastPointer = {
      x: event.clientX,
      y: event.clientY
    };
  };
  const onPointerUp = () => {
    pointerDown = false;
  };
  const onPointerMove = event => {
    if (!pointerDown || !model) {
      return;
    }
    const deltaX = event.clientX - lastPointer.x;
    const deltaY = event.clientY - lastPointer.y;
    model.rotation.y += deltaX * 0.01;
    model.rotation.x += deltaY * 0.01;
    lastPointer = {
      x: event.clientX,
      y: event.clientY
    };
    render();
    logObjectTransform();
  };
  const onWheel = event => {
    if (!model) {
      return;
    }
    event.preventDefault();
    const direction = event.deltaY > 0 ? 1 : -1;
    cameraDistance *= direction > 0 ? 1.08 : 0.92;
    cameraDistance = clamp(cameraDistance, minCameraDistance, maxCameraDistance);
    camera.position.set(0, 0, cameraDistance);
    render();
    logObjectTransform();
  };
  const onResize = () => {
    const width = viewport.clientWidth || 1;
    const height = viewport.clientHeight || 1;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  };
  if (interactive) {
    viewport.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);
    viewport.addEventListener('wheel', onWheel, {
      passive: false
    });
  }
  window.addEventListener('resize', onResize);
  renderer.setAnimationLoop(render);
  loadModel();
  onResize();
  const update = (next = {}) => {
    if (Object.prototype.hasOwnProperty.call(next, 'scale')) {
      targetScale = clamp(Number(next.scale) || 1, 0.1, 2);
    }
    if (Object.prototype.hasOwnProperty.call(next, 'rotationX')) {
      targetRotation.x = degToRad(Number(next.rotationX) || 0, THREE);
    }
    if (Object.prototype.hasOwnProperty.call(next, 'rotationY')) {
      targetRotation.y = degToRad(Number(next.rotationY) || 0, THREE);
    }
    if (Object.prototype.hasOwnProperty.call(next, 'rotationZ')) {
      targetRotation.z = degToRad(Number(next.rotationZ) || 0, THREE);
    }
    if (Object.prototype.hasOwnProperty.call(next, 'color')) {
      targetColor = parseColor(next.color);
    }
    if (model) {
      applyLook(model);
      model.scale.setScalar(targetScale);
      render();
      logObjectTransform();
    }
  };
  const destroy = () => {
    if (interactive) {
      viewport.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      viewport.removeEventListener('wheel', onWheel);
    }
    window.removeEventListener('resize', onResize);
    renderer.setAnimationLoop(null);
    renderer.dispose();
    if (renderer.domElement?.parentNode === viewport) {
      viewport.removeChild(renderer.domElement);
    }
  };
  return {
    destroy,
    update
  };
};
const mountViewer = async (root, options = {}) => {
  if (!root) {
    return {
      destroy: () => {},
      update: () => {}
    };
  }
  const libs = await loadThreeDeps();
  return initViewerWithLibs(root, libs, options);
};


/***/ })

}]);
//# sourceMappingURL=src_thirty-three_viewer-runtime_js.js.map?ver=be9b15849f60f1547d10