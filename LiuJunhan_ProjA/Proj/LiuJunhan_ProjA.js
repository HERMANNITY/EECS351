var VSHADER_SOURCE = 
  'uniform mat4 u_ModelMatrix;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program----------------------------------
var FSHADER_SOURCE = 
//  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
//  '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

// Global Variables
var ANGLE_STEP = 45.0;		// Rotation angle rate (degrees/second)
var floatsPerVertex = 7;	// # of Float32Array elements used for each vertex
													// (x,y,z,w)position + (r,g,b)color
													// Later, see if you can add:
													// (x,y,z) surface normal + (tx,ty) texture addr.
var isDrag=false;		// mouse-drag: true when user holds down mouse button
var xMclik=0.0;			// last mouse button-down position (in CVV coords)
var yMclik=0.0;   
var xMdragTot=0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot=0.0; 
var headposition = 0.0;
var stick_stop = 1;
var big = 1;
var r_radius = 1;
var g_points = []; // The array for the position of a mouse press
var add_point = 0;
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
  

  window.addEventListener("keydown", myKeyDown, false);
	
	gl.clearColor(0.3, 0.6, 0.1, 0.9);

	gl.enable(gl.DEPTH_TEST); 	  
	
  // Get handle to graphics system's storage location of u_ModelMatrix
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  // Create a local version of our model matrix in JavaScript 
  var modelMatrix = new Matrix4();
  
  // Create, init current rotation angle value in JavaScript
  var currentAngle = 0.0;

//-----------------  

  // Start drawing: create 'tick' variable whose value is this function:
  var tick = function() {
  	initVertexBuffer(gl, currentAngle);
    currentAngle = animate(currentAngle); 
    
    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);   // Draw shapes

    // report current angle on console
    //console.log('currentAngle=',currentAngle);
    requestAnimationFrame(tick, canvas);   
    
  };
  tick();							// start (and continue) animation: draw current image
	
}

function initVertexBuffer(gl, currentAngle) {
//==============================================================================
// Create one giant vertex buffer object (VBO) that holds all vertices for all
// shapes.
 
 	// Make each 3D shape in its own array of vertices:
  makeStick();					// create, fill the cylVerts array
  makeHead();						// create, fill the sphVerts array
  makeRing1();					// create, fill the gndVerts array
  makeRing2();
  makeEye();
  makeDiamond();
  makeDiamondd();
  // how many floats total needed to store all shapes?
	var mySiz = (cylVerts.length + sphVerts.length
							 + torVerts1.length + torVerts2.length + eyeVerts.length + dmdVerts.length + dmddVerts.length);
							 // + gndVerts.length);						

	// How many vertices total?
	var nn = mySiz / floatsPerVertex;
	console.log('nn is', nn, 'mySiz is', mySiz, 'floatsPerVertex is', floatsPerVertex);
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
			colorShapes[i] *= (currentAngle / 72);
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

	//--------------------------------DONE!
  // Unbind the buffer object 
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return nn;
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
 var ctrColr = new Float32Array([0.2, 0.2, 0.2]);	// dark gray
 var topColr = new Float32Array([0.4, 0.4, 0.4]);	// light green
 var botColr = new Float32Array([0.5, 0.5, 0.5]);	// light blue
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
				dmddVerts[j+4]=.1 * v / 1.6 / 5 + 0.3 ; 
				dmddVerts[j+5]=.1 * v / 1.6 / 5 + 0.3 ; 
				dmddVerts[j+6]=.1 * v / 1.6 / 5 + 0.3 ;			
		}
		else		// position all odd# vertices along the bottom cap:
		{
				dmddVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
				dmddVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
				dmddVerts[j+2] =-height;	// z
				dmddVerts[j+3] = 1.0;	// w.
				// r,g,b = topColr[]
				dmddVerts[j+4]=.8; 
				dmddVerts[j+5]=.8; 
				dmddVerts[j+6]=.8;			
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
			dmddVerts[j+4]=.8; 
			dmddVerts[j+5]=.8; 
			dmddVerts[j+6]=.8;		
		}
		else {				// position odd#'d vertices at center of the bottom cap:
			dmddVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
			dmddVerts[j+1] = 0.0;	
			dmddVerts[j+2] =-height; 
			dmddVerts[j+3] = 1.0;			// r,g,b = botColr[]
			dmddVerts[j+4]=.8; 
			dmddVerts[j+5]=.8; 
			dmddVerts[j+6]=.8;
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
var barSlices = 50;									// # of bar-segments in the torus: >=3 req'd;
																		// more segments for more-circular torus
var barSides = 50;										// # of sides of the bar (and thus the 
																		// number of vertices in its cross-section)
																		// >=3 req'd;
																		// more sides for more-circular cross-section
// for nice-looking torus with approx square facets, 
//			--choose odd or prime#  for barSides, and
//			--choose pdd or prime# for barSlices of approx. barSides *(rbend/rbar)
// EXAMPLE: rbend = 1, rbar = 0.5, barSlices =23, barSides = 11.

	// Create a (global) array to hold this torus's vertices:
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
			torVerts1[j+4] = 1;		// random color 0.0 <= R < 1.0
			torVerts1[j+5] = 1;		// random color 0.0 <= G < 1.0
			torVerts1[j+6] = 0;		// random color 0.0 <= B < 1.0
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
			torVerts1[j+5] = 1;		// random color 0.0 <= G < 1.0
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
			torVerts1[j+5] = 1;		// random color 0.0 <= G < 1.0
			torVerts1[j+6] = 0;		// random color 0.0 <= B < 1.0
}

function makeRing2() {
var rbend = 1.0;										// Radius of circle formed by torus' bent bar
var rbar = 0.1;											// radius of the bar we bent to form torus
var barSlices = 50;									// # of bar-segments in the torus: >=3 req'd;
																		// more segments for more-circular torus
var barSides = 50;										// # of sides of the bar (and thus the 
																		// number of vertices in its cross-section)
																		// >=3 req'd;
																		// more sides for more-circular cross-section
// for nice-looking torus with approx square facets, 
//			--choose odd or prime#  for barSides, and
//			--choose pdd or prime# for barSlices of approx. barSides *(rbend/rbar)
// EXAMPLE: rbend = 1, rbar = 0.5, barSlices =23, barSides = 11.

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




function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
//==============================================================================
  // Clear <canvas>  colors AND the depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
  // -------Rabbit

  // -------Stick
  modelMatrix.setTranslate(0.4,-0.0, 0.0);  
  modelMatrix.rotate(60, 1, 0, 0);  
  																				// to match WebGL display canvas.
  modelMatrix.scale(-0.025, 0.025, 0.025);
  
  if(currentAngle < 180 && (stick_stop % 2))
  	modelMatrix.rotate((currentAngle/2  + 135) , 0, 1, 0);  // spin around y axis.
	else if( (stick_stop % 2))
  	modelMatrix.rotate((-currentAngle/2 + 315) , 0, 1, 0);  // spin around y axis.
  else 
  	modelMatrix.rotate(180, 0, 1, 0);  // spin around y axis.
  modelMatrix.translate(0,0,4);
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
  


  // ------------------------------Ring

	// -------Stick
	var ring_ang = xMdragTot * 240;

  modelMatrix.setTranslate(-0.3 + xMdragTot, yMdragTot, -0.0);  // 'set' means DISCARD old matrix,
  						// (drawing axes centered in CVV), and then make new
  						// drawing axes moved to the lower-left corner of CVV. 
  modelMatrix.rotate(90, 1, 0, 0);  // spin around y axis.
  modelMatrix.scale(0.025, 0.025, 0.025);
  						// if you DON'T scale, cyl goes outside the CVV; clipped!
  modelMatrix.rotate(yMdragTot * 800 + 180, 0, .25, 1);  // spin around y axis.
  
  // Drawing:
  // Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  // Draw just the the cylinder's vertices:
  gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  							cylStart/floatsPerVertex, // start at this vertex number, and
  							cylVerts.length/floatsPerVertex);	// draw this many vertices.
  
  // -------The Ring
  modelMatrix.scale(3,3,3);							// convert to left-handed coord sys
  																				// to match WebGL display canvas.
  
  modelMatrix.translate(0, 0, -3.3);
  modelMatrix.rotate(-ring_ang * 10, 0, 0, -1);
  modelMatrix.translate(1, 0, 0);
	// Drawing:		
	// Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  		// Draw just the sphere's vertices
  var freq = 16;
  if((currentAngle % freq) < (freq / 2)){
    gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
    							tor1Start/floatsPerVertex,	// start at this vertex number, and 
    							torVerts1.length/floatsPerVertex);	// draw this many vertices.
  } else {
  	gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
    							tor2Start/floatsPerVertex,	// start at this vertex number, and 
    							torVerts2.length/floatsPerVertex);	// draw this many vertices.
  
  }
  																				// to match WebGL display canvas.
  modelMatrix.scale(.1, .1, .1);
  						// Make it smaller:
  
  
  // -------diamond
  modelMatrix.scale(3,3,3)

  modelMatrix.rotate(ring_ang, 0,0,1);
  modelMatrix.translate(3,0,-1.5);
  modelMatrix.rotate(180, 0, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  		
  gl.drawArrays(gl.TRIANGLE_STRIP, 				// use this drawing primitive, and
  						  dmdStart/floatsPerVertex,	// start at this vertex number, and
  						  dmdVerts.length/floatsPerVertex);	// draw this many vertices.
	modelMatrix.rotate(- 2 * ring_ang, 0,0,1);
	
	modelMatrix.rotate(180, 0, 1, 0);
	modelMatrix.translate(0,0,-1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  		
  gl.drawArrays(gl.TRIANGLE_STRIP, 				// use this drawing primitive, and
  						  dmddStart/floatsPerVertex,	// start at this vertex number, and
  						  dmddVerts.length/floatsPerVertex);	// draw this many vertices.


  // react to the mouse click
  if(add_point) {
  	g_points.push(xMclik); g_points.push(yMclik);
		add_point = 0;
  }
	var len = g_points.length;
  for(var i = 0; i < len; i += 2) {
  // Pass the position of a point to a_Position variable

	  modelMatrix.setTranslate(g_points[i],g_points[i + 1],0);
	  modelMatrix.scale(
	  	.045 * (currentAngle / 140 + 1) * ((i % 5) + 1),
	  	.045 * (currentAngle / 140 + 1) * ((i % 5) + 1),
	  	.045 * (currentAngle / 140 + 1) * ((i % 5) + 1))
		// Drawing:
	  // Pass our current matrix to the vertex shaders:
	  // -------Rabbit

  // -------Stick
  modelMatrix.rotate(60, 1, 0, 0);  // spin around y axis.
  // modelMatrix.rotate(120, 0, 0, 1);  // spin around y axis.
  
  																				// to match WebGL display canvas.
  modelMatrix.scale(-0.025, 0.025, 0.025);
  						// if you DON'T scale, cyl goes outside the CVV; clipped!
 //  if(currentAngle < 180 && (stick_stop % 2))
 //  	modelMatrix.rotate((currentAngle/2  + 135) , 0, 1, 0);  // spin around y axis.
	// else if( (stick_stop % 2))
 //  	modelMatrix.rotate((-currentAngle/2 + 315) , 0, 1, 0);  // spin around y axis.
 //  else 
 //  	modelMatrix.rotate(180, 0, 1, 0);  // spin around y axis.
  modelMatrix.translate(0,0,-6);
	// Drawing:
  // Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  // Draw just the the cylinder's vertices:
  // gl.drawArrays(gl.TRIANGLE_STRIP,				// use this drawing primitive, and
  // 							cylStart/floatsPerVertex, // start at this vertex number, and
  // 							cylVerts.length/floatsPerVertex);	// draw this many vertices.
  
  // -------Rabbit's head
  modelMatrix.rotate(180, 1, 0, 0);
  modelMatrix.scale(4.5,4.5,4.5);							// convert to left-handed coord sys
  																				// to match WebGL display canvas.
 
  
 
	modelMatrix.rotate(currentAngle * 3, 0, 0, 1);
	modelMatrix.scale(big, big, big);
  

  
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

//==================HTML Button Callbacks


function spinDown() {
 ANGLE_STEP /= 10; 
}

function spinUp() {
  ANGLE_STEP += 25; 
}
function spinupupup() {
  ANGLE_STEP += 250000; 
}

function myKeyDown(ev) {
	switch(ev.keyCode) {			// keycodes !=ASCII, but are very consistent for 
	//	nearly all non-alphanumeric keys for nearly all keyboards in all countries.
		case 37:		// left-arrow key
			// print in console:
			console.log(' left-arrow.');
			// and print on webpage in the <div> element with id='Result':
  		
			r_radius /= 1.5;
			break;
		case 38:		// up-arrow key
			console.log('   up-arrow.');
			headposition += .5;
  		break;
		case 39:		// right-arrow key
			console.log('right-arrow.');
			r_radius *= 1.25;
			
  		break;
		case 40:		// down-arrow key
			console.log(' down-arrow.');
			
			headposition -= .5;
  		break;
  	case 83:
  		if(ANGLE_STEP*ANGLE_STEP > 1) {
		    myTmp = ANGLE_STEP;
		    ANGLE_STEP = 0;
		  }
		  else {
		  	ANGLE_STEP = myTmp;
		  }
		  break;
		case 66:
		 	big *= 1.05;
		 	break;
		case 76:
			big /= 1.02;
			break;
		case 82:
			big = 1;
			ANGLE_STEP = 45;
			headposition = 0;
			stick_stop = 1;
			r_radius = 1;
			g_points = [];
			clearDrag();
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
//===============================================================================
// Best for capturing alphanumeric keys and key-combinations such as 
// CTRL-C, alt-F, SHIFT-4, etc.
	console.log('myKeyPress():keyCode='+ev.keyCode  +', charCode=' +ev.charCode+
												', shift='    +ev.shiftKey + ', ctrl='    +ev.ctrlKey +
												', altKey='   +ev.altKey   +
												', metaKey(Command key or Windows key)='+ev.metaKey);
}

function clearDrag() {
// Called when user presses 'Clear' button in our webpage
	xMdragTot = 0.0;
	yMdragTot = 0.0;
}
function myMouseDown(ev, gl, canvas) {
//==============================================================================
// Called when user PRESSES down any mouse button;
// 									(Which button?    console.log('ev.button='+ev.button);   )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
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
	if(x == xMclik && y == yMclik) add_point = 1;
	isDrag = true;											// set our mouse-dragging flag
	xMclik = x;													// record where mouse-dragging began
	yMclik = y;
};


function myMouseMove(ev, gl, canvas) {
//==============================================================================
// Called when user MOVES the mouse with a button already pressed down.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

	if(isDrag==false) return;				// IGNORE all mouse-moves except 'dragging'

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
//	console.log('myMouseMove(CVV coords  ):  x, y=\t',x,',\t',y);

	// find how far we dragged the mouse:
	xMdragTot += (x - xMclik);					// Accumulate change-in-mouse-position,&
	yMdragTot += (y - yMclik);
	xMclik = x;													// Make next drag-measurement from here.
	yMclik = y;
};

function myMouseUp(ev, gl, canvas) {
//==============================================================================
// Called when user RELEASES mouse button pressed previously.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

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
	console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);
	
	isDrag = false;											// CLEAR our mouse-dragging flag, and
	// accumulate any final bit of mouse-dragging we did:
	xMdragTot += (x - xMclik);
	yMdragTot += (y - yMclik);
	console.log('myMouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);
};
 