THREE.CopyShader = {
	uniforms: {
		"tDiffuse": { type: "t", value: null },
		"opacity":  { type: "f", value: 0 }
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
		"tDiffuse": { type: "t", value: 1 },
		"amount":   { type: "f", value: 1 },
		"angle":    { type: "f", value: 1 }
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

THREE.MaskPass = function ( scene, camera ) {
	this.scene = scene;
	this.camera = camera;
	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;
	this.inverse = false;
};

THREE.ClearMaskPass = function () {
	this.enabled = false;
};

THREE.ClearMaskPass.prototype = {
	render: function ( renderer, writeBuffer, readBuffer, delta ) {
		var context = renderer.context;
		context.disable( context.STENCIL_TEST );
	}
};

THREE.ShaderPass = function ( shader ) {
	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	this.material = new THREE.ShaderMaterial( {
        	defines: shader.defines || {},
		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	} );

	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();
	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1 ), null );
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

THREE.GlitchPass = function () {
	if ( THREE.DigitalGlitch === undefined ) console.error( "THREE.GlitchPass relies on THREE.DigitalGlitch" );

	var shader = THREE.DigitalGlitch;
	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.uniforms[ "tDisp"].value=this.generateHeightmap(1);

	this.material = new THREE.ShaderMaterial({
		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	});

	this.enabled = true;

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
		else if(this.curF % this.randX <this.randX/20)
		{
			this.uniforms[ 'amount' ].value=Math.random()/20;
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
		this.randX=THREE.Math.randInt(2,100);
	},
	generateHeightmap:function(dt_size)
	{
		var data_arr = new Float32Array( dt_size*dt_size * 3 );
		var length=dt_size*dt_size;

		for ( var i = 0; i < length; i++)
		{
			var val=THREE.Math.randFloat(0,40);
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

var init = function() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 14, 1, 1, 10000 );
  camera.position.z = 1800;

  light = new THREE.DirectionalLight();
  scene.add( light );

  var radius = 172, geometry  = new THREE.IcosahedronGeometry( radius, 2 );

  var materials = [
    new THREE.MeshLambertMaterial( { color: '#666', shading: THREE.FlatShading, vertexColors: THREE.VertexColors } )
  ];

  group1 = THREE.SceneUtils.createMultiMaterialObject( geometry, materials );
  scene.add( group1 );

  ring = new THREE.TorusGeometry(220, 3, 0, 24);
  var ringMaterial = new THREE.MeshLambertMaterial( {color: '#999', shading: THREE.SmoothShading, vertexColors: THREE.VertexColors, side: THREE.DoubleSide } );
  group2 = new THREE.Mesh( ring, ringMaterial );
  scene.add( group2 );

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor("#141414");
  renderer.setSize(320, 320);
  renderer.setPixelRatio(1);
  document.querySelector('.globe').append( renderer.domElement );

  composer = new THREE.EffectComposer( renderer );
  composer.addPass( new THREE.RenderPass( scene, camera ) );

  var effect = new THREE.ShaderPass( THREE.RGBShiftShader );
  effect.uniforms[ 'amount' ].value = 0;
  effect.renderToScreen = true;

  composer.addPass( effect );
  composer.addPass( effect );

  var glitch = new THREE.GlitchPass();
  glitch.renderToScreen = true;
  composer.addPass(glitch);
}

function render() {
  var timer = Date.now() * 0.0001;
  camera.lookAt( scene.position );

  group1.rotation.z = (timer / 1) + 1;

  group2.rotation.x = timer;
  group2.rotation.y = 1;

  composer.render();
}

var animate = function() {
  requestAnimationFrame(animate);
  render();
}

window.onload = this.init()
window.onload = this.animate()

var textWrapper = document.querySelector('h1.ml12');
textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

anime.timeline({loop: false})
  .add({
    targets: 'h1.ml12 .letter',
    translateX: [40,0],
    translateZ: 0,
    opacity: [0,1],
    easing: "easeOutExpo",
    duration: 700,
    delay: (el, i) => 500 + 30 * i
  })

var textWrapper = document.querySelector('h2.ml12');
textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

anime.timeline({loop: false})
  .add({
    targets: 'h2.ml12 .letter',
    translateX: [40,0],
    translateZ: 0,
    opacity: [0,1],
    easing: "easeOutExpo",
    duration: 1400,
    delay: (el, i) => 500 + 30 * i
  })

const controller = new ScrollMagic.Controller()
const tween = new TimelineLite()
  .add(
    TweenLite.fromTo('.ants', 1, {
      left: '50%'
    }, {
      left: 0
    })
  ).add(
    TweenLite.to('.society', 1, {
      left: window.innerWidth / 1.5,
      delay: -1
    })
  ).add(
    TweenLite.to('.one', 1, {
      y: -50
    })
  ).add(
    TweenLite.to('.two', 1, {
      y: -100
    })
  ).add(
    TweenLite.to('.three', 1, {
      y: -150
    })
  )

new ScrollMagic.Scene({
  triggerElement: 'body',
  duration: "200%",
  triggerHook: 0
})
  .setTween(tween)
  .addTo(controller)
