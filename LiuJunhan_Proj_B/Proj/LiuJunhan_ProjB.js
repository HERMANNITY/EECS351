var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normals;\n' +

  'uniform mat4 u_Normal;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'uniform vec3 u_lightDirection;\n' +
  'uniform vec3 u_lightColor;\n' +
  
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
  
  '  vec3 normalized = normalize(vec3(u_Normal*a_Normals));\n' +
  '  float diffuse = 0.3+0.7*max(dot(normalized, u_lightDirection), 0.0);\n' +
  '  vec3 color = u_lightColor*diffuse*vec3(a_Color);\n' +
  '  v_Color = vec4(color, a_Color.a);\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

// Global Variables
var ANGLE_STEP = 45.0;		
var floatsPerVertex = 7;	

var isDrag=false;		
var xMclik=0.0;			
var yMclik=0.0;   
var xMdragTot=0.0;	
var yMdragTot=0.0; 
var headposition = 0.0;
var stick_stop = 1;
var big = 1;
var r_radius = 1;
var g_points = []; 
var last_pointx = 0;
var last_pointy =0;
var dbclick = 0;

var qNew = new Quaternion(0,0,0,1); // most-recent mouse drag's rotation
var qTot = new Quaternion(0,0,0,1);	// 'current' orientation (made from qNew)
var quatMatrix = new Matrix4();				// rotation matrix, made from latest qTot
var lightDirection = new Vector3([0, 1, 1]);
lightDirection.normalize();
function main() {
//==============================================================================
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // 
  var n = initVertexBuffer(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }
  canvas.onmousedown	=	function(ev){myMouseDown(ev, gl, canvas) }; 
  
  					// when user's mouse button goes down call mouseDown() function
  canvas.onmousemove = 	function(ev){myMouseMove(ev, gl, canvas) };
  
											// call mouseMove() function					
  canvas.onmouseup = 		function(ev){myMouseUp(ev, gl, canvas)};
  

  // window.addEventListener("keydown", myKeyDown, false);
	
	document.onkeydown= function(ev){myKeyDown(ev, gl, u_ViewMatrix, viewMatrix); };
	
  // gl.clearColor(0.3,0.3,0.3,1);
  gl.clearColor(0.3, 0.6, 0.1, 0.9);

	gl.enable(gl.DEPTH_TEST); 	  
	gl.depthFunc(gl.LEQUAL);
  // Get handle to graphics system's storage location of u_ModelMatrix
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_ViewMatrix  = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  var u_ProjMatrix  = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  if (!u_ModelMatrix || !u_ViewMatrix || !u_ProjMatrix) { 
    console.log('Failed to Get the storage locations of u_ModelMatrix, u_ViewMatrix, and/or u_ProjMatrix');
    return;
  }

  var modelMatrix = new Matrix4(); // The model matrix
  var viewMatrix = new Matrix4();  // The view matrix
  var projMatrix = new Matrix4();  // The projection matrix

  var u_Normal = gl.getUniformLocation(gl.program, 'u_Normal');
  if (!u_Normal) { 
    console.log('Failed to get the storage location of u_Normal');
    return;
  }

  var u_lightDirection = gl.getUniformLocation(gl.program, 'u_lightDirection');
  if (!u_lightDirection) { 
    console.log('Failed to get the storage location of u_lightDirection');
    return;
  }

  var u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) { 
    console.log('Failed to get the storage location of u_lightColor');
    return;
  }
  

  gl.uniform3fv(u_lightDirection, lightDirection.elements);

  gl.uniform3f(u_lightColor, 1,1,1);
  // Create our JavaScript 'model' matrix: 
  var modelMatrix = new Matrix4();
  var normals = new Matrix4();

  // Create, init current rotation angle value in JavaScript
  var currentAngle = 0.0;

  
//-----------------  

  // Start drawing: create 'tick' variable whose value is this function:
  var tick = function() {
  	
    currentAngle = animate(currentAngle); 
    winResize(gl, n, currentAngle, modelMatrix, u_ModelMatrix
    				,viewMatrix, u_ViewMatrix,
    				projMatrix, u_ProjMatrix
    				, normals, u_Normal
    				);
    // draw(gl, n, currentAngle, 
    // 				modelMatrix, u_ModelMatrix
    // 				,viewMatrix, u_ViewMatrix,
    // 				projMatrix, u_ProjMatrix
    // 				, normals, u_Normal
    // 				);   // Draw shapes
    
    requestAnimationFrame(tick, canvas);   
    
  };
  tick();	
	
}

function initVertexBuffer(gl, currentAngle) {
//==============================================================================
// Create one giant vertex buffer object (VBO) that holds all vertices for all
// shapes.
 	var c30 = Math.sqrt(0.75);					// == cos(30deg) == sqrt(3) / 2
	var sq2	= Math.sqrt(2.0);
  var smtnormals = new Float32Array([
			1.5*sq2, c30*sq2, c30, 0.0, 
			1.5*sq2, c30*sq2, c30, 0.0, 
			1.5*sq2, c30*sq2, c30, 0.0, 
			// Face 1: (right side)
			-1.5*sq2, c30*sq2, c30, 0.0, 
			-1.5*sq2, c30*sq2, c30, 0.0, 
			-1.5*sq2, c30*sq2, c30, 0.0, 
			// Face 2: (lower side)
			0, -2*c30*sq2, c30, 0.0, 
			0, -2*c30*sq2, c30, 0.0,
			0, -2*c30*sq2, c30, 0.0, 
     	// Face 3: (base side)]);
			0,0,-3*c30,0.0, 
			0,0,-3*c30,0.0, 
			0,0,-3*c30,0.0,

			0,1,1,0,
			0,1,1,0,
			0,1,1,0,
			0,1,1,0,
			0,1,1,0,
			0,1,1,0
			]);
 	
  makeStick();					
  makeHead();						
  makeRing1();					
  makeRing2();
  makeEye();
  makeDiamond();
  makeDiamondd();
  makeGroundGrid();
  makeSomething();
  makeStar ();
  makeA();
  // how many floats total needed to store all shapes?
	var mySiz = (cylVerts.length + sphVerts.length
							 + torVerts1.length + torVerts2.length + eyeVerts.length 
							 + dmdVerts.length + dmddVerts.length
							 + gndVerts.length + somethingVerts.length + starVerts.length
               + AVerts.length);
							 
	// How many vertices total?
	var nn = mySiz / floatsPerVertex;
	
	// Copy all shapes into one big Float32 array:
  var colorShapes = new Float32Array(mySiz);
	// Copy them:  remember where to start for each shape:
	cylStart = 0;							// we stored the cylinder first.
  for(i=0,j=0; j< cylVerts.length; i++,j++) {
  	colorShapes[i] = cylVerts[j];
		}
	sphStart = i;							// next, we'll store the sphere;
	for(j=0; j< sphVerts.length; i++, j++) {// don't initialize i -- reuse it!
		colorShapes[i] = sphVerts[j];
		if((i % 7 == 4))
			colorShapes[i];
		}
		tor1Start = i;						// next, we'll store the torus;
	for(j=0; j< torVerts1.length; i++, j++) {
		colorShapes[i] = torVerts1[j];
		}
	tor2Start = i;
	for(j=0; j< torVerts2.length; i++, j++) {
	colorShapes[i] = torVerts2[j];
		}
	dmdStart = i;

	for(j=0; j< dmdVerts.length; i++, j++) {
	colorShapes[i] = dmdVerts[j];
		}
		dmddStart = i;
		for(j=0; j< dmdVerts.length; i++, j++) {
	colorShapes[i] = dmddVerts[j];
		}
  // Create a buffer object on the graphics hardware:
  var shapeBufferHandle = gl.createBuffer();  
  if (!shapeBufferHandle) {
    console.log('Failed to create the shape buffer object');
    return false;
  }
  eyeStart = i;							// we stored the eyeinder first.
  for(j=0; j< eyeVerts.length; i++,j++) {
  	colorShapes[i] = eyeVerts[j];
		}
	gndStart = i;							// we stored the eyeinder first.
  for(j=0; j< gndVerts.length; i++,j++) {
  	colorShapes[i] = gndVerts[j];
		}
	smtStart = i;							// we stored the eyeinder first.
  for(j=0; j< somethingVerts.length; i++,j++) {
  	colorShapes[i] = somethingVerts[j];
		}
  starStart = i;             // we stored the eyeinder first.
  for(j=0; j< starVerts.length; i++,j++) {
    colorShapes[i] = starVerts[j];
    }
  AStart = i;
  for(j=0; j< AVerts.length; i++,j++) {
    colorShapes[i] = AVerts[j];
    }




	var normal = new Float32Array(nn * 4);
	cylStart1 = 0;							// we stored the cylinder first.
  for(i=0,j=0; j< cylVerts.length/7*4; i++,j++) {
  	if(j % 4 == 3 || j % 4 == 0) normal[i] = 0;
    else normal[i] = 1.0;  	
		}
	sphStart1 = i;							// next, we'll store the sphere;
	for(j=0; j< sphVerts.length/7*4; i++, j++) {// don't initialize i -- reuse it!
		if(j % 4 == 3 || j % 4 == 0) normal[i] = 0;
    else normal[i] = 1.0;	
		}
		tor1Start1 = i;						// next, we'll store the torus;
	for(j=0; j< torVerts1.length/7*4; i++, j++) {
		if(j % 4 == 3 || j % 4 == 0) normal[i] = 0;
    else normal[i] = 1.0;		
		}
	tor2Start1 = i;
	for(j=0; j< torVerts2.length/7*4; i++, j++) {
  	if(j % 4 == 3 || j % 4 == 0) normal[i] = 0;
    else normal[i] = 1.0;	
		}
	dmdStart1 = i;

	for(j=0; j< dmdVerts.length/7*4; i++, j++) {
  	if(j % 4 == 3 || j % 4 == 0) normal[i] = 0;
    else normal[i] = 1.0;	
		}
		dmddStart1 = i;
		for(j=0; j< dmdVerts.length/7*4; i++, j++) {
  	if(j % 4 == 3 || j % 4 == 0) normal[i] = 0;
    else normal[i] = 1.0;	
		}
  eyeStart1 = i;							// we stored the eyeinder first.
  for(j=0; j< eyeVerts.length/7*4; i++,j++) {
  	if(j % 4 == 3 || j % 4 == 0) normal[i] = 0;
    else normal[i] = 1.0;  	
		}
	gndStart1 = i;							// we stored the eyeinder first.
  for(j=0; j< gndVerts.length/7*4; i++,j++) {
  	if(j % 4 == 3 || j % 4 == 0) normal[i] = 0;
    else normal[i] = 1.0;  	
		}
	smtStart1 = i;							// we stored the eyeinder first.
  for(j=0; j< somethingVerts.length/7*4; i++,j++) {
  	normal[i] = smtnormals[j];  	
		}
  starStart1 = i;              // we stored the eyeinder first.
  for(j=0; j< starVerts.length/7*4; i++,j++) {
    if(j % 4 == 3 || j % 4 == 0) normal[i] = 0;
    else normal[i] = 1.0;    
  }
  for(j=0; j< AVerts.length/7*4; i++,j++) {
    if(j % 4 == 3 || j % 4 == 0) normal[i] = 0;
    else normal[i] = 1.0;    
  }

  // Bind the the buffer object to target:
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeBufferHandle);
  // Transfer data from Javascript array colorShapes to Graphics system VBO
  // (Use sparingly--may be slow if you transfer large shapes stored in files)
  gl.bufferData(gl.ARRAY_BUFFER, colorShapes, gl.STATIC_DRAW);

    
  //Get graphics system's handle for our Vertex Shader's position-input variable: 
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  var FSIZE = colorShapes.BYTES_PER_ELEMENT; // how many bytes per stored value?

  // Use handle to specify how to retrieve **POSITION** data from our VBO:
  gl.vertexAttribPointer(
  		a_Position, 	// choose Vertex Shader attribute to fill with data
  		4, 						// how many values? 1,2,3 or 4.  (we're using x,y,z,w)
  		gl.FLOAT, 		// data type for each value: usually gl.FLOAT
  		false, 				// did we supply fixed-point data AND it needs normalizing?
  		FSIZE * floatsPerVertex, // Stride -- how many bytes used to store each vertex?
  									// (x,y,z,w, r,g,b) * bytes/value
  		0);						// Offset -- now many bytes from START of buffer to the
  									// value we will actually use?
  gl.enableVertexAttribArray(a_Position);  
  									// Enable assignment of vertex buffer object's position data

  // Get graphics system's handle for our Vertex Shader's color-input variable;
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }

  // Use handle to specify how to retrieve **COLOR** data from our VBO:
  gl.vertexAttribPointer(
  	a_Color, 				// choose Vertex Shader attribute to fill with data
  	3, 							// how many values? 1,2,3 or 4. (we're using R,G,B)
  	gl.FLOAT, 			// data type for each value: usually gl.FLOAT
  	false, 					// did we supply fixed-point data AND it needs normalizing?
  	FSIZE * 7, 			// Stride -- how many bytes used to store each vertex?
  									// (x,y,z,w, r,g,b) * bytes/value
  	FSIZE * 4);			// Offset -- how many bytes from START of buffer to the
  									// value we will actually use?  Need to skip over x,y,z,w
  									
  gl.enableVertexAttribArray(a_Color);  
  									// Enable assignment of vertex buffer object's position data
  
  if (!initArrayBuffer(gl, 'a_Normals', normal, 4, gl.FLOAT)) return -1;
  
	//--------------------------------DONE!
  // Unbind the buffer object 
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return nn;
}
function makeA () {
  AVerts = new Float32Array([
     0.8,0.0,0.0,1.0,   1, 1, 0,  // Node 0
     0.0,1.0,0.0,1.0,     1, 0, 0,  // Node 1
     1.0,0.0,0.0,1.0,     1.0, 1, 0,

     0.8,0.0,0.0,1.0,   1.0, 1.0, 0.0,  // Node 0
     0.0,0.8,0.0,1.0,     1, 0.0, 1.0,  // Node 1
     0.0,1.0,0.0,1.0,     1.0, 0, 0.0,

     -0.8,0.0,0.0,1.0,    0.0, 1.0, 1.0,  // Node 0
     -0.0,1.0,0.0,1.0,    0, 0.0, 0.0,  // Node 1
     -1.0,0.0,0.0,1.0,    1.0, 0, 0.0,

     -0.8,0.0,0.0,1.0,    0.0, 1.0, 1.0,  // Node 0
     -0.0,0.8,0.0,1.0,    0.0, 0.0, 1.0,  // Node 1
     -0.0,1.0,0.0,1.0,    1.0, 0.0, 0.0,
///
     0.3,0.5,0.0,1.0,   1.0, 0.0, 1.0,  // Node 0
     0.5,0.3,0.0,1.0,     1.0, 0.0, 1.0,  // Node 1
     -0.3,0.5,0.0,1.0,    1.0, 0.0, 0.0,

     -0.5,0.3,0.0,1.0,    0.0, 1.0, 1.0,  // Node 0
     0.5,0.3,0.0,1.0,     0.0, 0.0, 1.0,  // Node 1
     -0.3,0.5,0.0,1.0,    1.0, 0.0, 0.0,



     0.8,0.0,0.2,1.0,   0.0, 1.0, 1.0,  // Node 0
     0.0,1.0,0.2,1.0,     0.0, 0.0, 1.0,  // Node 1
     1.0,0.0,0.2,1.0,     1.0, 0.0, 0.0,

     0.8,0.0,0.2,1.0,   1.0, 1.0, 0.0,  // Node 0
     0.0,0.8,0.2,1.0,     0.0, 0.0, 1.0,  // Node 1
     0.0,1.0,0.2,1.0,     1.0, 0.0, 0.0,

     -0.8,0.0,0.2,1.0,    0.0, 1.0, 1.0,  // Node 0
     -0.0,1.0,0.2,1.0,    0.0, 0.0, 1.0,  // Node 1
     -1.0,0.0,0.2,1.0,    1.0, 0.0, 0.0,

     -0.8,0.0,0.2,1.0,    1.0, 0.0, 1.0,  // Node 0
     -0.0,0.8,0.2,1.0,    0.0, 0.0, 1.0,  // Node 1
     -0.0,1.0,0.2,1.0,    1.0, 0.0, 0.0,

     0.3,0.5,0.2,1.0,   1.0, 1.0, 0.0,  // Node 0
     0.5,0.3,0.2,1.0,     0.0, 0.0, 1.0,  // Node 1
     -0.3,0.5,0.2,1.0,    1.0, 0.0, 0.0,

     -0.5,0.3,0.2,1.0,    1.0, 0.0, 1.0,  // Node 0
     0.5,0.3,0.2,1.0,     0.0, 0.0, 1.0,  // Node 1
     -0.3,0.5,0.2,1.0,    1.0, 0.0, 0.0,

     //0.5,0.5,0.2,1.0,   1.0, 1.0, 1.0,  // Node 0
     //0.7,0.7,0.2,1.0,     0.0, 0.0, 1.0,  // Node 1
     //-0.5,0.5,0.2,1.0,    1.0, 0.0, 0.0,

     ///
     1.0,0.0,0.0,1.0,   1.0, 1.0, 0.0,  // Node 0
     1.0,0.0,0.2,1.0,     0.0, 0.0, 1.0,  // Node 1
     0.0,1.0,0.0,1.0,     1.0, 0.0, 0.0,

     0.0,1.0,0.0,1.0,   1.0, 1.0, 0.0,  // Node 0
     1.0,0.0,0.2,1.0,     0.0, 0.0, 1.0,  // Node 1
     0.0,1.0,0.2,1.0,     1.0, 0.0, 0.0,

     0.3,0.5,0.0,1.0,   1.0, 0.0, 1.0,  // Node 0
     0.3,0.5,0.2,1.0,     0.0, 0.0, 1.0,  // Node 1
     0.0,0.8,0.0,1.0,     1.0, 0.0, 0.0,

     0.0,0.8,0.2,1.0,   0.0, 1.0, 1.0,  // Node 0
     0.3,0.5,0.2,1.0,     0.0, 0.0, 1.0,  // Node 1
     0.0,0.8,0.0,1.0,     1.0, 0.0, 0.0,

     0.8,0.0,0.0,1.0,   0.0, 1.0, 1.0,  // Node 0
     0.8,0.0,0.2,1.0,     0.0, 0.0, 1.0,  // Node 1
     0.5,0.3,0.0,1.0,     1.0, 0.0, 0.0,

     0.5,0.3,0.2,1.0,   1.0, 1.0, 0.0,  // Node 0
     0.8,0.0,0.2,1.0,     0.0, 0.0, 1.0,  // Node 1
     0.5,0.3,0.0,1.0,     1.0, 0.0, 0.0,  

     0.8,0.0,0.0,1.0,   1.0, 1.0, 0.0,  // Node 0
     1.0,0.0,0.0,1.0,     0.0, 0.0, 1.0,  // Node 1
     0.8,0.0,0.2,1.0,     1.0, 0.0, 0.0,  

     0.8,0.0,0.2,1.0,   1.0, 1.0, 0.0,  // Node 0
     1.0,0.0,0.0,1.0,     0.0, 0.0, 1.0,  // Node 1
     1.0,0.0,0.2,1.0,     1.0, 0.0, 0.0, 
     ///


     -1.0,0.0,0.0,1.0,    1.0, 1.0, 0.0,  // Node 0
     -1.0,0.0,0.2,1.0,    0.0, 0.0, 1.0,  // Node 1
     0.0,1.0,0.0,1.0,     1.0, 0.0, 0.0,

     0.0,1.0,0.0,1.0,   1.0, 0.0, 1.0,  // Node 0
     -1.0,0.0,0.2,1.0,    0.0, 0.0, 1.0,  // Node 1
     0.0,1.0,0.2,1.0,     1.0, 0.0, 0.0,

     -0.3,0.5,0.0,1.0,    0.0, 1.0, 1.0,  // Node 0
     -0.3,0.5,0.2,1.0,    0.0, 0.0, 1.0,  // Node 1
     0.0,0.8,0.0,1.0,     1.0, 0.0, 0.0,

     0.0,0.8,0.2,1.0,   1.0, 0.0, 1.0,  // Node 0
     -0.3,0.5,0.2,1.0,    0.0, 0.0, 1.0,  // Node 1
     0.0,0.8,0.0,1.0,     1.0, 0.0, 0.0,

     -0.8,0.0,0.0,1.0,    0.0, 1.0, 1.0,  // Node 0
     -0.8,0.0,0.2,1.0,    0.0, 0.0, 1.0,  // Node 1
     -0.5,0.3,0.0,1.0,      1.0, 0.0, 0.0,

     -0.5,0.3,0.2,1.0,    1.0, 1.0, 0.0,  // Node 0
     -0.8,0.0,0.2,1.0,    0.0, 0.0, 1.0,  // Node 1
     -0.5,0.3,0.0,1.0,      1.0, 0.0, 0.0,  

     -0.8,0.0,0.0,1.0,    0.0, 1.0, 1.0,  // Node 0
     -1.0,0.0,0.0,1.0,    0.0, 0.0, 1.0,  // Node 1
     -0.8,0.0,0.2,1.0,      1.0, 0.0, 0.0,  

     -0.8,0.0,0.2,1.0,    0.0, 1.0, 1.0,  // Node 0
     -1.0,0.0,0.0,1.0,    0.0, 0.0, 1.0,  // Node 1
     -1.0,0.0,0.2,1.0,      1.0, 0.0, 0.0, 

     ///
     0.3,0.5,0.0,1.0,   1.0, 1.0, 0.0,  // Node 0
     0.3,0.5,0.2,1.0,     0.0, 0.0, 1.0,  // Node 1
     -0.3,0.5,0.0,1.0,    1.0, 0.0, 0.0,

     -0.3,0.5,0.2,1.0,    1.0, 1.0, 0.0,  // Node 0
     0.3,0.5,0.2,1.0,     0.0, 0.0, 1.0,  // Node 1
     -0.3,0.5,0.0,1.0,    1.0, 0.0, 0.0,

     0.5,0.3,0.0,1.0,   0.0, 1.0, 1.0,  // Node 0
     0.5,0.3,0.2,1.0,     0.0, 0.0, 1.0,  // Node 1
     -0.5,0.3,0.0,1.0,    1.0, 0.0, 0.0,

     -0.5,0.3,0.2,1.0,    1.0, 0.0, 1.0,  // Node 0
     0.5,0.3,0.2,1.0,     0.0, 0.0, 1.0,  // Node 1
     -0.5,0.3,0.0,1.0,    1.0, 0.0, 0.0]);
}
function makeStar () {
  //———Star (vertices)
    starVerts = new Float32Array([
    +0.0, +1.0, +1.0, +1.0, +1.0, +0.0, +1.0,
    +0.4, +0.0, +1.0, +1.0, +1.0, +0.0, +1.0,
    +1.5, +0.0, +1.0, +1.0, +1.0, +0.0, +1.0,
    +0.8, -0.8, +1.0, +1.0, +0.0, +1.0, +1.0,
    +1.0, -1.8, +1.0, +1.0, +0.0, +1.0, +1.0,
    +0.0, -1.0, +1.0, +1.0, +0.0, +1.0, +1.0,
    -1.0, -1.8, +1.0, +1.0, +1.0, +1.0, +0.0,
    -0.8, -0.8, +1.0, +1.0, +1.0, +1.0, +0.0,
    -1.5, +0.0, +1.0, +1.0, +1.0, +1.0, +0.0,
    -0.4, +0.0, +1.0, +1.0, +1.0, +0.0, +1.0,

    +0.0, +1.0, -1.0, +1.0, +1.0, +0.0, +1.0,
    +0.4, +0.0, -1.0, +1.0, +1.0, +0.0, +1.0,
    +1.5, +0.0, -1.0, +1.0, +1.0, +0.0, +1.0,
    +0.8, -0.8, -1.0, +1.0, +0.0, +1.0, +1.0,
    +1.0, -1.8, -1.0, +1.0, +0.0, +1.0, +1.0,
    +0.0, -1.0, -1.0, +1.0, +0.0, +1.0, +1.0,
    -1.0, -1.8, -1.0, +1.0, +1.0, +1.0, +0.0,
    -0.8, -0.8, -1.0, +1.0, +1.0, +1.0, +0.0,
    -1.5, +0.0, -1.0, +1.0, +1.0, +1.0, +0.0,
    -0.4, +0.0, -1.0, +1.0, +1.0, +1.0, +0.0,

    +0.0, +1.0, +1.0, +1.0, +1.0, +0.0, +1.0,
    +0.0, +1.0, -1.0, +1.0, +1.0, +0.0, +1.0,
    +0.4, +0.0, +1.0, +1.0, +1.0, +0.0, +1.0,
    +0.4, +0.0, -1.0, +1.0, +1.0, +0.0, +1.0,
    +1.5, +0.0, +1.0, +1.0, +1.0, +0.0, +1.0,
    +1.5, +0.0, -1.0, +1.0, +1.0, +0.0, +1.0,
    +0.8, -0.8, +1.0, +1.0, +1.0, +0.0, +1.0,
    +0.8, -0.8, -1.0, +1.0, +1.0, +1.0, +0.0,
    +1.0, -1.8, +1.0, +1.0, +1.0, +1.0, +0.0,
    +1.0, -1.8, -1.0, +1.0, +1.0, +1.0, +0.0,
    +0.0, -1.0, +1.0, +1.0, +1.0, +1.0, +0.0,
    +0.0, -1.0, -1.0, +1.0, +1.0, +1.0, +0.0,
    -1.0, -1.8, +1.0, +1.0, +1.0, +1.0, +0.0,
    -1.0, -1.8, -1.0, +1.0, +1.0, +1.0, +0.0,    
    -0.8, -0.8, +1.0, +1.0, +0.0, +1.0, +1.0,
    -0.8, -0.8, -1.0, +1.0, +0.0, +1.0, +1.0,    
    -1.5, +0.0, +1.0, +1.0, +0.0, +1.0, +1.0,
    -1.5, +0.0, -1.0, +1.0, +0.0, +1.0, +1.0,    
    -0.4, +0.0, +1.0, +1.0, +0.0, +1.0, +1.0,  
    -0.4, +0.0, -1.0, +1.0, +0.0, +1.0, +1.0,  
    +0.0, +1.0, +1.0, +1.0, +0.0, +1.0, +1.0,
    +0.0, +1.0, -1.0, +1.0, +1.0, +1.0, +0.0]);
}
function makeSomething () {
	var c30 = Math.sqrt(0.75);					// == cos(30deg) == sqrt(3) / 2
	var sq2	= Math.sqrt(2.0);						 

  somethingVerts = new Float32Array([
  // Vertex coordinates(x,y,z,w) and color (R,G,B) for a new color tetrahedron:
	//		Apex on +z axis; equilateral triangle base at z=0
/*	Nodes:
		 0.0,	 0.0, sq2, 1.0,			0.0, 	0.0,	1.0,	// Node 0 (apex, +z axis;  blue)
     c30, -0.5, 0.0, 1.0, 		1.0,  0.0,  0.0, 	// Node 1 (base: lower rt; red)
     0.0,  1.0, 0.0, 1.0,  		0.0,  1.0,  0.0,	// Node 2 (base: +y axis;  grn)
    -c30, -0.5, 0.0, 1.0, 		1.0,  1.0,  1.0, 	// Node 3 (base:lower lft; white)
*/
			// Face 0: (left side)  
     0.0,	 0.0, sq2, 1.0,		0.0, 	0.0,	1.0,	// Node 0 (apex, +z axis;  blue)
     c30, -0.5, 0.0, 1.0, 		1.0,  0.0,  0.0, 	// Node 1 (base: lower rt; red)
     0.0,  1.0, 0.0, 1.0,  		0.0,  1.0,  0.0,	// Node 2 (base: +y axis;  grn)
			// Face 1: (right side)
		 0.0,	 0.0, sq2, 1.0,			0.0, 	0.0,	1.0,	// Node 0 (apex, +z axis;  blue)
     0.0,  1.0, 0.0, 1.0,  		0.0,  1.0,  0.0,	// Node 2 (base: +y axis;  grn)
    -c30, -0.5, 0.0, 1.0, 		1.0,  1.0,  1.0, 	// Node 3 (base:lower lft; white)
    	// Face 2: (lower side)
		 0.0,	 0.0, sq2, 1.0,			0.0, 	0.0,	1.0,	// Node 0 (apex, +z axis;  blue) 
    -c30, -0.5, 0.0, 1.0, 		1.0,  1.0,  1.0, 	// Node 3 (base:lower lft; white)
     c30, -0.5, 0.0, 1.0, 		1.0,  0.0,  0.0, 	// Node 1 (base: lower rt; red) 
     	// Face 3: (base side)  
    -c30, -0.5, 0.0, 1.0, 		1.0,  1.0,  1.0, 	// Node 3 (base:lower lft; white)
     0.0,  1.0, 0.0, 1.0,  		0.0,  1.0,  0.0,	// Node 2 (base: +y axis;  grn)
     c30, -0.5, 0.0, 1.0, 		1.0,  0.0,  0.0, 	// Node 1 (base: lower rt; red)
     
     	// Drawing Axes: Draw them using gl.LINES drawing primitive;
     	// +x axis RED; +y axis GREEN; +z axis BLUE; origin: GRAY
		 0.0,  0.0,  0.0, 1.0,		0.3,  0.3,  0.3,	// X axis line (origin: gray)
		 1.3,  0.0,  0.0, 1.0,		1.0,  0.0,  0.0,	// 						 (endpoint: red)
		 
		 0.0,  0.0,  0.0, 1.0,    0.3,  0.3,  0.3,	// Y axis line (origin: white)
		 0.0,  1.3,  0.0, 1.0,		0.0,  1.0,  0.0,	//						 (endpoint: green)

		 0.0,  0.0,  0.0, 1.0,		0.3,  0.3,  0.3,	// Z axis line (origin:white)
		 0.0,  0.0,  1.3, 1.0,		0.0,  0.0,  1.0,	//						 (endpoint: blue)
  ]);
}
function makeGroundGrid() {
//==============================================================================
// Create a list of vertices that create a large grid of lines in the x,y plane
// centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.

	var xcount = 100;			// # of lines to draw in x,y to make the grid.
	var ycount = 100;		
	var xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.
 	var xColr = new Float32Array([1.0, 1.0, 0.3]);	// bright yellow
 	var yColr = new Float32Array([0.8, 1.0, 0.5]);	// bright green.
 	
	// Create an (global) array to hold this ground-plane's vertices:
	gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
						// draw a grid made of xcount+ycount lines; 2 vertices per line.
						
	var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
	var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))
	
	// First, step thru x values as we make vertical lines of constant-x:
	for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
		if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
			gndVerts[j  ] = -xymax + (v  )*xgap;	// x
			gndVerts[j+1] = -xymax;								// y
			gndVerts[j+2] = 0.0;
			gndVerts[j+3] = 1.0;									// z
		}
		else {				// put odd-numbered vertices at (xnow, +xymax, 0).
			gndVerts[j  ] = -xymax + (v-1)*xgap;	// x
			gndVerts[j+1] = xymax;								// y
			gndVerts[j+2] = 0.0;
			gndVerts[j+3] = 1.0;									// z
		}
		gndVerts[j+4] = xColr[0];			// red
		gndVerts[j+5] = xColr[1];			// grn
		gndVerts[j+6] = xColr[2];			// blu
	}
	// Second, step thru y values as wqe make horizontal lines of constant-y:
	// (don't re-initialize j--we're adding more vertices to the array)
	for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
		if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
			gndVerts[j  ] = -xymax;								// x
			gndVerts[j+1] = -xymax + (v  )*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
			gndVerts[j+3] = 1.0;									// z
		}
		else {					// put odd-numbered vertices at (+xymax, ynow, 0).
			gndVerts[j  ] = xymax;								// x
			gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
			gndVerts[j+2] = 0.0;	
			gndVerts[j+3] = 1.0;									// z								// z
		}
		gndVerts[j+4] = yColr[0];			// red
		gndVerts[j+5] = yColr[1];			// grn
		gndVerts[j+6] = yColr[2];			// blu
	}
}

function makeStick() {
//==============================================================================
// Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
// 'stepped spiral' design described in notes.
// Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
//
 var ctrColr = new Float32Array([0.2, 0.2, 0.2]);	// dark gray
 var topColr = new Float32Array([0.4, 0.7, 0.4]);	// light green
 var botColr = new Float32Array([0.5, 0.5, 1.0]);	// light blue
 var capVerts = 16;	// # of vertices around the topmost 'cap' of the shape
 var botRadius = 1.0;		// radius of bottom of cylinder (top always 1.0)
 var height = 10;
 // Create a (global) array to hold this cylinder's vertices;
 cylVerts = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them. 

	// Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
	// v counts vertices: j counts array elements (vertices * elements per vertex)
	for(v=1,j=0; v<2*capVerts; v++,j+=floatsPerVertex) {	
		// skip the first vertex--not needed.
		if(v%2==0)
		{				// put even# vertices at center of cylinder's top cap:
			cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
			cylVerts[j+1] = 0.0;	
			cylVerts[j+2] = height; 
			cylVerts[j+3] = 1.0;			// r,g,b = topColr[]
			cylVerts[j+4]=ctrColr[0]; 
			cylVerts[j+5]=ctrColr[1]; 
			cylVerts[j+6]=ctrColr[2];
		}
		else { 	// put odd# vertices around the top cap's outer edge;
						// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
						// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
			cylVerts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);			// x
			cylVerts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);			// y
			//	(Why not 2*PI? because 0 < =v < 2*capVerts, so we
			//	 can simplify cos(2*PI * (v-1)/(2*capVerts))
			cylVerts[j+2] = height;	// z
			cylVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			cylVerts[j+4]=topColr[0]; 
			cylVerts[j+5]=topColr[1]; 
			cylVerts[j+6]=topColr[2];			
		}
	}
	// Create the cylinder side walls, made of 2*capVerts vertices.
	// v counts vertices within the wall; j continues to count array elements
	for(v=0; v< 2*capVerts; v++, j+=floatsPerVertex) {
		if(v%2==0)	// position all even# vertices along top cap:
		{		
				cylVerts[j  ] = Math.cos(Math.PI*(v)/capVerts);		// x
				cylVerts[j+1] = Math.sin(Math.PI*(v)/capVerts);		// y
				cylVerts[j+2] = height;	// z
				cylVerts[j+3] = 1.0;	// w.
				// r,g,b = topColr[]
				cylVerts[j+4]=.8; 
				cylVerts[j+5]=0; 
				cylVerts[j+6]=1;			
		}
		else		// position all odd# vertices along the bottom cap:
		{
				cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
				cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
				cylVerts[j+2] =-height;	// z
				cylVerts[j+3] = 1.0;	// w.
				// r,g,b = topColr[]
				cylVerts[j+4]=1; 
				cylVerts[j+5]=0; 
				cylVerts[j+6]=0;			
		}
	}
	// Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
	// v counts the vertices in the cap; j continues to count array elements
	for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
		if(v%2==0) {	// position even #'d vertices around bot cap's outer edge
			cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);		// x
			cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);		// y
			cylVerts[j+2] =-height;	// z
			cylVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			cylVerts[j+4]=botColr[0]; 
			cylVerts[j+5]=botColr[1]; 
			cylVerts[j+6]=botColr[2];		
		}
		else {				// position odd#'d vertices at center of the bottom cap:
			cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
			cylVerts[j+1] = 0.0;	
			cylVerts[j+2] =-height; 
			cylVerts[j+3] = 1.0;			// r,g,b = botColr[]
			cylVerts[j+4]=1; 
			cylVerts[j+5]=0; 
			cylVerts[j+6]=0;
		}
	}
}

function makeDiamond() {
//==============================================================================
// Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
// 'stepped spiral' design described in notes.
// Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
//
 var ctrColr = new Float32Array([0.2, 0.2, 0.2]);	// dark gray
 var topColr = new Float32Array([0.4, 0.4, 0.4]);	// light green
 var botColr = new Float32Array([0.5, 0.5, 0.5]);	// light blue
 var capVerts = 6;	// # of vertices around the topmost 'cap' of the shape
 var botRadius = 0;		// radius of bottom of cylinder (top always 1.0)
 var height = .8;
 // Create a (global) array to hold this cylinder's vertices;
 dmdVerts = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them. 

	// Create circle-shaped top cap of dmdinder at z=+1.0, radius 1.0
	// v counts vertices: j counts array elements (vertices * elements per vertex)
	for(v=1,j=0; v<2*capVerts; v++,j+=floatsPerVertex) {	
		// skip the first vertex--not needed.
		if(v%2==0)
		{				// put even# vertices at center of dmdinder's top cap:
			dmdVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
			dmdVerts[j+1] = 0.0;	
			dmdVerts[j+2] = height; 
			dmdVerts[j+3] = 1.0;			// r,g,b = topColr[]
			dmdVerts[j+4]=ctrColr[0]; 
			dmdVerts[j+5]=ctrColr[1]; 
			dmdVerts[j+6]=ctrColr[2];
		}
		else { 	// put odd# vertices around the top cap's outer edge;
						// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
						// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
			dmdVerts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);			// x
			dmdVerts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);			// y
			//	(Why not 2*PI? because 0 < =v < 2*capVerts, so we
			//	 can simplify cos(2*PI * (v-1)/(2*capVerts))
			dmdVerts[j+2] = height;	// z
			dmdVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			dmdVerts[j+4]=topColr[0]; 
			dmdVerts[j+5]=topColr[1]; 
			dmdVerts[j+6]=topColr[2];			
		}
	}
	// Create the dmdinder side walls, made of 2*capVerts vertices.
	// v counts vertices within the wall; j continues to count array elements
	for(v=0; v< 2*capVerts; v++, j+=floatsPerVertex) {
		if(v%2==0)	// position all even# vertices along top cap:
		{		
				dmdVerts[j  ] = Math.cos(Math.PI*(v)/capVerts);		// x
				dmdVerts[j+1] = Math.sin(Math.PI*(v)/capVerts);		// y
				dmdVerts[j+2] = height;	// z
				dmdVerts[j+3] = 1.0;	// w.
				// r,g,b = topColr[]
				dmdVerts[j+4]=.1 * v / 1.6 / 5 + 0.3 ; 
				dmdVerts[j+5]=.1 * v / 1.6 / 5 + 0.3 ; 
				dmdVerts[j+6]=.1 * v / 1.6 / 5 + 0.3 ;			
		}
		else		// position all odd# vertices along the bottom cap:
		{
				dmdVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
				dmdVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
				dmdVerts[j+2] =-height;	// z
				dmdVerts[j+3] = 1.0;	// w.
				// r,g,b = topColr[]
				dmdVerts[j+4]=.8; 
				dmdVerts[j+5]=.8; 
				dmdVerts[j+6]=.8;			
		}
	}
	// Create the dmdinder bottom cap, made of 2*capVerts -1 vertices.
	// v counts the vertices in the cap; j continues to count array elements
	for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
		if(v%2==0) {	// position even #'d vertices around bot cap's outer edge
			dmdVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);		// x
			dmdVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);		// y
			dmdVerts[j+2] =-height;	// z
			dmdVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			dmdVerts[j+4]=.3; 
			dmdVerts[j+5]=.3; 
			dmdVerts[j+6]=.3;		
		}
		else {				// position odd#'d vertices at center of the bottom cap:
			dmdVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
			dmdVerts[j+1] = 0.0;	
			dmdVerts[j+2] =-height; 
			dmdVerts[j+3] = 1.0;			// r,g,b = botColr[]
			dmdVerts[j+4]=.3; 
			dmdVerts[j+5]=.3; 
			dmdVerts[j+6]=.3;
		}
	}
}

function makeDiamondd() {
//==============================================================================
// Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
// 'stepped spiral' design described in notes.
// Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
//
 var ctrColr = new Float32Array([0.2, 0.9, 0.9]);	// dark gray
 var topColr = new Float32Array([0.0, 0.0, 0.8]);	// light green
 var botColr = new Float32Array([0.0, 0.6, 0.6]);	// light blue
 var capVerts = 6;	// # of vertices around the topmost 'cap' of the shape
 var botRadius = .3;		// radius of bottom of cylinder (top always 1.0)
 var height = .3;
 // Create a (global) array to hold this cylinder's vertices;
 dmddVerts = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them. 

	// Create circle-shaped top cap of dmdinder at z=+1.0, radius 1.0
	// v counts vertices: j counts array elements (vertices * elements per vertex)
	for(v=1,j=0; v<2*capVerts; v++,j+=floatsPerVertex) {	
		// skip the first vertex--not needed.
		if(v%2==0)
		{				// put even# vertices at center of dmdinder's top cap:
			dmddVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
			dmddVerts[j+1] = 0.0;	
			dmddVerts[j+2] = height; 
			dmddVerts[j+3] = 1.0;			// r,g,b = topColr[]
			dmddVerts[j+4]=ctrColr[0]; 
			dmddVerts[j+5]=ctrColr[1]; 
			dmddVerts[j+6]=ctrColr[2];
		}
		else { 	// put odd# vertices around the top cap's outer edge;
						// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
						// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
			dmddVerts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);			// x
			dmddVerts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);			// y
			//	(Why not 2*PI? because 0 < =v < 2*capVerts, so we
			//	 can simplify cos(2*PI * (v-1)/(2*capVerts))
			dmddVerts[j+2] = height;	// z
			dmddVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			dmddVerts[j+4]=topColr[0]; 
			dmddVerts[j+5]=topColr[1]; 
			dmddVerts[j+6]=topColr[2];			
		}
	}
	// Create the dmdinder side walls, made of 2*capVerts vertices.
	// v counts vertices within the wall; j continues to count array elements
	for(v=0; v< 2*capVerts; v++, j+=floatsPerVertex) {
		if(v%2==0)	// position all even# vertices along top cap:
		{		
				dmddVerts[j  ] = Math.cos(Math.PI*(v)/capVerts);		// x
				dmddVerts[j+1] = Math.sin(Math.PI*(v)/capVerts);		// y
				dmddVerts[j+2] = height;	// z
				dmddVerts[j+3] = 1.0;	// w.
				// r,g,b = topColr[]
				dmddVerts[j+4]=v / capVerts / 2; 
				dmddVerts[j+5]=v / capVerts / 2; 
				dmddVerts[j+6]=1;			
		}
		else		// position all odd# vertices along the bottom cap:
		{
				dmddVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
				dmddVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
				dmddVerts[j+2] =-height;	// z
				dmddVerts[j+3] = 1.0;	// w.
				// r,g,b = topColr[]
				dmddVerts[j+4]=1; 
        dmddVerts[j+5]=1; 
        dmddVerts[j+6]=0;			
		}
	}
	// Create the dmdinder bottom cap, made of 2*capVerts -1 vertices.
	// v counts the vertices in the cap; j continues to count array elements
	for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
		if(v%2==0) {	// position even #'d vertices around bot cap's outer edge
			dmddVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);		// x
			dmddVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);		// y
			dmddVerts[j+2] =-height;	// z
			dmddVerts[j+3] = 1.0;	// w.
			// r,g,b = topColr[]
			dmddVerts[j+4]=.2; 
      dmddVerts[j+5]=.2; 
      dmddVerts[j+6]=1 - j / capVerts;		
		}
		else {				// position odd#'d vertices at center of the bottom cap:
			dmddVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
			dmddVerts[j+1] = 0.0;	
			dmddVerts[j+2] =-height; 
			dmddVerts[j+3] = 1.0;			// r,g,b = botColr[]
			dmddVerts[j+4]=.8; 
			dmddVerts[j+5]=.8; 
			dmddVerts[j+6]=1 - j / capVerts;
		}
	}
}

function makeHead() {
//==============================================================================
// Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
// equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
// and connect them as a 'stepped spiral' design (see makeStick) to build the
// sphere from one triangle strip.
  var slices = 50;		// # of slices of the sphere along the z axis. >=3 req'd
											// (choose odd # or prime# to avoid accidental symmetry)
  var sliceVerts	= 50;	// # of vertices around the top edge of the slice
											// (same number of vertices on bottom of slice, too)
  var topColr = new Float32Array([1.0, 0.0, 0.0]);	// North Pole: light gray
  var equColr = new Float32Array([0.3, 0.0, 0.0]);	// Equator:    bright green
  var botColr = new Float32Array([0.9, 0.0, 0.0]);	// South Pole: brightest gray.
  var sliceAngle = Math.PI/slices;	// lattitude angle spanned by one slice.

	// Create a (global) array to hold this sphere's vertices:
  sphVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them. 
										// each slice requires 2*sliceVerts vertices except 1st and
										// last ones, which require only 2*sliceVerts-1.
										
	// Create dome-shaped top slice of sphere at z=+1
	// s counts slices; v counts vertices; 
	// j counts array elements (vertices * elements per vertex)
	var cos0 = 0.0;					// sines,cosines of slice's top, bottom edge.
	var sin0 = 0.0;
	var cos1 = 0.0;
	var sin1 = 0.0;	
	var j = 0;							// initialize our array index
	var isLast = 0;
	var isFirst = 1;
	for(s=0; s<slices; s++) {	// for each slice of the sphere,
		// find sines & cosines for top and bottom of this slice
		if(s==0) {
			isFirst = 1;	// skip 1st vertex of 1st slice.
			cos0 = 1.0; 	// initialize: start at north pole.
			sin0 = 0.0;
		}
		else {					// otherwise, new top edge == old bottom edge
			isFirst = 0;	
			cos0 = cos1;
			sin0 = sin1;
		}								// & compute sine,cosine for new bottom edge.
		cos1 = Math.cos((s+1)*sliceAngle);
		sin1 = Math.sin((s+1)*sliceAngle);
		// go around the entire slice, generating TRIANGLE_STRIP verts
		// (Note we don't initialize j; grows with each new attrib,vertex, and slice)
		if(s==slices-1) isLast=1;	// skip last vertex of last slice.
		for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) {	
			if(v%2==0)
			{				// put even# vertices at the the slice's top edge
							// (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
							// and thus we can simplify cos(2*PI(v/2*sliceVerts))  
				sphVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts); 	
				sphVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);	
				sphVerts[j+2] = cos0;		
				sphVerts[j+3] = 1.0;			
			}
			else { 	// put odd# vertices around the slice's lower edge;
							// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
							// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
				sphVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);		// x
				sphVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);		// y
				sphVerts[j+2] = cos1;																				// z
				sphVerts[j+3] = 1.0;																				// w.		
			}
			if(s==0) {	// finally, set some interesting colors for vertices:
				sphVerts[j+4]=topColr[0]; 
				sphVerts[j+5]=topColr[1]; 
				sphVerts[j+6]=topColr[2];	
				}
			else if(s==slices-1) {
				sphVerts[j+4]=botColr[0]; 
				sphVerts[j+5]=botColr[1]; 
				sphVerts[j+6]=botColr[2];	
			}
			else {
					sphVerts[j+4]=.2;// equColr[0]; 
					sphVerts[j+5]=(j % 5 + 1) / 5;// equColr[1]; 
					sphVerts[j+6]=1.0;// equColr[2];					
			}
		}
	}
}
function makeEye() {
//==============================================================================
// Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like 
// equal-lattitude 'slices' of the sphere (bounded by planes of constant z), 
// and connect them as a 'stepped spiral' design (see makeStick) to build the
// sphere from one triangle strip.
  var slices = 50;		// # of slices of the sphere along the z axis. >=3 req'd
											// (choose odd # or prime# to avoid accidental symmetry)
  var sliceVerts	= 50;	// # of vertices around the top edge of the slice
											// (same number of vertices on bottom of slice, too)
  var topColr = new Float32Array([1.0, 0.0, 0.0]);	// North Pole: light gray
  var equColr = new Float32Array([0.3, 0.0, 0.0]);	// Equator:    bright green
  var botColr = new Float32Array([0.9, 0.0, 0.0]);	// South Pole: brightest gray.
  var sliceAngle = Math.PI/slices;	// lattitude angle spanned by one slice.

	// Create a (global) array to hold this sphere's vertices:
  eyeVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);
	
	var cos0 = 0.0;					// sines,cosines of slice's top, bottom edge.
	var sin0 = 0.0;
	var cos1 = 0.0;
	var sin1 = 0.0;	
	var j = 0;							// initialize our array index
	var isLast = 0;
	var isFirst = 1;
	for(s=0; s<slices; s++) {	// for each slice of the sphere,
		// find sines & cosines for top and bottom of this slice
		if(s==0) {
			isFirst = 1;	// skip 1st vertex of 1st slice.
			cos0 = 1.0; 	// initialize: start at north pole.
			sin0 = 0.0;
		}
		else {					// otherwise, new top edge == old bottom edge
			isFirst = 0;	
			cos0 = cos1;
			sin0 = sin1;
		}								// & compute sine,cosine for new bottom edge.
		cos1 = 0.8 * Math.cos((s+1)*sliceAngle);
		sin1 = Math.sin((s+1)*sliceAngle);
		// go around the entire slice, generating TRIANGLE_STRIP verts
		// (Note we don't initialize j; grows with each new attrib,vertex, and slice)
		if(s==slices-1) isLast=1;	// skip last vertex of last slice.
		for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) {	
			if(v%2==0)
			{				// put even# vertices at the the slice's top edge
							// (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
							// and thus we can simplify cos(2*PI(v/2*sliceVerts))  
				eyeVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts); 	
				eyeVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);	
				eyeVerts[j+2] = cos0;		
				eyeVerts[j+3] = 1.0;			
			}
			else { 	// put odd# vertices around the slice's lower edge;
							// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
							// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
				eyeVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);		// x
				eyeVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);		// y
				eyeVerts[j+2] = cos1;																				// z
				eyeVerts[j+3] = 1.0;																				// w.		
			}
			if(s==0) {	// finally, set some interesting colors for vertices:
				eyeVerts[j+4]=0; 
				eyeVerts[j+5]=0; 
				eyeVerts[j+6]=0;	
				}
			else if(s==slices-1) {
				eyeVerts[j+4]=0; 
				eyeVerts[j+5]=0; 
				eyeVerts[j+6]=0;	
			}
			else {
					eyeVerts[j+4]=0;// equColr[0]; 
					eyeVerts[j+5]=0;// equColr[1]; 
					eyeVerts[j+6]=0;// equColr[2];					
			}
		}
	}
}

function makeRing1() {
var rbend = 1.0;										// Radius of circle formed by torus' bent bar
var rbar = 0.1;											// radius of the bar we bent to form torus
var barSlices = 50;																	// more segments for more-circular torus
var barSides = 50;										// # of sides of the bar (and thus the 
																		// number of vertices in its cross-section)
torVerts1 = new Float32Array(floatsPerVertex*(2*barSides*barSlices +2));
//	Each slice requires 2*barSides vertices, but 1st slice will skip its first 
// triangle and last slice will skip its last triangle. To 'close' the torus,
// repeat the first 2 vertices at the end of the triangle-strip.  Assume 7

var phi=0, theta=0;										// begin torus at angles 0,0
var thetaStep = 2*Math.PI/barSlices;	// theta angle between each bar segment
var phiHalfStep = Math.PI/barSides;		// half-phi angle between each side of bar
																			// (WHY HALF? 2 vertices per step in phi)
	// s counts slices of the bar; v counts vertices within one slice; j counts
	// array elements (Float32) (vertices*#attribs/vertex) put in torVerts1 array.
	for(s=0,j=0; s<barSlices; s++) {		// for each 'slice' or 'ring' of the torus:
		for(v=0; v< 2*barSides; v++, j+=7) {		// for each vertex in this slice:
			if(v%2==0)	{	// even #'d vertices at bottom of slice,
				torVerts1[j  ] = (rbend + rbar*Math.cos((v)*phiHalfStep)) * 
																						 Math.cos((s)*thetaStep);
							  //	x = (rbend + rbar*cos(phi)) * cos(theta)
				torVerts1[j+1] = (rbend + rbar*Math.cos((v)*phiHalfStep)) *
																						 Math.sin((s)*thetaStep);
								//  y = (rbend + rbar*cos(phi)) * sin(theta) 
				torVerts1[j+2] = -rbar*Math.sin((v)*phiHalfStep);
								//  z = -rbar  *   sin(phi)
				torVerts1[j+3] = 1.0;		// w
			}
			else {				// odd #'d vertices at top of slice (s+1);
										// at same phi used at bottom of slice (v-1)
				torVerts1[j  ] = (rbend + rbar*Math.cos((v-1)*phiHalfStep)) * 
																						 Math.cos((s+1)*thetaStep);
							  //	x = (rbend + rbar*cos(phi)) * cos(theta)
				torVerts1[j+1] = (rbend + rbar*Math.cos((v-1)*phiHalfStep)) *
																						 Math.sin((s+1)*thetaStep);
								//  y = (rbend + rbar*cos(phi)) * sin(theta) 
				torVerts1[j+2] = -rbar*Math.sin((v-1)*phiHalfStep);
								//  z = -rbar  *   sin(phi)
				torVerts1[j+3] = 1.0;		// w
			}
			torVerts1[j+4] = s / barSlices;		// random color 0.0 <= R < 1.0
			torVerts1[j+5] = 1 - s / barSlices;		// random color 0.0 <= G < 1.0
			torVerts1[j+6] = 1 - v / 2 * barSides;		// random color 0.0 <= B < 1.0
		}
	}
	// Repeat the 1st 2 vertices of the triangle strip to complete the torus:
			torVerts1[j  ] = rbend + rbar;	// copy vertex zero;
						  //	x = (rbend + rbar*cos(phi==0)) * cos(theta==0)
			torVerts1[j+1] = 0.0;
							//  y = (rbend + rbar*cos(phi==0)) * sin(theta==0) 
			torVerts1[j+2] = 0.0;
							//  z = -rbar  *   sin(phi==0)
			torVerts1[j+3] = 1.0;		// w
			torVerts1[j+4] = 1;		// random color 0.0 <= R < 1.0
			torVerts1[j+5] = 0;		// random color 0.0 <= G < 1.0
			torVerts1[j+6] = 0;		// random color 0.0 <= B < 1.0
			j+=7; // go to next vertex:
			torVerts1[j  ] = (rbend + rbar) * Math.cos(thetaStep);
						  //	x = (rbend + rbar*cos(phi==0)) * cos(theta==thetaStep)
			torVerts1[j+1] = (rbend + rbar) * Math.sin(thetaStep);
							//  y = (rbend + rbar*cos(phi==0)) * sin(theta==thetaStep) 
			torVerts1[j+2] = 0.0;
							//  z = -rbar  *   sin(phi==0)
			torVerts1[j+3] = 1.0;		// w
			torVerts1[j+4] = 1;		// random color 0.0 <= R < 1.0
			torVerts1[j+5] = 0;		// random color 0.0 <= G < 1.0
			torVerts1[j+6] = 0;		// random color 0.0 <= B < 1.0
}

function makeRing2() {
var rbend = 1.0;										// Radius of circle formed by torus' bent bar
var rbar = 0.1;											// radius of the bar we bent to form torus
var barSlices = 50;									// # of bar-segments in the torus: >=3 req'd;
																		// more segments for more-circular torus
var barSides = 50;										// # of sides of the bar (and thus the 
																		// number of vertices in its cross-section)

	// Create a (global) array to hold this torus's vertices:
 torVerts2 = new Float32Array(floatsPerVertex*(2*barSides*barSlices +2));
//	Each slice requires 2*barSides vertices, but 1st slice will skip its first 
// triangle and last slice will skip its last triangle. To 'close' the torus,
// repeat the first 2 vertices at the end of the triangle-strip.  Assume 7

var phi=0, theta=0;										// begin torus at angles 0,0
var thetaStep = 2*Math.PI/barSlices;	// theta angle between each bar segment
var phiHalfStep = Math.PI/barSides;		// half-phi angle between each side of bar
																			// (WHY HALF? 2 vertices per step in phi)
	// s counts slices of the bar; v counts vertices within one slice; j counts
	// array elements (Float32) (vertices*#attribs/vertex) put in torVerts2 array.
	for(s=0,j=0; s<barSlices; s++) {		// for each 'slice' or 'ring' of the torus:
		for(v=0; v< 2*barSides; v++, j+=7) {		// for each vertex in this slice:
			if(v%2==0)	{	// even #'d vertices at bottom of slice,
				torVerts2[j  ] = (rbend + rbar*Math.cos((v)*phiHalfStep)) * 
																						 Math.cos((s)*thetaStep);
							  //	x = (rbend + rbar*cos(phi)) * cos(theta)
				torVerts2[j+1] = (rbend + rbar*Math.cos((v)*phiHalfStep)) *
																						 Math.sin((s)*thetaStep);
								//  y = (rbend + rbar*cos(phi)) * sin(theta) 
				torVerts2[j+2] = -rbar*Math.sin((v)*phiHalfStep);
								//  z = -rbar  *   sin(phi)
				torVerts2[j+3] = 1.0;		// w
			}
			else {				// odd #'d vertices at top of slice (s+1);
										// at same phi used at bottom of slice (v-1)
				torVerts2[j  ] = (rbend + rbar*Math.cos((v-1)*phiHalfStep)) * 
																						 Math.cos((s+1)*thetaStep);
							  //	x = (rbend + rbar*cos(phi)) * cos(theta)
				torVerts2[j+1] = (rbend + rbar*Math.cos((v-1)*phiHalfStep)) *
																						 Math.sin((s+1)*thetaStep);
								//  y = (rbend + rbar*cos(phi)) * sin(theta) 
				torVerts2[j+2] = -rbar*Math.sin((v-1)*phiHalfStep);
								//  z = -rbar  *   sin(phi)
				torVerts2[j+3] = 1.0;		// w
			}
			torVerts2[j+4] = 1;		// random color 0.0 <= R < 1.0
			torVerts2[j+5] = 0;		// random color 0.0 <= G < 1.0
			torVerts2[j+6] = 0;		// random color 0.0 <= B < 1.0
		}
	}
	// Repeat the 1st 2 vertices of the triangle strip to complete the torus:
			torVerts2[j  ] = rbend + rbar;	// copy vertex zero;
						  //	x = (rbend + rbar*cos(phi==0)) * cos(theta==0)
			torVerts2[j+1] = 0.0;
							//  y = (rbend + rbar*cos(phi==0)) * sin(theta==0) 
			torVerts2[j+2] = 0.0;
							//  z = -rbar  *   sin(phi==0)
			torVerts2[j+3] = 1.0;		// w
			torVerts2[j+4] = 1;		// random color 0.0 <= R < 1.0
			torVerts2[j+5] = 0;		// random color 0.0 <= G < 1.0
			torVerts2[j+6] = 0;		// random color 0.0 <= B < 1.0
			j+=7; // go to next vertex:
			torVerts2[j  ] = (rbend + rbar) * Math.cos(thetaStep);
						  //	x = (rbend + rbar*cos(phi==0)) * cos(theta==thetaStep)
			torVerts2[j+1] = (rbend + rbar) * Math.sin(thetaStep);
							//  y = (rbend + rbar*cos(phi==0)) * sin(theta==thetaStep) 
			torVerts2[j+2] = 0.0;
							//  z = -rbar  *   sin(phi==0)
			torVerts2[j+3] = 1.0;		// w
			torVerts2[j+4] = 1;		// random color 0.0 <= R < 1.0
			torVerts2[j+5] = 0;		// random color 0.0 <= G < 1.0
			torVerts2[j+6] = 0;		// random color 0.0 <= B < 1.0
}


var g_Angle_xchange = 0;
var g_Angle_zchange = 0;
var g_EyeX = 0.0, g_EyeY = 0.0, g_EyeZ = 5;
var sca_h = 1;
var sca_v = 1;
var o_near = 1, o_far = 1;
var jd_z = 0, jd_x = 0, jd_y = 0;
var follow = 0, fly_flag = 0;
var d_x = 0, d_y = 0, d_z = 0;

function draw(gl, n, currentAngle, 
            modelMatrix, u_ModelMatrix
						,viewMatrix, u_ViewMatrix,
    				projMatrix, u_ProjMatrix, 
    				normals, u_Normal
    				) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
  gl.viewport(0,  														
							0,                             
  						Math.min(innerHeight * 3 / 4, innerWidth/2),
  						Math.min(innerHeight * 3 / 4, innerWidth/2));
  
	var vpAspect = gl.drawingBufferWidth /
								gl.drawingBufferHeight;
  var my_near = 1, my_far = 100;
	normals.setIdentity();
  
  gl.uniformMatrix4fv(u_Normal, false, normals.elements);
  fly();
	// // Set Views memeda!
  g_EyeX -= d_x;
  g_EyeY += d_y;
  g_EyeZ -= d_z;
  viewMatrix.setLookAt(g_EyeX
                      ,g_EyeY 
                      ,g_EyeZ
									  	
                      , g_EyeX - Math.sin(jd_y) - Math.sin(speed_y) - g_Angle_xchange 
                      , g_EyeY - Math.sin(jd_x) + g_Angle_zchange
                      , g_EyeZ - Math.cos(jd_y) * Math.cos(jd_x) * Math.cos(speed_y)
									  	
                      , -Math.cos(speed_y) * jd_z / 3 * fly_flag , 1, Math.sin(speed_y) * jd_z / 3 * fly_flag);  
  if(follow){
    
    modelMatrix.setTranslate(0,0,-6);    
    modelMatrix.scale(0.2, 0.2, 0.2);
    modelMatrix.rotate(currentAngle, 0, 1, 0);
    modelMatrix.scale(1,1,-1);             
    modelMatrix.scale(0.7, 0.7, 0.7);
    modelMatrix.translate( 1,1,0);
    modelMatrix.rotate(currentAngle, 0, 0,1);
    modelMatrix.scale(0.25, 0.25, 0.25);
    modelMatrix.rotate(currentAngle, 1, 0, 0);
    modelMatrix.translate( 0, 0, 8);
    modelMatrix.translate( 2, 2, 2); 
    modelMatrix.scale(3, 3, 3);
    modelMatrix.translate( 0, 0, 2.5);
    modelMatrix.rotate(currentAngle * 2, 0, 0, 1);
    
    viewMatrix.setInverseOf(modelMatrix);

    modelMatrix.setIdentity(); 
  }


  projMatrix.setPerspective(40, vpAspect, my_near * o_near, my_far * o_far);
  
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
  
  drawScene(gl, n, currentAngle, 
            modelMatrix, u_ModelMatrix
            ,viewMatrix, u_ViewMatrix,
            projMatrix, u_ProjMatrix, 
            normals, u_Normal
            )
  
//--------------------------------------------------------------------------------------------------
 	gl.viewport(innerWidth/2, 				// viewport width, height.
  						0,															// (x,y) location(in pixels)
  						Math.min(innerHeight * 3 / 4, innerWidth/2), 				// viewport width, height.
  						Math.min(innerHeight * 3 / 4, innerWidth/2));
  
	var vpAspect = gl.drawingBufferWidth /			// On-screen aspect ratio for
								gl.drawingBufferHeight;		// this camera: width/height.


	// // Set Views memeda!
  projMatrix.setOrtho(-1 * sca_h, 1 * sca_h, -1 * sca_v, 1 * sca_v, my_near * o_near, my_far / 3 * o_far);
  
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
  drawScene(gl, n, currentAngle, 
            modelMatrix, u_ModelMatrix
            ,viewMatrix, u_ViewMatrix,
            projMatrix, u_ProjMatrix, 
            normals, u_Normal
            )
 }
function drawScene(gl, n, currentAngle, 
            modelMatrix, u_ModelMatrix
            ,viewMatrix, u_ViewMatrix,
            projMatrix, u_ProjMatrix, 
            normals, u_Normal
            ) {
  drawRabbit (gl, n, currentAngle, modelMatrix, u_ModelMatrix
              , 0,-.55,0,0)
  
  for (var i = 0; i < 2; i++) {
    drawDiamond(gl, n, currentAngle, modelMatrix, u_ModelMatrix
              ,-0.5, -0.55, +0.2 - i * 0.6);
    drawDiamond(gl, n, currentAngle, modelMatrix, u_ModelMatrix
              ,+0.5, -0.55, +0.2 - i * 0.6);
  };
  for (var i = 1; i < 6; i++) {
    drawRings(gl, n, currentAngle, modelMatrix, u_ModelMatrix
              ,0, -0.6 + i, 0, .2);
    drawRings(gl, n, currentAngle, modelMatrix, u_ModelMatrix
              ,0, -0.6 - i, 0, .2);
  };
  
  drawSpinning (gl, n, currentAngle, modelMatrix, u_ModelMatrix, u_Normal, normals
              , 0.0, +0.6, +1.0, 0.3);
  drawSomething(gl, n, currentAngle, modelMatrix, u_ModelMatrix, u_Normal, normals
              , 0.0, -0.6, +1.0);

  drawAxes (gl, n, modelMatrix, u_ModelMatrix, 0,-0.6,0.0,5);

  
  for (var i = 1; i < 6; i++) {
    drawStar (gl, n, modelMatrix, u_ModelMatrix, 0,0.6,0.0 - i,1);
    drawStar (gl, n, modelMatrix, u_ModelMatrix, 0,0.6,0.0 + i,1);
  };
  for (var i = 1; i < 6; i++) {
    drawA (gl, n, modelMatrix, u_ModelMatrix, +0.3 + i,-0.6,0.0,0.4)
    drawA (gl, n, modelMatrix, u_ModelMatrix, -0.3 - i,-0.6,0.0,0.4);
  };
  drawHeads(gl, n, currentAngle, modelMatrix, u_ModelMatrix, 0,0,-6,1);
  drawGrid(gl, n, modelMatrix, u_ModelMatrix);
  
}
function drawSpinning (gl, n, currentAngle, modelMatrix, u_ModelMatrix, u_Normal, normals
              , x,y,z,size) {
  modelMatrix.setTranslate(x,y,z);  // 'set' means DISCARD old matrix,
              // (drawing axes centered in CVV), and then make new
              // drawing axes moved to the lower-left corner of CVV. 
  modelMatrix.scale(size,size,size); 
  modelMatrix.rotate(currentAngle, 0, 1, 0);  // spin drawing axes on Y axis;

  
  normals.setInverseOf(modelMatrix);
  normals.transpose();
  
  
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.uniformMatrix4fv(u_Normal, false, normals.elements);
  
  gl.drawArrays(gl.TRIANGLES, smtStart/floatsPerVertex, // start at this vertex number, and
                12);
  normals.setIdentity();
}
function drawHeads (gl, n, currentAngle, modelMatrix, u_ModelMatrix, x,y,z,size) {
  modelMatrix.setTranslate( x,y,z); // 'set' means DISCARD old matrix,
              // (drawing axes centered in CVV), and then make new
              // drawing axes moved to the lower-left corner of CVV.
  modelMatrix.scale(size,size,size);              // convert to left-handed coord sys
                                          // to match WebGL display canvas.
  modelMatrix.scale(0.2, 0.2, 0.2);
              // Make it smaller:
  modelMatrix.rotate(currentAngle, 0, 1, 0);  // Spin on XY diagonal axis
  // Drawing:   
  // Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      // Draw just the sphere's vertices
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                tor2Start/floatsPerVertex, // start at this vertex number, and 
                torVerts2.length/floatsPerVertex); // draw this many vertices.
  
  modelMatrix.scale(1,1,-1);              // convert to left-handed coord sys
                                          // to match WebGL display canvas.
  modelMatrix.scale(0.7, 0.7, 0.7);
              // Make it smaller:
  // modelMatrix.rotate(currentAngle, 1, 0, 0);
    modelMatrix.translate( 1,1,0);
    modelMatrix.rotate(currentAngle, 0, 0,1);
    // Spin on XY diagonal axis
  // Drawing:   
  // Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      // Draw just the sphere's vertices
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                sphStart/floatsPerVertex, // start at this vertex number, and 
                sphVerts.length/floatsPerVertex);

  
                                         // to match WebGL display canvas.
    modelMatrix.scale(0.25, 0.25, 0.25);
              // Make it smaller:
    modelMatrix.rotate(currentAngle, 1, 0, 0);
    modelMatrix.translate( 0, 0, 8);
    
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      // Draw just the sphere's vertices
    gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                cylStart/floatsPerVertex, // start at this vertex number, and 
                cylVerts.length/floatsPerVertex);

    modelMatrix.translate( 2, 2, 2); 
    modelMatrix.scale(3, 3, 3);
  
    modelMatrix.translate( 0, 0, 2.5);
    modelMatrix.rotate(currentAngle * 2, 0, 0, 1);
    
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      // Draw just the sphere's vertices
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                tor1Start/floatsPerVertex, // start at this vertex number, and 
                torVerts1.length/floatsPerVertex);
}
function drawAxes (gl, n, modelMatrix, u_ModelMatrix, x,y,z,size) {
	modelMatrix.setTranslate(x,y,z);
	modelMatrix.scale(size, size, size);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINES, smtStart/floatsPerVertex + 12,	// start at this vertex number, and
  						  6);
  
}
function drawStar (gl, n, modelMatrix, u_ModelMatrix, x,y,z,size) {
  modelMatrix.setTranslate(x,y,z);

  modelMatrix.scale(0.13, 0.13, 0.04);
  modelMatrix.scale(size, size, size);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.LINE_LOOP, starStart/floatsPerVertex, 10); // Star
  gl.drawArrays(gl.LINE_LOOP, starStart/floatsPerVertex + 10, 10);
  gl.drawArrays(gl.TRIANGLE_STRIP, starStart/floatsPerVertex + 20, 22);
  
}

function drawA (gl, n, modelMatrix, u_ModelMatrix, x,y,z,size) {
  modelMatrix.setTranslate(x,y,z);
  modelMatrix.rotate(90, 0, 1, 0); 
  modelMatrix.scale(size / 1.5, size,size);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP, AStart/floatsPerVertex , AVerts.length/floatsPerVertex);
  }
function drawRings (gl, n, currentAngle, modelMatrix, u_ModelMatrix, x,y,z,size) {
  modelMatrix.setTranslate(x,y,z);
  modelMatrix.scale(size, size, size);
  modelMatrix.rotate(90, 1, 0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                  tor1Start/floatsPerVertex,  // start at this vertex number, and 
                  torVerts1.length/floatsPerVertex);  // draw this many vertices.
  
  
}
function drawSomething (gl, n, currentAngle, modelMatrix, u_ModelMatrix, u_Normal, normals
  						, x,y,z) {
	modelMatrix.setTranslate(x,y,z);

	modelMatrix.scale(0.3, 0.3, 0.3);

	quatMatrix.setFromQuat(qTot.x, qTot.y, qTot.z, qTot.w);	// Quaternion-->Matrix
	modelMatrix.multiply(quatMatrix);													// apply that matrix.

	normals.setInverseOf(modelMatrix);
  normals.transpose();
  
  		// Draw triangles: start at vertex 0 and draw 12 vertices
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.uniformMatrix4fv(u_Normal, false, normals.elements);
  
  gl.drawArrays(gl.TRIANGLES, smtStart/floatsPerVertex,	// start at this vertex number, and
  						  12);
  normals.setIdentity();
  gl.uniformMatrix4fv(u_Normal, false, normals.elements);
  
  gl.drawArrays(gl.LINES, smtStart/floatsPerVertex + 12,	// start at this vertex number, and
  						  6);
  	
}

function drawDiamond (gl, n, currentAngle, modelMatrix, u_ModelMatrix
	,x,y,z) {

	modelMatrix.setTranslate(x,y,z);
  modelMatrix.scale(.1,.1,.1);
  modelMatrix.rotate(90, 1, 0, 0);
  modelMatrix.rotate(180, 0, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  		
  gl.drawArrays(gl.TRIANGLE_STRIP, 				// use this drawing primitive, and
  						  dmdStart/floatsPerVertex,	// start at this vertex number, and
  						  dmdVerts.length/floatsPerVertex);	// draw this many vertices.
	
	modelMatrix.rotate(180, 0, 1, 0);
	modelMatrix.translate(0,0,-1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  		
  gl.drawArrays(gl.TRIANGLE_STRIP, 				// use this drawing primitive, and
  						  dmddStart/floatsPerVertex,	// start at this vertex number, and
  						  dmddVerts.length/floatsPerVertex);	// draw this many vertices.

}
function drawRabbit( gl, n, currentAngle, modelMatrix, u_ModelMatrix
	,x,y,z, wave) {
	// -------Rabbit-------------------------------------------

  // -------Stick
  modelMatrix.setTranslate(x,y,z);  
  modelMatrix.rotate(90, 1, 0, 0);  
  																				// to match WebGL display canvas.
  modelMatrix.scale(-0.025, 0.025, 0.025);
  
  if(wave == 1){
    if(currentAngle < 180 && (stick_stop % 2))
      modelMatrix.rotate((currentAngle/2  + 135) , 0, 1, 0);  // spin around y axis.
    else if( (stick_stop % 2))
      modelMatrix.rotate((-currentAngle/2 + 315) , 0, 1, 0);  // spin around y axis.
    else 
      modelMatrix.rotate(180, 0, 1, 0);  // spin around y axis.
  } else modelMatrix.rotate(180, 0, 1, 0);  // spin around y axis.
  modelMatrix.translate(0,0,7);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  // Draw just the the cylinder's vertices:
  gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  							cylStart/floatsPerVertex, // start at this vertex number, and
  							cylVerts.length/floatsPerVertex);	// draw this many vertices.
  
  // -------Rabbit's head
  modelMatrix.scale(4.5,4.5,4.5);							// convert to left-handed coord sys
  																				// to match WebGL display canvas.
 
  modelMatrix.translate(0, 0, 2.5 + headposition);
 
	modelMatrix.rotate(currentAngle * 3, 0, 0, 1);
	modelMatrix.scale(big, big, big);
  modelMatrix.translate(1 * r_radius, 0, -.25);

  
	// Drawing:		
	// Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  		// Draw just the sphere's vertices
  gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  							sphStart/floatsPerVertex,	// start at this vertex number, and 
  							sphVerts.length/floatsPerVertex);	// draw this many vertices.
  

  // -------Rabit's ears
  if(currentAngle < 180)
			modelMatrix.scale(
				0.125 / (currentAngle / 360 + 0.75), 
				0.125 / (currentAngle / 360 + 0.75), 
				0.125 / (currentAngle / 360 + 0.75));
	else
			modelMatrix.scale(
				0.125 * (currentAngle / 360 + 0.25), 
				0.125 * (currentAngle / 360 + 0.25), 
				0.125 * (currentAngle / 360 + 0.25));
  modelMatrix.translate(1, 0, 7);
  if(currentAngle < 180)
	  modelMatrix.rotate(currentAngle / 4, 1, 0, 0);
	else
	  modelMatrix.rotate((360 - currentAngle) / 4, 1, 0, 0);
	
  // Drawing:		
	// Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  		// Draw just the sphere's vertices
  gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  							cylStart/floatsPerVertex,	// start at this vertex number, and 
  							cylVerts.length/floatsPerVertex);	// draw this many vertices.
  
  if(currentAngle < 180)
	  modelMatrix.rotate(-currentAngle / 2, 1, 0, 0);
	else
	  modelMatrix.rotate(-(360 - currentAngle) / 2, 1, 0, 0);

  
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  		// Draw just the sphere's vertices
  gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  							cylStart/floatsPerVertex,	// start at this vertex number, and 
  							cylVerts.length/floatsPerVertex);	// draw this many vertices.
  
}

function drawGrid(gl, n, modelMatrix, u_ModelMatrix) {
	// Draw Grid
 	modelMatrix.setRotate(-90.0, 1,0,0);	// new one has "+z points upwards",
  																		// made by rotating -90 deg on +x-axis.
  																		// Move those new drawing axes to the 
  																		// bottom of the trees:
	modelMatrix.translate(0.0, 0.0, -0.6);	
	modelMatrix.scale(0.4, 0.4,0.4);		// shrink the drawing axes 
																			//for nicer-looking ground-plane, and
  // Pass the modified view matrix to our shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  
  // Now, using these drawing axes, draw our ground plane: 
  gl.drawArrays(gl.LINES,							// use this drawing primitive, and
  							gndStart/floatsPerVertex,	// start at this vertex number, and
  							gndVerts.length/floatsPerVertex);		// draw this many vertices

}
// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();

function animate(angle) {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
//  if(angle >  120.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
//  if(angle < -120.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
  
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}
var spd_x = 0, spd_y = 0, spd_z = 0;
//==================HTML Button Callbacks
var speed_x = Math.sin(spd_y);
var speed_y = 0;
var speed_z = Math.cos(spd_y);
function fly() {
  if(fly_flag){

    speed_y += .02*jd_z;    

    d_x = .08 * Math.sin(speed_y) * speed;
    d_y = .08 * spd_x * speed;
    d_z = .08 * Math.cos(speed_y) * speed;
  }
}


function fly_flg() {
  if(fly_flag == 1) {
    fly_flag = 0;
    d_x = 0, d_y = 0, d_z = 0;
  }
  else {
    fly_flag = 1;
  }
  
}

function leftYaw() {
 jd_y += .1; 
}

function rightYaw() {
  jd_y -= .1; 
}

function upPitch() {
 jd_x -= .1; 
 
}

function downPitch() {
  jd_x += .1; 
  
}
function followw() {
  if(follow == 0) follow = 1;
  else follow = 0; 
}
var speed = 1;
function myKeyDown(ev) {
	switch(ev.keyCode) {
		case 72:		// h
			// print in 
			if(jd_z==0)
			jd_z = 1;
      if(jd_z==-1) jd_z=0;

      spd_y = Math.min(spd_y+1, 1);
      
			break;
		case 85:		// u
			jd_x -= .1 * fly_flag; 
      spd_x += .1;
  		break;
		case 75:		// k
      if(jd_z==0)
			jd_z = -1;
      if(jd_z == 1) jd_z=0;
      spd_y = Math.max(spd_y-1, -1);
      
  		break;
		case 74:		// j
			jd_x += .1 * fly_flag; 
      spd_x -= .1;
  		break;
		case 66://b
		 	big *= 1.05;
		 	break;
		case 76://l
			big /= 1.02;
			break;
		case 82://r
			big = 1;
			ANGLE_STEP = 45;
			headposition = 0;
			stick_stop = 1;
			r_radius = 1;
			g_points = [];
			clearDrag(), resetQuat();
      g_EyeX = 0.0, g_EyeY = 0.0, g_EyeZ = 5; 
      g_Angle_xchange = 0, g_Angle_zchange = 0;
      sca_h = 1, sca_v = 1;
      jd_z = 0,jd_x = 0,jd_y = 0;
      o_near = 1, o_far = 1;
      speed = 1, follow = 0;
      d_x = 0, d_y = 0, d_z = 0;
			break;
    case 65://a
      g_EyeX -= 0.1 * speed;
      break;
    case 68://d
      g_EyeX += 0.1 * speed;
      break;
    case 87://w
      g_EyeZ -= 0.1 * speed;
      break;
    case 83://s
      g_EyeZ += 0.1 * speed;
      break;
    case 190://,
      g_EyeY += 0.1 * speed;
      break;
    case 188://.
      g_EyeY -= 0.1 * speed;
      break;
    case 49://1
      sca_h *= 1.01;
      break;
    case 50://2
      sca_h /= 1.2;
      break;
    case 51://3
      sca_v *= 1.01;
      break;
    case 52://4
      sca_v /= 1.2;
      break;
    case 53://5
      o_near *= 1.1;
      break;
    case 54://6
      o_near /= 2;
      break;
    case 55://7
      o_far *= 1.1;
      break;
    case 56://8
      o_far /= 1.2;
      break;
    case 16://shift
      speed += 0.1; 
      break;
    case 17://control
      speed /= 2; 
      break; 
		default:
			console.log('myKeyDown()--keycode=', ev.keyCode, ', charCode=', ev.charCode);
  		break;
	}
}

function myKeyUp(ev) {
//===============================================================================
// Called when user releases ANY key on the keyboard; captures scancodes well

	console.log('myKeyUp()--keyCode='+ev.keyCode+' released.');
}

function myKeyPress(ev) {
	console.log('myKeyPress():keyCode='+ev.keyCode  +', charCode=' +ev.charCode+
												', shift='    +ev.shiftKey + ', ctrl='    +ev.ctrlKey +
												', altKey='   +ev.altKey   +
												', metaKey(Command key or Windows key)='+ev.metaKey);
}

function winResize(gl, n, currentAngle, modelMatrix, u_ModelMatrix
						,viewMatrix, u_ViewMatrix,
    				projMatrix, u_ProjMatrix,
    				normals, u_Normal
    				) {

  var nuCanvas = document.getElementById('webgl');	// get current canvas
	var nuGL = getWebGLContext(nuCanvas);							// and context:
	
	//Make canvas fill the top 3/4 of our browser window:
	nuCanvas.width = innerWidth;
	nuCanvas.height = innerHeight*3/4;
	//IMPORTANT!  need to re-draw screen contents
	draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix
						,viewMatrix, u_ViewMatrix,
    				projMatrix, u_ProjMatrix
    				,normals, u_Normal
    				);   // Draw shapes	
		 
};

function clearDrag() {
// Called when user presses 'Clear' button in our webpage
	xMdragTot = 0.0;
	yMdragTot = 0.0;
}
function clearMouse() {
// Called when user presses 'Clear' button on our webpage, just below the 
// 'xMdragTot,yMdragTot' display.
	xMdragTot = 0.0;
	yMdragTot = 0.0;
	
	}

function resetQuat() {
// Called when user presses 'Reset' button on our webpage, just below the 
// 'Current Quaternion' display.
  var res=5;
	qTot.clear();
	
	}
//===================Mouse and Keyboard event-handling Callbacks

function myMouseDown(ev, gl, canvas) {
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
  var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);
//	console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);
	if(x == xMclik && y == yMclik) dbclick += 1;
	isDrag = true;											// set our mouse-dragging flag
	xMclik = x;													// record where mouse-dragging began
	yMclik = y;
};


function myMouseMove(ev, gl, canvas) {
	if(isDrag==false && (dbclick%2) == 0) return;				// IGNORE all mouse-moves except 'dragging'

  
	// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);

	// find how far we dragged the mouse:
	xMdragTot += (x - xMclik);					// Accumulate change-in-mouse-position,&
	yMdragTot += (y - yMclik);
	// AND use any mouse-dragging we found to update quaternions qNew and qTot.
	//===================================================
	if(isDrag) dragQuat(x - xMclik, y - yMclik);
	//===================================================
	xMclik = x;													// Make NEXT drag-measurement from here.
	yMclik = y;
	if((dbclick % 2) == 1) 
  {
      g_Angle_xchange = -x;
      g_Angle_zchange = y;
  }

};

function myMouseUp(ev, gl, canvas) {
// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseUp  (pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);
//	console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);
	
	isDrag = false;											// CLEAR our mouse-dragging flag, and
	// accumulate any final bit of mouse-dragging we did:
	xMdragTot += (x - xMclik);
	yMdragTot += (y - yMclik);
//	console.log('myMouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);

	// AND use any mouse-dragging we found to update quaternions qNew and qTot;
	dragQuat(x - xMclik, y - yMclik);

	// Show it on our webpage, in the <div> element named 'MouseText':
	};

function dragQuat(xdrag, ydrag) {
	var res = 5;
	var qTmp = new Quaternion(0,0,0,1);
	
	var dist = Math.sqrt(xdrag*xdrag + ydrag*ydrag);
	// console.log('xdrag,ydrag=',xdrag.toFixed(5),ydrag.toFixed(5),'dist=',dist.toFixed(5));
	qNew.setFromAxisAngle(-ydrag + 0.0001, xdrag + 0.0001, 0.0, dist*150.0);
	// (why add tiny 0.0001? To ensure we never have a zero-length rotation axis)
							// why axis (x,y,z) = (-yMdrag,+xMdrag,0)? 
							// -- to rotate around +x axis, drag mouse in -y direction.
							// -- to rotate around +y axis, drag mouse in +x direction.
							
	qTmp.multiply(qNew,qTot);			// apply new rotation to current rotation. 
	qTmp.normalize();						// normalize to ensure we stay at length==1.0.
	qTot.copy(qTmp);
	// show the new quaternion qTot on our webpage in the <div> element 'QuatValue'
	
	};
	function initArrayBuffer (gl, attribute, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}