
THREE.FireballShader = {

	uniforms: {
		"iGlobalTime": { type: "f", value: 1.0 },
		"resolution" : { type: "v2", value: new THREE.Vector2() }
	},

	vertexShader: [
		"varying vec3 fNormal;",
		"varying vec3 fPosition;",
		"uniform float iGlobalTime;",
		"float rand(vec2 co){",
    	"return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);",
		"}",

		"void main() {",
		  "fNormal = normalize(normalMatrix * normal);",
		   "float displacement = cos(position.x * 20.0) *cos(position.y * 20.0) ",
		   			"*cos(position.z * 20.0) *cos(iGlobalTime*30.0 + rand(position.xz)*3.0);",
		  "vec3 newPosition = position + normal * displacement;",
		  "vec4 pos = modelViewMatrix * vec4(newPosition, 1.0);",
		  "fPosition = pos.xyz;",
		  "gl_Position = projectionMatrix * pos;",
		"}"


	].join( "\n" ),

	fragmentShader: [
		"varying vec3 fNormal;",
		"varying vec3 fPosition;",
		"uniform vec2 resolution;",

		"vec3 rim(vec3 color, float start, float end, float coef) {",
		  "vec3 normal = normalize(fNormal);",
		  "vec3 eye = normalize(-fPosition.xyz);",
		  "float rim = smoothstep(start, end, 1.0 - dot(normal, eye));",
		  "return clamp(rim, 0.0, 1.0) * coef * color;",
		"}",

		"vec2 blinnPhongDir(vec3 lightDir, float lightInt, float Ka, float Kd, float Ks, float shininess) {",
		  "vec3 s = normalize(lightDir);",
		  "vec3 v = normalize(-fPosition);",
		  "vec3 n = normalize(fNormal);",
		  "vec3 h = normalize(v+s);",
		  "float diffuse = Ka + Kd * lightInt * max(0.0, dot(n, s));",
		  "float spec =  Ks * pow(max(0.0, dot(n,h)), shininess);",
		  "return vec2(diffuse, spec);",
		"}",

		"void main() {",
		  "vec3 lightDir = vec3(0.0,1.0,0.0);",
		  "vec3 color = vec3(1.5,.5,0.0);",
		  "vec2 ds = blinnPhongDir(lightDir, 2.5, 0.5, 0.2, 0.0, 120.0);",
		  "float brightness = ds.x + ds.y;",
		  "vec3 rim3 = rim(color, -1.0, 1., 2.0);",
		  "gl_FragColor = vec4(brightness * rim3, 1.0);",
		"}"

	].join( "\n" )

};
