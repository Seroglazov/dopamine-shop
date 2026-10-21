// Original procedural decor, built from real meshes. No imported product models.
// Three.js is deferred so the header, wordmark and links render immediately.
export async function mountHeroDecor(container, onReady) {
  const THREE = await import('three');
  const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
  if (!container.isConnected) return () => {};

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    return () => {};
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .86;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-6, 6, 2.5, -2.5, .1, 50);
  camera.position.set(0, 0, 18);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .06);
  scene.environment = environment.texture;
  scene.environmentIntensity = .6;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe8c7ee, 1.25));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(-5, 8, 10);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0xffe7d0, .85);
  rimLight.position.set(6, 1, -3);
  scene.add(rimLight);

  // A tiny deterministic woven relief keeps highlights soft and tactile.
  const reliefCanvas = document.createElement('canvas');
  reliefCanvas.width = reliefCanvas.height = 128;
  const reliefContext = reliefCanvas.getContext('2d');
  if (reliefContext) {
    const pixels = reliefContext.createImageData(128, 128);
    let seed = 27;
    for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
      seed = (seed * 16807) % 2147483647;
      const value = 123 + (seed % 10) + (x % 4 === 0 ? 11 : 0) + (y % 4 === 0 ? 9 : 0);
      const index = (y * 128 + x) * 4;
      pixels.data[index] = pixels.data[index + 1] = pixels.data[index + 2] = value;
      pixels.data[index + 3] = 255;
    }
    reliefContext.putImageData(pixels, 0, 0);
  }
  const relief = new THREE.CanvasTexture(reliefCanvas);
  relief.wrapS = relief.wrapT = THREE.RepeatWrapping;
  relief.repeat.set(5, 5);
  relief.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

  const materials = [];
  function softMaterial(color, extra = {}) {
    const material = new THREE.MeshPhysicalMaterial({
      color, roughness: .47, metalness: 0, clearcoat: .12,
      clearcoatRoughness: .42, sheen: .38, sheenRoughness: .68,
      sheenColor: new THREE.Color(color).lerp(new THREE.Color('white'), .35),
      bumpMap: relief, bumpScale: .009, ...extra,
    });
    materials.push(material);
    return material;
  }
  const orange = softMaterial('#ff5b06');
  const orangeSeam = softMaterial('#ef5712');
  const pink = softMaterial('#ff53aa');
  const pinkSeam = softMaterial('#e567a3');
  const yellow = softMaterial('#ffe02c');
  const lilac = softMaterial('#a572ef', { roughness: .36, clearcoat: .2, bumpScale: .005 });
  const lilacSeam = softMaterial('#a88bdc');
  const green = softMaterial('#b4ed55');
  const greenSeam = softMaterial('#a6d46d');
  const coral = softMaterial('#ff5e8d');

  function mesh(geometry, material, group) {
    const object = new THREE.Mesh(geometry, material);
    group.add(object);
    return object;
  }
  function smoothLathe(profile, material, group) {
    const curve = new THREE.CatmullRomCurve3(profile.map(([r, y]) => new THREE.Vector3(r, y, 0)));
    const points = curve.getPoints(100).map(p => new THREE.Vector2(Math.max(p.x, 0), p.y));
    return mesh(new THREE.LatheGeometry(points, 80), material, group);
  }
  function seam(points, material, group, radius = .009, closed = true) {
    const curve = new THREE.CatmullRomCurve3(points, closed, 'centripetal');
    return mesh(new THREE.TubeGeometry(curve, 120, radius, 5, closed), material, group);
  }
  function ringPoints(radius, y, segments = 80) {
    return Array.from({ length: segments }, (_, i) => {
      const angle = i / segments * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    });
  }

  const lamp = new THREE.Group();
  smoothLathe([[0,-1],[.24,-1],[.32,-.96],[.34,-.87],[.32,-.72],[.28,-.1],[.3,.23],[.24,.32],[0,.32]], orange, lamp);
  smoothLathe([[0,.22],[.7,.19],[.98,.23],[1.05,.32],[1.02,.44],[.88,.7],[.61,.96],[.28,1.1],[0,1.13]], orange, lamp);
  seam(ringPoints(1.035, .31), orangeSeam, lamp, .012);
  seam(ringPoints(.31, -.94), orangeSeam, lamp, .009);
  lamp.rotation.set(.18, -.4, -.21);
  scene.add(lamp);

  const flower = new THREE.Group();
  const cushionGeometry = new THREE.SphereGeometry(1, 96, 64);
  const position = cushionGeometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
    const angle = Math.atan2(y, x);
    const petalRadius = .89 + .19 * Math.cos(angle * 7);
    position.setXYZ(i, x * petalRadius, y * petalRadius, z * .31);
  }
  cushionGeometry.computeVertexNormals();
  mesh(cushionGeometry, pink, flower);
  const cushionSeam = Array.from({ length: 180 }, (_, i) => {
    const angle = i / 180 * Math.PI * 2;
    const radius = .89 + .19 * Math.cos(angle * 7);
    return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
  });
  seam(cushionSeam, pinkSeam, flower, .009);
  const center = mesh(new THREE.SphereGeometry(.41, 48, 32), yellow, flower);
  center.scale.set(1, 1, .5);
  center.position.z = .26;
  const backCenter = center.clone();
  backCenter.position.z = -.26;
  flower.add(backCenter);
  flower.rotation.set(-.12, .22, .25);
  scene.add(flower);

  const vase = new THREE.Group();
  smoothLathe([[0,-1.05],[.32,-1.05],[.5,-.98],[.61,-.83],[.63,-.63],[.57,-.43],[.38,-.3],[.36,-.15],[.52,.01],[.55,.19],[.48,.35],[.31,.48],[.28,.67],[.35,.92],[.34,1.01],[.29,1.04],[.24,1.01],[.23,.91],[.21,.67],[.26,.44],[.43,.19],[.41,.07],[.24,-.13],[.27,-.4],[.46,-.65],[.45,-.85],[.3,-.93],[0,-.93]], lilac, vase);
  seam(ringPoints(.322, 1.02), lilacSeam, vase, .008);
  vase.rotation.set(.12, .3, .2);
  scene.add(vase);

  const rings = new THREE.Group();
  const wavyPoints = Array.from({ length: 100 }, (_, i) => {
    const angle = i / 100 * Math.PI * 2;
    const radius = .72 + .055 * Math.cos(angle * 5);
    return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, Math.sin(angle * 3) * .025);
  });
  const ringCurve = new THREE.CatmullRomCurve3(wavyPoints, true);
  mesh(new THREE.TubeGeometry(ringCurve, 160, .23, 20, true), green, rings);
  seam(wavyPoints.map(p => new THREE.Vector3(p.x * 1.285, p.y * 1.285, p.z)), greenSeam, rings, .008);
  const smallRing = mesh(new THREE.TorusGeometry(.5, .16, 20, 80), coral, rings);
  smallRing.rotation.set(.4, 1.05, .3);
  smallRing.position.set(.49, -.4, .22);
  rings.rotation.set(.25, -.4, -.35);
  scene.add(rings);

  const decor = [lamp, flower, vase, rings];
  const initialRotations = decor.map(item => item.rotation.clone());
  const pointer = { x: 0, y: 0, easedX: 0, easedY: 0 };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, disposed = false, visible = true, paused = document.hidden;
  let manuallyPaused = container.dataset.motionPaused === 'true';
  let elapsed = 0, previousTime = 0, firstRender = true;
  const widePositions = [[-4.15,1.05,.93],[-1.75,-1.15,.98],[1.45,1.2,.9],[4.15,-1,1.03]];
  const narrowPositions = [[-1.85,1.16,.66],[-1.25,-1.23,.7],[1.35,1.35,.69],[1.9,-1.18,.73]];
  let restPositions = widePositions;

  function resize() {
    if (disposed) return;
    const bounds = container.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const aspect = bounds.width / bounds.height;
    const narrow = bounds.width < 640;
    const viewWidth = narrow ? 5.8 : 12;
    camera.left = -viewWidth / 2;
    camera.right = viewWidth / 2;
    camera.top = viewWidth / aspect / 2;
    camera.bottom = -camera.top;
    camera.updateProjectionMatrix();
    renderer.setSize(bounds.width, bounds.height, false);
    restPositions = narrow ? narrowPositions : widePositions;
    decor.forEach((item, index) => {
      const [x, y, size] = restPositions[index];
      item.position.set(x, y, 0);
      item.scale.setScalar(size);
    });
    cancelAnimationFrame(frame);
    draw();
  }
  function draw(time = performance.now()) {
    if (disposed) return;
    frame = 0;
    const canAnimate = visible && !paused && !manuallyPaused && !reducedMotion.matches;
    if (canAnimate) {
      if (previousTime) elapsed += Math.max(0, Math.min((time - previousTime) / 1000, .05));
      previousTime = time;
      pointer.easedX += (pointer.x - pointer.easedX) * .035;
      pointer.easedY += (pointer.y - pointer.easedY) * .035;
    } else previousTime = 0;
    decor.forEach((item, index) => {
      const phase = index * 1.7;
      const [x, y] = restPositions[index];
      const rotation = initialRotations[index];
      item.position.x = x + pointer.easedX * (index % 2 ? .16 : -.12);
      item.position.y = y + Math.sin(elapsed * .58 + phase) * .12 + pointer.easedY * .13;
      item.rotation.x = rotation.x + Math.sin(elapsed * .23 + phase) * .13;
      item.rotation.y = rotation.y + elapsed * (index % 2 ? -.14 : .12) + pointer.easedX * .12;
      item.rotation.z = rotation.z + Math.sin(elapsed * .3 + phase) * .09;
    });
    renderer.render(scene, camera);
    if (firstRender) { firstRender = false; onReady(); }
    if (canAnimate) frame = requestAnimationFrame(draw);
  }
  function resume() {
    if (disposed) return;
    cancelAnimationFrame(frame);
    previousTime = 0;
    draw();
  }
  function move(event) {
    const bounds = container.getBoundingClientRect();
    pointer.x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    pointer.y = Math.max(-1, Math.min(1, 1 - (event.clientY - bounds.top) / bounds.height * 2));
  }
  function resetPointer() { pointer.x = pointer.y = 0; }
  function visibilityChange() { paused = document.hidden; resume(); }
  function motionChange(event) { manuallyPaused = Boolean(event.detail?.paused); resume(); }
  function contextLost(event) {
    event.preventDefault();
    paused = true;
    cancelAnimationFrame(frame);
    container.classList.remove('hero-decor-ready');
  }
  function contextRestored() {
    paused = document.hidden;
    container.classList.add('hero-decor-ready');
    resume();
  }
  const eventSurface = container.parentElement || container;
  eventSurface.addEventListener('pointermove', move, { passive: true });
  eventSurface.addEventListener('pointerleave', resetPointer);
  document.addEventListener('visibilitychange', visibilityChange);
  container.addEventListener('hero-decor-pause', motionChange);
  reducedMotion.addEventListener('change', resume);
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  renderer.domElement.addEventListener('webglcontextrestored', contextRestored);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    resume();
  }, { rootMargin: '100px' });
  visibilityObserver.observe(container);
  resize();

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    eventSurface.removeEventListener('pointermove', move);
    eventSurface.removeEventListener('pointerleave', resetPointer);
    document.removeEventListener('visibilitychange', visibilityChange);
    container.removeEventListener('hero-decor-pause', motionChange);
    reducedMotion.removeEventListener('change', resume);
    renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    renderer.domElement.removeEventListener('webglcontextrestored', contextRestored);
    const geometries = new Set();
    scene.traverse(object => { if (object.isMesh) geometries.add(object.geometry); });
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    relief.dispose();
    environment.dispose();
    scene.clear();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
