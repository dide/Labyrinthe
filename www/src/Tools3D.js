var Tools3D = function() {

};

Tools3D.init = function() {
	Tools3D.scene = new THREE.Scene();
	var scene = Tools3D.scene;
	scene.fog = new THREE.FogExp2(0xFFFFFF, 0.002);

	Tools3D.renderer = new THREE.WebGLRenderer();
	var renderer = Tools3D.renderer;
	renderer.setClearColor(scene.fog.color);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	var container = document.getElementById('threedcontainer');
	container.appendChild(renderer.domElement);
	
	Tools3D.camera = new THREE.PerspectiveCamera(60, window.innerWidth
			/ window.innerHeight, 1, 1000);
	var camera = Tools3D.camera;
	camera.position.z = 500;
	
	Tools3D.controls = new THREE.OrbitControls(camera, renderer.domElement);
	var controls = Tools3D.controls;
	controls.addEventListener('change', Tools3D.render); // remove when using
	// animation loop
	// enable animation loop when using damping or autorotation
	// controls.enableDamping = true;
	// controls.dampingFactor = 0.25;
	// controls.enableZoom = false;
	// world


	// lights
	light = new THREE.DirectionalLight(0xffffff);
	light.position.set(1, 1, 1);
	scene.add(light);
	light = new THREE.DirectionalLight(0x002288);
	light.position.set(-1, -1, -1);
	scene.add(light);
	light = new THREE.AmbientLight(0x222222);
	scene.add(light);

	//
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}
	window.addEventListener('resize', onWindowResize, false);
};

Tools3D.animate = function() {
	requestAnimationFrame( Tools3D.animate );
	Tools3D.controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
	Tools3D.render();
};
Tools3D.render = function() {
	Tools3D.renderer.render( Tools3D.scene, Tools3D.camera );
};