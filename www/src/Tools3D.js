import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';

class Tools3D { constructor() {

}};

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

	Tools3D.controls = new OrbitControls(camera, renderer.domElement);
	var controls = Tools3D.controls;
	controls.addEventListener('change', Tools3D.render); // remove when using
	// animation loop
	// enable animation loop when using damping or autorotation
	// controls.enableDamping = true;
	// controls.dampingFactor = 0.25;
	// controls.enableZoom = false;
	// world

	// lights
	var light = new THREE.DirectionalLight(0xffffff);
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
		var renderPass = new RenderPass(scene, camera);
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
		let postEffect = {
			uniforms: {
				tDepth : { value : Tools3D.depthRenderTarget.texture },
				cameraNear : { value : camera.near },
				cameraFar : { value : camera.far },
				onlyAO : { value : (Tools3D.postprocessing.renderMode == 1) },
				aoClamp : { value : 0.3 },
				lumInfluence : { value : 0.5 },
				size: { value : new THREE.Vector2(window.innerWidth, window.innerHeight)},
			}
		}
		
		Tools3D.ssaoPass = new ShaderPass(postEffect);
		var ssaoPass = Tools3D.ssaoPass;
		ssaoPass.renderToScreen = true;
		// ssaoPass.uniforms[ "tDiffuse" ].value will be set by ShaderPass
		 
		/* postEffect.uniforms["tDepth"].value = Tools3D.depthRenderTarget.texture;
		postEffect.uniforms['size'].value.set(window.innerWidth, window.innerHeight);
		postEffect.uniforms['cameraNear'].value = camera.near;
		postEffect.uniforms['cameraFar'].value = camera.far;
		postEffect.uniforms['onlyAO'].value = (Tools3D.postprocessing.renderMode == 1);
		postEffect.uniforms['aoClamp'].value = 0.3;
		postEffect.uniforms['lumInfluence'].value = 0.5; */
		// Add pass to effect composer
		Tools3D.effectComposer = new EffectComposer(renderer);
		var effectComposer = Tools3D.effectComposer;
		effectComposer.addPass(renderPass);
		effectComposer.addPass(ssaoPass);
	}
};

Tools3D.postprocessing = {
	enabled : false,
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
		var file = new File([ content ], "scene.obj", {type: mimeType+";charset=utf-8"});
		saveAs(file);
		
		return true;
	};

	var exporter = new OBJExporter();
	var result = exporter.parse(Tools3D.scene);

	download(result, 'scene.obj', 'text/plain');
};

export { Tools3D };