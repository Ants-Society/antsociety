THREE.CopyShader = {
	uniforms: {
		"tDiffuse": { type: "t", value: null },
		"opacity":  { type: "f", value: 1.0 }
	},
	vertexShader: [
		"varying vec2 vUv;",
		"void main() {",
			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
	].join("\n"),

	fragmentShader: [
		"uniform float opacity;",
		"uniform sampler2D tDiffuse;",
		"varying vec2 vUv;",
		"void main() {",
			"vec4 texel = texture2D( tDiffuse, vUv );",
			"gl_FragColor = opacity * texel;",
		"}"
	].join("\n")
};

THREE.DotScreenShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"tSize":    { type: "v2", value: new THREE.Vector2( 256, 256 ) },
		"center":   { type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) },
		"angle":    { type: "f", value: 1.57 },
		"scale":    { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform vec2 center;",
		"uniform float angle;",
		"uniform float scale;",
		"uniform vec2 tSize;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"float pattern() {",

			"float s = sin( angle ), c = cos( angle );",

			"vec2 tex = vUv * tSize - center;",
			"vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;",

			"return ( sin( point.x ) * sin( point.y ) ) * 4.0;",

		"}",

		"void main() {",

			"vec4 color = texture2D( tDiffuse, vUv );",

			"float average = ( color.r + color.g + color.b ) / 3.0;",

			"gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );",

		"}"

	].join("\n")

};

THREE.RGBShiftShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"amount":   { type: "f", value: 0.005 },
		"angle":    { type: "f", value: 0.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float amount;",
		"uniform float angle;",

		"varying vec2 vUv;",

		"void main() {",

			"vec2 offset = amount * vec2( cos(angle), sin(angle));",
			"vec4 cr = texture2D(tDiffuse, vUv + offset);",
			"vec4 cga = texture2D(tDiffuse, vUv);",
			"vec4 cb = texture2D(tDiffuse, vUv - offset);",
			"gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);",

		"}"

	].join("\n")

};

THREE.DigitalGlitch = {

	uniforms: {

		"tDiffuse":		{ type: "t", value: null },//diffuse texture
		"tDisp":		{ type: "t", value: null },//displacement texture for digital glitch squares
		"byp":			{ type: "i", value: 0 },//apply the glitch ?
		"amount":		{ type: "f", value: 0.01 },
		"angle":		{ type: "f", value: 0.02 },
		"seed":			{ type: "f", value: 0.02 },
		"seed_x":		{ type: "f", value: 0.02 },//-1,1
		"seed_y":		{ type: "f", value: 0.01 },//-1,1
		"distortion_x":	{ type: "f", value: 0.5 },
		"distortion_y":	{ type: "f", value: 0.6 },
		"col_s":		{ type: "f", value: 0.05 }
	},

	vertexShader: [

		"varying vec2 vUv;",
		"void main() {",
			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
	].join("\n"),

	fragmentShader: [
		"uniform int byp;",//should we apply the glitch ?

		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tDisp;",

		"uniform float amount;",
		"uniform float angle;",
		"uniform float seed;",
		"uniform float seed_x;",
		"uniform float seed_y;",
		"uniform float distortion_x;",
		"uniform float distortion_y;",
		"uniform float col_s;",

		"varying vec2 vUv;",


		"float rand(vec2 co){",
			"return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
		"}",

		"void main() {",
			"if(byp<1) {",
				"vec2 p = vUv;",
				"float xs = floor(gl_FragCoord.x / 0.5);",
				"float ys = floor(gl_FragCoord.y / 0.5);",
				//based on staffantans glitch shader for unity https://github.com/staffantan/unityglitch
				"vec4 normal = texture2D (tDisp, p*seed*seed);",
				"if(p.y<distortion_x+col_s && p.y>distortion_x-col_s*seed) {",
					"if(seed_x>0.){",
						"p.y = 1. - (p.y + distortion_y);",
					"}",
					"else {",
						"p.y = distortion_y;",
					"}",
				"}",
				"if(p.x<distortion_y+col_s && p.x>distortion_y-col_s*seed) {",
					"if(seed_y>0.){",
						"p.x=distortion_x;",
					"}",
					"else {",
						"p.x = 1. - (p.x + distortion_x);",
					"}",
				"}",
				"p.x+=normal.x*seed_x*(seed/5.);",
				"p.y+=normal.y*seed_y*(seed/5.);",
				//base from RGB shift shader
				"vec2 offset = amount * vec2( cos(angle), sin(angle));",
				"vec4 cr = texture2D(tDiffuse, p + offset);",
				"vec4 cga = texture2D(tDiffuse, p);",
				"vec4 cb = texture2D(tDiffuse, p - offset);",
				"gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);",
				//add noise
				"vec4 snow = 200.*amount*vec4(rand(vec2(xs * seed,ys * seed*50.))*0.2);",
				"gl_FragColor = gl_FragColor+ snow;",
			"}",
			"else {",
				"gl_FragColor=texture2D (tDiffuse, vUv);",
			"}",
		"}"

	].join("\n")

};

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.EffectComposer = function ( renderer, renderTarget ) {

	this.renderer = renderer;

	if ( renderTarget === undefined ) {

		var pixelRatio = renderer.getPixelRatio();

		var width  = Math.floor( renderer.context.canvas.width  / pixelRatio ) || 1;
		var height = Math.floor( renderer.context.canvas.height / pixelRatio ) || 1;
		var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };

		renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );

	}

	this.renderTarget1 = renderTarget;
	this.renderTarget2 = renderTarget.clone();

	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;

	this.passes = [];

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.EffectComposer relies on THREE.CopyShader" );

	this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

};

THREE.EffectComposer.prototype = {

	swapBuffers: function() {

		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	},

	addPass: function ( pass ) {

		this.passes.push( pass );

	},

	insertPass: function ( pass, index ) {

		this.passes.splice( index, 0, pass );

	},

	render: function ( delta ) {

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		var maskActive = false;

		var pass, i, il = this.passes.length;

		for ( i = 0; i < il; i ++ ) {

			pass = this.passes[ i ];

			if ( !pass.enabled ) continue;

			pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

			if ( pass.needsSwap ) {

				if ( maskActive ) {

					var context = this.renderer.context;

					context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

					context.stencilFunc( context.EQUAL, 1, 0xffffffff );

				}

				this.swapBuffers();

			}

			if ( pass instanceof THREE.MaskPass ) {

				maskActive = true;

			} else if ( pass instanceof THREE.ClearMaskPass ) {

				maskActive = false;

			}

		}

	},

	reset: function ( renderTarget ) {

		if ( renderTarget === undefined ) {

			renderTarget = this.renderTarget1.clone();

			var pixelRatio = renderer.getPixelRatio();

			renderTarget.width  = Math.floor( this.renderer.context.canvas.width  / pixelRatio );
			renderTarget.height = Math.floor( this.renderer.context.canvas.height / pixelRatio );

		}

		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

	},

	setSize: function ( width, height ) {

		var renderTarget = this.renderTarget1.clone();

		renderTarget.width = width;
		renderTarget.height = height;

		this.reset( renderTarget );

	}

};

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

	this.scene = scene;
	this.camera = camera;

	this.overrideMaterial = overrideMaterial;

	this.clearColor = clearColor;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 1;

	this.oldClearColor = new THREE.Color();
	this.oldClearAlpha = 1;

	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;

};

THREE.RenderPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		this.scene.overrideMaterial = this.overrideMaterial;

		if ( this.clearColor ) {

			this.oldClearColor.copy( renderer.getClearColor() );
			this.oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		renderer.render( this.scene, this.camera, readBuffer, this.clear );

		if ( this.clearColor ) {

			renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );

		}

		this.scene.overrideMaterial = null;

	}

};

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MaskPass = function ( scene, camera ) {

	this.scene = scene;
	this.camera = camera;

	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;

	this.inverse = false;

};

THREE.MaskPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		var context = renderer.context;

		// don't update color or depth

		context.colorMask( false, false, false, false );
		context.depthMask( false );

		// set up stencil

		var writeValue, clearValue;

		if ( this.inverse ) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		context.enable( context.STENCIL_TEST );
		context.stencilOp( context.REPLACE, context.REPLACE, context.REPLACE );
		context.stencilFunc( context.ALWAYS, writeValue, 0xffffffff );
		context.clearStencil( clearValue );

		// draw into the stencil buffer

		renderer.render( this.scene, this.camera, readBuffer, this.clear );
		renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		// re-enable update of color and depth

		context.colorMask( true, true, true, true );
		context.depthMask( true );

		// only render where stencil is set to 1

		context.stencilFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
		context.stencilOp( context.KEEP, context.KEEP, context.KEEP );

	}

};


THREE.ClearMaskPass = function () {

	this.enabled = true;

};

THREE.ClearMaskPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		var context = renderer.context;

		context.disable( context.STENCIL_TEST );

	}

};

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function ( shader ) {

	// this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new THREE.ShaderMaterial( {

        	defines: shader.defines || {},
		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.renderToScreen = false;

	this.enabled = false;
	this.needsSwap = true;
	this.clear = false;


	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.ShaderPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer;

		}

		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	}

};

/**

 */

THREE.GlitchPass = function ( dt_size ) {

	if ( THREE.DigitalGlitch === undefined ) console.error( "THREE.GlitchPass relies on THREE.DigitalGlitch" );

	var shader = THREE.DigitalGlitch;
	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	if(dt_size==undefined) dt_size=64;


	this.uniforms[ "tDisp"].value=this.generateHeightmap(dt_size);


	this.material = new THREE.ShaderMaterial({
		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	});

	this.enabled = true;
	this.renderToScreen = false;
	this.needsSwap = true;


	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

	this.goWild=false;
	this.curF=1;
	this.generateTrigger();

};

THREE.GlitchPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta )
	{
		this.uniforms[ "tDiffuse" ].value = readBuffer;
		this.uniforms[ 'seed' ].value=0;
		this.uniforms[ 'byp' ].value=0;

		if(this.curF % this.randX ==0 || this.goWild==true)
		{
			this.uniforms[ 'amount' ].value=Math.random()/30;
			this.uniforms[ 'angle' ].value=THREE.Math.randFloat(-Math.PI,Math.PI);
			this.uniforms[ 'seed_x' ].value=THREE.Math.randFloat(-1,1);
			this.uniforms[ 'seed_y' ].value=THREE.Math.randFloat(-1,1);
			this.uniforms[ 'distortion_x' ].value=THREE.Math.randFloat(0,1);
			this.uniforms[ 'distortion_y' ].value=THREE.Math.randFloat(0,1);
			this.curF=1;
			this.generateTrigger();
		}
		else if(this.curF % this.randX <this.randX/5)
		{
			this.uniforms[ 'amount' ].value=Math.random()/90;
			this.uniforms[ 'angle' ].value=THREE.Math.randFloat(-Math.PI,Math.PI);
			this.uniforms[ 'distortion_x' ].value=THREE.Math.randFloat(0,1);
			this.uniforms[ 'distortion_y' ].value=THREE.Math.randFloat(0,1);
			this.uniforms[ 'seed_x' ].value=THREE.Math.randFloat(-0.3,0.3);
			this.uniforms[ 'seed_y' ].value=THREE.Math.randFloat(-0.3,0.3);
		}
		else if(this.goWild==false)
		{
			this.uniforms[ 'byp' ].value=1;
		}
		this.curF++;

		this.quad.material = this.material;
		if ( this.renderToScreen )
		{
			renderer.render( this.scene, this.camera );
		}
		else
		{
			renderer.render( this.scene, this.camera, writeBuffer, false );
		}
	},
	generateTrigger:function()
	{
		this.randX=THREE.Math.randInt(120,240);
	},
	generateHeightmap:function(dt_size)
	{
		var data_arr = new Float32Array( dt_size*dt_size * 3 );
		var length=dt_size*dt_size;

		for ( var i = 0; i < length; i++)
		{
			var val=THREE.Math.randFloat(0,1);
			data_arr[ i*3 + 0 ] = val;
			data_arr[ i*3 + 1 ] = val;
			data_arr[ i*3 + 2 ] = val;
		}

		var texture = new THREE.DataTexture( data_arr, dt_size, dt_size, THREE.RGBFormat, THREE.FloatType );
		texture.minFilter = THREE.NearestFilter;
		texture.magFilter = THREE.NearestFilter;
		texture.needsUpdate = true;
		texture.flipY = false;
		return texture;
	}
};

var container, stats, camera, scene, renderer, composer, mesh, group1, group2, light, sphere, lightMesh, quaternion, ring;
var mouseX = 0, mouseY = 0;
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var init = function(){
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 14, 800 / 440, 1, 10000 );
  camera.position.z = 1800;

  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1.5, 1.5, 1.5 );
  scene.add( light );
  scene.fog = new THREE.Fog( 0x000000, 200, 1 );

  sphere = new THREE.SphereGeometry( 10, 16, 8, 1 );
  lightMesh = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: '#000' } ) );
  scene.add( lightMesh );

  var faceIndices = [ 'a', 'b', 'c', 'd' ];
  var color, f, p, n, vertexIndex,
    radius = 140,
    geometry  = new THREE.IcosahedronGeometry( radius, 3 );

  var materials = [
    new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } )
  ];

  group1 = THREE.SceneUtils.createMultiMaterialObject( geometry, materials );
  group1.position.x = 0;
  scene.add( group1 );

  ring = new THREE.TorusGeometry( 210, 1, 100, 50 );
  var ringMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff, shading: THREE.SmoothShading, vertexColors: THREE.VertexColors, side: THREE.DoubleSide } );
  group2 = new THREE.Mesh( ring, ringMaterial );
  scene.add( group2 );

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor("#141414");
  renderer.setSize(800, 440);
  renderer.setPixelRatio(1.6);
  document.querySelector('main').append( renderer.domElement );

  composer = new THREE.EffectComposer( renderer );
  composer.addPass( new THREE.RenderPass( scene, camera ) );

  var effect = new THREE.ShaderPass( THREE.RGBShiftShader );
  effect.uniforms[ 'amount' ].value = 0.01;
  effect.renderToScreen = true;

  composer.addPass( effect );
  composer.addPass( effect );

  var glitch = new THREE.GlitchPass();
  glitch.renderToScreen = true;
  composer.addPass(glitch);
}

function render() {
  var timer = Date.now() * 0.0010;
  camera.lookAt( scene.position );

  group1.rotation.z = (timer / 2) + 45;

  group2.rotation.x = timer;
  group2.rotation.y = 45;

  composer.render();
}

var animate = function() {
  requestAnimationFrame(animate);
  render();
}

window.onload = this.init()
window.onload = this.animate()
