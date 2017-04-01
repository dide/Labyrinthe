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

	Tools3D.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
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
	light.position.set(-6, 9, -3);
	// light.castShadow = true;
	light.lookAt(new THREE.Vector3(0, 0, 0));
	scene.add(light);
	light = new THREE.DirectionalLight(0x002288);
	light.position.set(-1, -1, -1);
	scene.add(light);
	/* light = new THREE.AmbientLight(0x222222);
	scene.add(light); */

	initPostprocessing();

	//
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);

		// Resize renderTargets
		Tools3D.ssaoPass.uniforms['size'].value.set(window.innerWidth, window.innerHeight);

		var pixelRatio = Tools3D.renderer.getPixelRatio();
		var newWidth = Math.floor(window.innerWidth / pixelRatio) || 1;
		var newHeight = Math.floor(window.innerHeight / pixelRatio) || 1;
		Tools3D.depthRenderTarget.setSize(newWidth, newHeight);
		Tools3D.effectComposer.setSize(newWidth, newHeight);
	}
	window.addEventListener('resize', onWindowResize, false);

	function initPostprocessing() {
		// Setup render pass
		var renderPass = new THREE.RenderPass(scene, camera);
		// Setup depth pass
		Tools3D.depthMaterial = new THREE.MeshDepthMaterial();
		var depthMaterial = Tools3D.depthMaterial;
		depthMaterial.depthPacking = THREE.RGBADepthPacking;
		depthMaterial.blending = THREE.NoBlending;
		var pars = {
			minFilter : THREE.LinearFilter,
			magFilter : THREE.LinearFilter
		};
		Tools3D.depthRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, pars);
		// Setup SSAO pass
		Tools3D.ssaoPass = new THREE.ShaderPass(THREE.SSAOShader);
		var ssaoPass = Tools3D.ssaoPass;
		ssaoPass.renderToScreen = true;
		// ssaoPass.uniforms[ "tDiffuse" ].value will be set by ShaderPass
		ssaoPass.uniforms["tDepth"].value = Tools3D.depthRenderTarget.texture;
		ssaoPass.uniforms['size'].value.set(window.innerWidth, window.innerHeight);
		ssaoPass.uniforms['cameraNear'].value = camera.near;
		ssaoPass.uniforms['cameraFar'].value = camera.far;
		ssaoPass.uniforms['onlyAO'].value = (Tools3D.postprocessing.renderMode == 1);
		ssaoPass.uniforms['aoClamp'].value = 0.3;
		ssaoPass.uniforms['lumInfluence'].value = 0.5;
		// Add pass to effect composer
		Tools3D.effectComposer = new THREE.EffectComposer(renderer);
		var effectComposer = Tools3D.effectComposer;
		effectComposer.addPass(renderPass);
		effectComposer.addPass(ssaoPass);
	}
};

Tools3D.postprocessing = {
	enabled : true,
	renderMode : 0
};

Tools3D.animate = function() {
	requestAnimationFrame(Tools3D.animate);
	Tools3D.controls.update(); // required if controls.enableDamping = true, or
								// if controls.autoRotate = true
	Tools3D.render();
};
Tools3D.render = function() {
	if (Tools3D.postprocessing.enabled) {
		// Render depth into depthRenderTarget
		Tools3D.scene.overrideMaterial = Tools3D.depthMaterial;
		Tools3D.renderer.render(Tools3D.scene, Tools3D.camera, Tools3D.depthRenderTarget, true);
		// Render renderPass and SSAO shaderPass
		Tools3D.scene.overrideMaterial = null;
		Tools3D.effectComposer.render();
	} else {
		Tools3D.renderer.render(Tools3D.scene, Tools3D.camera);
	}
};

Tools3D.exportScene = function() {
	var download = function(content, fileName, mimeType) {
		var a = document.createElement('a');
		mimeType = mimeType || 'application/octet-stream';

		if (navigator.msSaveBlob) { // IE10
			return navigator.msSaveBlob(new Blob([ content ], {
				type : mimeType
			}), fileName);
		} else if ('download' in a) { // html5 A[download]
			/* a.href = 'data:' + mimeType + ',' + encodeURIComponent(content);
			a.setAttribute('download', fileName);
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a); */
			// var w = window.open('', 'scene.obj');
			//w.document.body.innerHTML = content;
			
			var file = new File([ content ], "scene.obj", {type: mimeType+";charset=utf-8"});
			saveAs(file);
			
			return true;
		} else { // do iframe dataURL download (old ch+FF):
			var f = document.createElement('iframe');
			document.body.appendChild(f);
			f.src = 'data:' + mimeType + ',' + encodeURIComponent(content);

			setTimeout(function() {
				document.body.removeChild(f);
			}, 333);
			return true;
		}
	}

	var exporter = new THREE.OBJExporter();
	var result = exporter.parse(Tools3D.scene);

	download(result, 'scene.obj', 'text/plain');
};
