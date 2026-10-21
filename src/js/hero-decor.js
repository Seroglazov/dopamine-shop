// Original mesh decor: no photograph planes or downloaded third-party models.
export async function mountHeroDecor(container, onReady) {
  const THREE = await import('three');
  const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
  if (!container.isConnected) return () => {};
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
  catch { return () => {}; }
  renderer.setClearColor(0x000000, 0);
  const compactDevice = window.matchMedia('(max-width: 700px), (pointer: coarse)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compactDevice ? 1.25 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .88;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3.5, 3.5, 3.5, -3.5, .1, 50);
  camera.position.set(0, 0, 18);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  scene.environmentIntensity = .6;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfff9f1, 0xf9abce, 1));
  const key = new THREE.DirectionalLight(0xfff7e6, 2);
  key.position.set(-4, 6, 10); scene.add(key);
  const fill = new THREE.DirectionalLight(0xe4f4ff, .9);
  fill.position.set(6, 0, 6); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffd4ae, 1.2);
  rim.position.set(2, 4, -6); scene.add(rim);

  // Deterministic woven relief gives fabric highlights without coarse noise.
  const reliefCanvas = document.createElement('canvas');
  reliefCanvas.width = reliefCanvas.height = 256;
  const ctx = reliefCanvas.getContext('2d');
  if (ctx) {
    const pixels = ctx.createImageData(256, 256);
    let seed = 27;
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      seed = (seed * 16807) % 2147483647;
      const value = 130 + (seed % 9) + Math.sin(x * Math.PI / 2) * 13 + Math.cos(y * Math.PI / 2) * 10;
      const i = (y * 256 + x) * 4;
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value;
      pixels.data[i + 3] = 255;
    }
    ctx.putImageData(pixels, 0, 0);
  }
  const weave = new THREE.CanvasTexture(reliefCanvas);
  weave.wrapS = weave.wrapT = THREE.RepeatWrapping;
  weave.repeat.set(3, 3);
  weave.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const materials = [];
  function material(color, extra = {}) {
    const m = new THREE.MeshPhysicalMaterial({ color, roughness: .28, metalness: 0,
      clearcoat: .5, clearcoatRoughness: .2, ...extra });
    materials.push(m); return m;
  }
  const orange = material('#ff4e00', { roughness: .36, clearcoat: .35, clearcoatRoughness: .35 });
  const orangeEdge = material('#ff9b30', { roughness: .3 });
  const underside = material('#ffe9b0', { roughness: .48, emissive: '#ffb555', emissiveIntensity: .28 });
  const brass = material('#e8b951', { metalness: .8, roughness: .23 });
  const lilac = material('#a557ef', { roughness: .32, clearcoat: .55 });
  const deepLilac = material('#8b56d3', { roughness: .35 });
  // Broad studio reflections make the inset readable at every gentle rotation.
  // This texture belongs to the actual thick mirror mesh, not a backdrop sprite.
  const reflectionCanvas = document.createElement('canvas');
  reflectionCanvas.width = 256; reflectionCanvas.height = 384;
  const reflectionContext = reflectionCanvas.getContext('2d');
  if (reflectionContext) {
    const reflection = reflectionContext.createLinearGradient(0,0,256,384);
    reflection.addColorStop(0,'#a2b3c8');
    reflection.addColorStop(.21,'#dde8f1');
    reflection.addColorStop(.31,'#f8fbff');
    reflection.addColorStop(.37,'#b7c8d9');
    reflection.addColorStop(.57,'#8b9db9');
    reflection.addColorStop(.7,'#b4c5dc');
    reflection.addColorStop(.77,'#f2f8ff');
    reflection.addColorStop(1,'#b9c8d7');
    reflectionContext.fillStyle=reflection;
    reflectionContext.fillRect(0,0,256,384);
    const softbox=reflectionContext.createLinearGradient(0,0,130,0);
    softbox.addColorStop(0,'rgba(255,255,255,.8)');
    softbox.addColorStop(.5,'rgba(255,255,255,.22)');
    softbox.addColorStop(1,'rgba(255,255,255,0)');
    reflectionContext.fillStyle=softbox;
    reflectionContext.fillRect(0,0,160,384);
  }
  const reflectionTexture = new THREE.CanvasTexture(reflectionCanvas);
  reflectionTexture.colorSpace=THREE.SRGBColorSpace;
  const silver = material('#ffffff', { map:reflectionTexture, metalness: .55, roughness: .14,
    clearcoat: 1, emissive:'#879aad', emissiveMap:reflectionTexture, emissiveIntensity:.13 });
  const fabric = material('#ff3f92', { roughness: .92, clearcoat: 0, sheen: .35,
    sheenRoughness: 1, sheenColor: new THREE.Color('#ff98c5'), bumpMap: weave, bumpScale: .015 });
  const piping = material('#e65f9a', { roughness: .8, clearcoat: 0 });
  const thread = material('#ffb9d7', { roughness: .95, clearcoat: 0 });
  const yellow = material('#ffd21e', { roughness: .9, clearcoat: 0, sheen: .3,
    sheenColor: new THREE.Color('#fff6c0'), bumpMap: weave, bumpScale: .012 });
  const yellowThread = material('#e7b629', { roughness: .9, clearcoat: 0 });
  const cream = material('#fff1d8', { roughness: .32, clearcoat: .9 });
  function mesh(geometry, mat, parent) {
    const object = new THREE.Mesh(geometry, mat); parent.add(object); return object;
  }
  function lathe(profile, mat, parent, segments = 96) {
    const curve = new THREE.CatmullRomCurve3(profile.map(([r, y]) => new THREE.Vector3(r, y, 0)));
    return mesh(new THREE.LatheGeometry(curve.getPoints(100).map(p => new THREE.Vector2(Math.max(p.x, 0), p.y)), segments), mat, parent);
  }
  function tube(points, mat, parent, radius = .012, closed = true, steps = 120) {
    return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, closed, 'centripetal'), steps, radius, 6, closed), mat, parent);
  }
  const ring = (radius, y, n = 96) => Array.from({ length: n }, (_, i) => {
    const a = i / n * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius);
  });

  // Hollow rolled-rim mushroom shade, diffuser, pedestal, metal collar and switch.
  const lamp = new THREE.Group();
  lathe([[0,-1.08],[.36,-1.08],[.43,-1.04],[.44,-.98],[.4,-.91],[.3,-.83],[.27,-.15],[.25,.38],[0,.4]], orange, lamp);
  tube(ring(.415, -1.025), orangeEdge, lamp, .014);
  lathe([[.25,.22],[.78,.2],[1.04,.24],[1.12,.3],[1.13,.38],[1.05,.63],[.84,.94],[.5,1.16],[.14,1.24],[0,1.24]], orange, lamp);
  lathe([[.24,.245],[.6,.25],[.94,.28],[1.08,.32],[1.095,.34]], underside, lamp);
  tube(ring(1.11, .34), orangeEdge, lamp, .026);
  for (const radius of [.38, .55, .73, .9]) tube(ring(radius, .257 + radius * .035), underside, lamp, .009);
  lathe([[.254,.06],[.274,.06],[.28,.08],[.28,.14],[.27,.16],[.252,.16]], brass, lamp, 48);
  const bulb = mesh(new THREE.SphereGeometry(.18, 32, 20), underside, lamp);
  bulb.position.y = .2;
  const switchButton = mesh(new THREE.CylinderGeometry(.047,.047,.025,24), brass, lamp);
  switchButton.rotation.x = Math.PI / 2; switchButton.position.set(0,-.88,.36);
  tube([new THREE.Vector3(.2,-1.01,-.13), new THREE.Vector3(.48,-1.15,-.12),
    new THREE.Vector3(.81,-1.23,-.1), new THREE.Vector3(.94,-1.16,-.1)], cream, lamp, .018, false, 36);
  lamp.rotation.set(.2, -.38, -.2); scene.add(lamp);

  // Enamel mirror with real rounded thickness, inset silver face and visible back.
  const mirror = new THREE.Group();
  function mirrorOutline(width, height, inset = 0) {
    return Array.from({ length: 160 }, (_, i) => {
      const a = i / 160 * Math.PI * 2;
      const sx = Math.sign(Math.cos(a)) * Math.pow(Math.abs(Math.cos(a)), .48);
      const sy = Math.sign(Math.sin(a)) * Math.pow(Math.abs(Math.sin(a)), .48);
      const ripple = Math.sin(a * 7 + .4) * .058 + Math.cos(a * 3) * .024;
      return new THREE.Vector2(sx * (width - inset + ripple), sy * (height - inset + ripple));
    });
  }
  const outer = mirrorOutline(.87, 1.23);
  const inner = mirrorOutline(.87, 1.23, .2);
  const frameShape = new THREE.Shape(outer);
  frameShape.holes.push(new THREE.Path([...inner].reverse()));
  mesh(new THREE.ExtrudeGeometry(frameShape, { depth: .13, bevelEnabled: true, bevelSegments: 5,
    steps: 1, bevelSize: .064, bevelThickness: .065, curveSegments: 24 }), lilac, mirror);
  const back = mesh(new THREE.ExtrudeGeometry(new THREE.Shape(outer), {
    depth: .045, bevelEnabled: true, bevelSize: .025, bevelThickness: .025, bevelSegments: 3,
  }), deepLilac, mirror);
  back.position.z = -.08;
  const mirrorFace = mesh(new THREE.ShapeGeometry(new THREE.Shape(mirrorOutline(.87,1.23,.174)), 48), silver, mirror);
  const facePositions=mirrorFace.geometry.attributes.position;
  const faceUV=mirrorFace.geometry.attributes.uv;
  for(let i=0;i<faceUV.count;i++) faceUV.setXY(i,(facePositions.getX(i)+.8)/1.6,(facePositions.getY(i)+1.2)/2.4);
  faceUV.needsUpdate=true;
  mirrorFace.position.z = .11;
  tube(inner.map(p => new THREE.Vector3(p.x,p.y,.14)), lilac, mirror, .022);
  mirror.rotation.set(.13, -.27, .18); scene.add(mirror);

  // Individually stuffed petals with gathered roots, piping, stitches and tufts.
  const flower = new THREE.Group();
  const stitchGeometry = new THREE.SphereGeometry(.009, 5, 4);
  const stitchTransforms = [];
  for (let petal = 0; petal < 7; petal++) {
    const a = petal / 7 * Math.PI * 2;
    const petalGroup = new THREE.Group(); petalGroup.rotation.z = a; flower.add(petalGroup);
    const geometry = new THREE.SphereGeometry(1, 40, 28);
    const p = geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x=p.getX(i), y=p.getY(i), z=p.getZ(i);
      const rootPull = .83 + .17 * (y + 1) / 2;
      const crease = 1 - .025 * Math.cos(Math.atan2(x,z) * 12) * Math.pow(Math.max(0, -y), 3);
      p.setXYZ(i, x * .34 * rootPull, .7 + y * .51, z * .245 * crease);
    }
    geometry.computeVertexNormals(); mesh(geometry, fabric, petalGroup);
    const seamPoints = Array.from({length:72}, (_,i) => {
      const theta = i / 72 * Math.PI * 2;
      const y = Math.sin(theta);
      return new THREE.Vector3(Math.cos(theta) * .34 * (.83 + .17 * (y+1)/2), .7+y*.51, 0);
    });
    tube(seamPoints, piping, petalGroup, .012, true, 80);
    for (let i=0; i<32; i++) {
      const t = i/32*Math.PI*2;
      const localX = Math.cos(t)*.336*(.83+.17*(Math.sin(t)+1)/2);
      const localY = .7+Math.sin(t)*.5;
      const matrix = new THREE.Matrix4().compose(new THREE.Vector3(
        localX*Math.cos(a)-localY*Math.sin(a), localX*Math.sin(a)+localY*Math.cos(a), .018),
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),a+t), new THREE.Vector3(1,2.1,1));
      stitchTransforms.push(matrix);
    }
  }
  const stitches = new THREE.InstancedMesh(stitchGeometry, thread, stitchTransforms.length);
  stitchTransforms.forEach((matrix,i) => stitches.setMatrixAt(i,matrix)); flower.add(stitches);
  const cushionCenter = new THREE.SphereGeometry(.48, 56, 36);
  const centerPositions = cushionCenter.attributes.position;
  for (let i=0;i<centerPositions.count;i++) {
    const x=centerPositions.getX(i), y=centerPositions.getY(i), z=centerPositions.getZ(i);
    const r=Math.sqrt(x*x+y*y);
    const gather=1-.035*Math.cos(Math.atan2(y,x)*18)*Math.pow(Math.min(r/.48,1),6);
    centerPositions.setXYZ(i,x,y,z*.52*gather);
  }
  cushionCenter.computeVertexNormals();
  const center = mesh(cushionCenter, yellow, flower); center.position.z = .21;
  const backCenter = mesh(cushionCenter, yellow, flower); backCenter.position.z=-.21;
  tube(Array.from({length:96},(_,i)=>{ const a=i/96*Math.PI*2;
    return new THREE.Vector3(Math.cos(a)*.455,Math.sin(a)*.455,.282);
  }), yellowThread, flower, .008);
  for (const [x,y] of [[0,0],[-.2,.12],[.2,.12],[0,-.2]]) {
    const button = mesh(new THREE.SphereGeometry(.031,12,8),yellowThread,flower);
    button.scale.z=.3; button.position.set(x,y,.21+Math.sqrt(.48*.48-x*x-y*y)*.52-.012);
  }
  flower.rotation.set(-.13,.21,-.16); scene.add(flower);

  // Glazed hollow ceramic with blue hand-painted stripes and a rolled lip.
  const vase = new THREE.Group();
  const ceramic = material('#ffffff', { vertexColors: true, roughness: .3, clearcoat: 1 });
  const vaseBody = lathe([[0,-.95],[.32,-.95],[.51,-.89],[.6,-.7],[.55,-.49],
    [.36,-.34],[.4,-.22],[.57,-.05],[.6,.16],[.49,.36],[.29,.46],
    [.28,.68],[.35,.88],[.35,.96],[.29,1],[.23,.94],[.22,.86],[.2,.67],
    [.23,.5],[.36,.29],[.42,.13],[.36,-.02],[.23,-.24],[.26,-.45],
    [.39,-.65],[.34,-.79],[0,-.8]],ceramic,vase);
  const vasePositions=vaseBody.geometry.attributes.position;
  const colors=[],blue=new THREE.Color('#3278e5'),ivory=new THREE.Color('#fff2da');
  for(let i=0;i<vasePositions.count;i++) {
    const angle=Math.atan2(vasePositions.getZ(i),vasePositions.getX(i));
    const stripe=Math.sin(angle*7+Math.sin(vasePositions.getY(i)*4)*.34)>.12;
    const c=stripe?blue:ivory; colors.push(c.r,c.g,c.b);
  }
  vaseBody.geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  tube(ring(.315,.974),cream,vase,.021); tube(ring(.34,-.93),cream,vase,.014);
  vase.rotation.set(.2,-.3,-.18); scene.add(vase);

  const decor = [lamp, mirror, flower, vase];
  const rotations = decor.map(item => item.rotation.clone());
  const pointer = { x: 0, y: 0, easedX: 0, easedY: 0 };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, disposed = false, visible = true, paused = document.hidden;
  let elapsed = 0, previousTime = 0, firstRender = true, lastRender = 0;
  const frameInterval = 1000 / (compactDevice ? 30 : 60);
  let restPositions = [];
  function resize() {
    if (disposed) return;
    const bounds = container.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const aspect = bounds.width / bounds.height;
    const compact = bounds.width < 500;
    const viewWidth = aspect > 1.65 ? 8.6 : 7;
    camera.left = -viewWidth / 2; camera.right = viewWidth / 2;
    camera.top = viewWidth / aspect / 2; camera.bottom = -camera.top;
    camera.updateProjectionMatrix(); renderer.setSize(bounds.width, bounds.height, false);
    const spreadY = Math.min(1, camera.top / 2.85);
    restPositions = [[-1.45,.85,1.05],[1.27,1.08,.94],[1.15,-1.42,.96],[-1.31,-1.5,.71]];
    decor.forEach((item, index) => {
      const [x,y,size] = restPositions[index]; restPositions[index][1] = y * spreadY;
      const scale = size * (compact ? .94 : 1) * Math.min(1,camera.top/2.5);
      item.position.set(x,restPositions[index][1],index*.06); item.scale.setScalar(scale);
    });
    cancelAnimationFrame(frame); draw();
  }
  function draw(time = performance.now()) {
    if (disposed || !restPositions.length) return;
    frame = 0;
    const animate = visible && !paused && !reducedMotion.matches;
    if (animate && !firstRender && time - lastRender < frameInterval - 1) {
      frame = requestAnimationFrame(draw); return;
    }
    lastRender = time;
    if (animate) {
      if (previousTime) elapsed += Math.max(0,Math.min((time-previousTime)/1000,.05));
      previousTime=time;
      pointer.easedX += (pointer.x-pointer.easedX)*.035;
      pointer.easedY += (pointer.y-pointer.easedY)*.035;
    } else previousTime=0;
    decor.forEach((item,i)=>{
      const phase=i*1.65, [x,y]=restPositions[i];
      item.position.x=x+pointer.easedX*(i%2?.1:-.08);
      item.position.y=y+Math.sin(elapsed*.55+phase)*.075+pointer.easedY*.08;
      item.rotation.x=rotations[i].x+Math.sin(elapsed*.3+phase)*.1;
      // The mirror keeps its reflective face visible through gentle 3/4 turns.
      item.rotation.y=rotations[i].y+Math.sin(elapsed*.25+phase)*(i===1?.25:.48)+pointer.easedX*.09;
      item.rotation.z=rotations[i].z+Math.sin(elapsed*.32+phase)*.07;
    });
    renderer.render(scene,camera);
    if(firstRender){firstRender=false;onReady();}
    if(animate)frame=requestAnimationFrame(draw);
  }
  function resume(){if(disposed)return;cancelAnimationFrame(frame);previousTime=0;draw();}
  function move(event){
    const bounds=container.getBoundingClientRect();
    pointer.x=Math.max(-1,Math.min(1,(event.clientX-bounds.left)/bounds.width*2-1));
    pointer.y=Math.max(-1,Math.min(1,1-(event.clientY-bounds.top)/bounds.height*2));
  }
  function resetPointer(){pointer.x=pointer.y=0;}
  function visibilityChange(){paused=document.hidden;resume();}
  function contextLost(event){event.preventDefault();paused=true;cancelAnimationFrame(frame);container.classList.remove('hero-decor-ready');}
  function contextRestored(){paused=document.hidden;container.classList.add('hero-decor-ready');resume();}
  const eventSurface=container.parentElement||container;
  eventSurface.addEventListener('pointermove',move,{passive:true});
  eventSurface.addEventListener('pointerleave',resetPointer);
  document.addEventListener('visibilitychange',visibilityChange);
  reducedMotion.addEventListener('change',resume);
  renderer.domElement.addEventListener('webglcontextlost',contextLost);
  renderer.domElement.addEventListener('webglcontextrestored',contextRestored);
  const resizeObserver=new ResizeObserver(resize); resizeObserver.observe(container);
  const visibilityObserver=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;resume();},{rootMargin:'100px'});
  visibilityObserver.observe(container); resize();
  return()=>{
    disposed=true; cancelAnimationFrame(frame);
    resizeObserver.disconnect();visibilityObserver.disconnect();
    eventSurface.removeEventListener('pointermove',move); eventSurface.removeEventListener('pointerleave',resetPointer);
    document.removeEventListener('visibilitychange',visibilityChange); reducedMotion.removeEventListener('change',resume);
    renderer.domElement.removeEventListener('webglcontextlost',contextLost);
    renderer.domElement.removeEventListener('webglcontextrestored',contextRestored);
    const geometries=new Set(); scene.traverse(object=>{if(object.isMesh)geometries.add(object.geometry);});
    geometries.forEach(geometry=>geometry.dispose()); materials.forEach(m=>m.dispose()); weave.dispose();reflectionTexture.dispose();
    environment.dispose();scene.clear();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
  };
}
