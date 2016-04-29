// Vertex shader program
var VSHADER_SOURCE =

  'precision mediump float;\n' +
  'precision highp int;\n' +

//====================structs====================
  'struct Lamp {\n' +
  '   vec3 u_LampPos;\n' +
  '   vec3 u_LampAmbi;\n' +
  '   vec3 u_LampDiff;\n' +
  '   vec3 u_LampSpec;\n' +
  '};\n' +

  'struct Material {\n' +
  '   vec4 u_Ke;\n' +
  '   vec4 u_Ka;\n' +
  '   vec4 u_Kd;\n' +
  '   vec4 u_Ks;\n' +
  '   int u_Kshiny;\n' + 
  '};\n' +
  //====================structs====================


  'attribute vec4 a_Position;\n' +

  'attribute vec4 a_Normal;\n' +

  //====================light====================
  'uniform Lamp lamp_head;\n' +//head light

  'uniform Lamp lamp_move;\n' +// moveable light
  //====================light====================

   //====================material====================
  'uniform Material mat;\n' +
  //====================material====================

  //====================shading/lighting mode====================
  'uniform int SLmode;\n' +
  //====================shading/lighting mode====================



  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +  // Transformation matrix of the normal


  'varying vec4 v_Color;\n' +

  'varying vec4 v_Kd; \n' +

  'varying vec4 v_Position; \n' +

  'varying vec3 v_Normal; \n' +


  'void main() {\n' +

  '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +

  //====================Gouraud Shading====================

  '  if(SLmode==1){\n' +


  '    vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n'+

  '    vec4 vertexPosition = u_ModelMatrix * a_Position;\n' +

   '   vec3 lightDirection = normalize(lamp_move.u_LampPos - vec3(vertexPosition));\n' +

  '    float nDotL = max(dot(lightDirection, normal), 0.0);\n'+

  '    vec3 diffuse = lamp_move.u_LampDiff * mat.u_Kd.xyz * nDotL ;\n'+

  '    vec3 ambient = lamp_move.u_LampAmbi * mat.u_Ka.xyz ;\n'+

  '    v_Color = vec4(ambient + diffuse, 1.0);\n'+

  '  }\n'+
   //====================Gouraud Shading====================

  //====================Blinn-Phong lighting====================
  '  if(SLmode==2){\n' +

  '  }\n'+
   //====================Blinn-Phong lighting====================

   //====================Cook-Torrance Shading====================
  
  '  if(SLmode==3){\n' +

  '  }\n'+

  //===================Cook-Torrance Shading====================

  //====================Phone lighting====================

  '  if(SLmode==4){\n' +


  '  }\n'+

  //====================Phone lighting====================



  '  v_Position = u_ModelMatrix * a_Position; \n' +

  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +

  '  v_Kd = mat.u_Kd; \n' + 

  '}\n';

// Fragment shader program
var FSHADER_SOURCE =

  'precision mediump float;\n' +
  'precision highp int;\n' +

   //====================structs====================
  'struct Lamp {\n' +
  '   vec3 u_LampPos;\n' +
  '   vec3 u_LampAmbi;\n' +
  '   vec3 u_LampDiff;\n' +
  '   vec3 u_LampSpec;\n' +
  '};\n' +

  'struct Material {\n' +
  '   vec4 u_Ke;\n' +
  '   vec4 u_Ka;\n' +
  '   vec4 u_Kd;\n' +
  '   vec4 u_Ks;\n' +
  '   int u_Kshiny;\n' + 
  '};\n' +
   //====================structs====================


   //====================light====================
  'uniform Lamp lamp_head;\n' +//head light

  'uniform Lamp lamp_move;\n' +// moveable light
  //====================light====================


  //====================material====================
  'uniform Material mat;\n' + //material
  //====================material====================


  //====================shading/lighting mode====================
  'uniform int SLmode;\n' +
  //====================shading/lighting mode====================

  //====================attenuation mode for head lamp====================
  'uniform int att;\n' +
  //====================attenuation mode for head lamp====================


  'uniform vec3 u_eyePosWorld; \n' +


  'varying vec4 v_Color;\n' +

  'varying vec3 v_Normal;\n' +  

  'varying vec4 v_Position;\n' +  

  'varying vec4 v_Kd; \n' +  



  'void main() { \n' +
    
  '  vec3 normal = normalize(v_Normal); \n' +

  '  vec3 eyeDirection = normalize(u_eyePosWorld - v_Position.xyz); \n' +

  //====================head light====================

  //====================attenuation====================

  '  vec3 pointLightDirection = lamp_head.u_LampPos - v_Position.xyz;\n' +

  '  float d = length(pointLightDirection);\n' +

  '  float attenuation;\n' +

  '  if(att==1){\n' +

  '  attenuation = 1.0;\n' +

  '  }\n'+

  '  if(att==2){\n' +

  '  attenuation = 1.0/(.1 + .1*d);\n' +

  '  }\n'+

  '  if(att==3){\n' +

  '  attenuation = 1.0/(.01 + .02*d*d);\n' +

  '  }\n'+

  '  if(att==4){\n' +

  '  attenuation = 1.0/(.01 + .01*d+.02*d*d);\n' +

  '  }\n'+


  //====================attenuation====================

  '  vec3 lightDir_head = normalize(lamp_head.u_LampPos - v_Position.xyz);\n' +

  '  float lambertian_head = max(dot(lightDir_head,normal), 0.0);\n' +

  '  float specular_head = 0.0;\n' +

  '  if(lambertian_head > 0.0) {\n' +

  '    vec3 halfDir_head = normalize(lightDir_head + eyeDirection);\n' +

  '    float specAngle_head = max(dot(halfDir_head, normal), 0.0);\n' +

  '    specular_head = pow(specAngle_head, float(mat.u_Kshiny));\n' +

  '  }\n' +

  '  vec4 emissive_head = mat.u_Ke;\n' +

  '  vec4 ambient_head = vec4(lamp_head.u_LampAmbi,1.0) * mat.u_Ka * attenuation;\n' +

  '  vec4 diffuse_head = vec4(lamp_head.u_LampDiff,1.0) * v_Kd * lambertian_head * attenuation;\n' +

  '  vec4 speculr_head = vec4(lamp_head.u_LampSpec,1.0) * mat.u_Ks * specular_head * attenuation;\n' +

  '  vec4 fragColor_head = vec4(emissive_head + ambient_head + diffuse_head + speculr_head);\n'+
  //head light=================================

  //moveable light=================================

  '  vec4 fragColor_move;\n'+

   //====================Gouraud Shading====================

  '  if(SLmode==1){\n' +

  '    fragColor_move = v_Color;\n'+

  '  }\n'+
  
  //====================Blinn-Phong lighting====================
  '  if(SLmode==2){\n' +

  '  vec3 pointLightDirection = lamp_move.u_LampPos - v_Position.xyz;\n' +

  '  float d = length(pointLightDirection);\n' +

  '  float attenuation = 1.0/(.01 + .01*d+.02*d*d);\n' +

  '  vec3 lightDir_move = normalize(lamp_move.u_LampPos - v_Position.xyz);\n' +

  '  float lambertian_move = max(dot(lightDir_move,normal), 0.0);\n' +

  '  float specular_move = 0.0;\n' +

  '  if(lambertian_move > 0.0) {\n' +

  '    vec3 halfDir_move = normalize(lightDir_move + eyeDirection);\n' +

  '    float specAngle_move = max(dot(halfDir_move, normal), 0.0);\n' +

  '    specular_move = pow(specAngle_move, float(mat.u_Kshiny));\n' +

  '  }\n' +

  '  vec4 emissive_move = mat.u_Ke;\n' +

  '  vec4 ambient_move = vec4(lamp_move.u_LampAmbi,1.0) * mat.u_Ka * attenuation;\n' +

  '  vec4 diffuse_move = vec4(lamp_move.u_LampDiff,1.0) * v_Kd * lambertian_move * attenuation;\n' +

  '  vec4 speculr_move = vec4(lamp_move.u_LampSpec,1.0) * mat.u_Ks * specular_move * attenuation;\n' +

  '  fragColor_move = vec4(emissive_move + ambient_move + diffuse_move + speculr_move);\n'+


  '  }\n'+
   //====================Blinn-Phong lighting====================


//====================CookTorrance====================
  
  '  if(SLmode==3){\n' +

  '  vec3 lightDirection_move = normalize(lamp_move.u_LampPos - v_Position.xyz);\n' +

  '  float nDotL_move = max(dot(lightDirection_move, normal), 0.0);\n' +

  '  float roughnessValue = 0.5;\n' + // 0 : smooth, 1: rough

  '  float F0 = 0.8;\n' + // fresnel reflectance at normal incidence

  '  float k = 0.5;\n' + // fraction of diffuse reflection (specular reflection = 1 - k)

  '  vec3 lightColor = lamp_move.u_LampDiff * mat.u_Kd.xyz * nDotL_move + lamp_move.u_LampAmbi * mat.u_Ka.xyz;\n' +

  '  float specular = 0.0;\n' +

  '  if(nDotL_move > 0.0){\n' +

  '    vec3 halfVector_move = normalize(lightDirection_move + eyeDirection);\n' +

  '    float nDotH_move = max(dot(normal, halfVector_move), 0.0);\n' +

  '    float nDotV_move = max(dot(normal, eyeDirection), 0.0);\n' +

  '    float vDoth_move = max(dot(eyeDirection, halfVector_move), 0.0);\n' +

  '    float mSquared = roughnessValue * roughnessValue;\n' +

  '    float NH2 = 2.0 * nDotH_move;\n' +

  '    float g1 = (NH2 * nDotV_move) / vDoth_move;\n' +

  '    float g2 = (NH2 * nDotL_move) / vDoth_move;\n' +

  '    float geoAtt = min(1.0, min(g1, g2));\n' +

  '    float r1 = 1.0 / ( 4.0 * mSquared * pow(nDotH_move, 4.0));\n' +

  '    float r2 = (nDotH_move * nDotH_move - 1.0) / (mSquared * nDotH_move * nDotH_move);\n' +

  '    float roughness = r1 * exp(r2);\n' +

  '    float fresnel = pow(1.0 - vDoth_move, 5.0);\n' +

  '    fresnel *= (1.0 - F0);\n' +

  '    fresnel += F0;\n' +

  '    specular = (fresnel * geoAtt * roughness) / (nDotV_move * nDotL_move * 3.14);\n' +

  '  }\n' +

  '  vec3 finalValue =  lightColor * nDotL_move * (k + specular * (1.0 - k));\n' +

  '  fragColor_move = vec4(finalValue, 1.0)*3.0;\n' +

  '  }\n'+

  //====================CookTorrance====================

    //====================Phone lighting====================

  '  if(SLmode==4){\n' +

  '  vec3 pointLightDirection = lamp_move.u_LampPos - v_Position.xyz;\n' +

  '  float d = length(pointLightDirection);\n' +

  '  float attenuation = 1.0/(.01 + .01*d+.02*d*d);\n' +

  '  vec3 L = pointLightDirection;\n' +

  '  vec3 V = -vec3(v_Position);\n' +

  '  vec3 l = normalize(L);\n' +

  '  vec3 n = v_Normal;\n' +

  '  vec3 v = normalize(V);\n' +

  '  vec3 R = reflect(l, n);\n' +

  '  float diffuseLambert = dot(l,n);\n' +


  '  float shininess = float(mat.u_Kshiny);\n' +

  '  float specular = pow( max(0.0,dot(R,v)), shininess/4.0);\n' +

  '  vec4 emissive_move = mat.u_Ke;\n' +
  '  vec4 ambient_move = vec4(lamp_move.u_LampAmbi,1.0) * mat.u_Ka * attenuation;\n' +
  '  vec4 diffuse_move = vec4(lamp_move.u_LampDiff,1.0) * v_Kd * diffuseLambert * attenuation;\n' +
  '  vec4 speculr_move = vec4(lamp_move.u_LampSpec,1.0) * mat.u_Ks * specular * attenuation;\n' +

  '  fragColor_move = vec4(emissive_move + ambient_move + diffuse_move + speculr_move);\n'+

  '  }\n'+

  //====================Phone lighting====================

  //====================moveable light====================


  '  gl_FragColor = fragColor_head + fragColor_move;\n' +
  
  '}\n';
  
var floatsPerVertex = 7;  


var canvas = false;
var gl = false;



var u_ModelMatrix  = false;
var u_ViewMatrix  = false;
var u_ProjMatrix  = false;
var u_NormalMatrix  = false;

var u_eyePosWorld  = false;




var modelMatrix = new Matrix4();
var viewMatrix = new Matrix4();
var projMatrix = new Matrix4();
var normalMatrix = new Matrix4();

var eyePosWorld = new Float32Array(3);  // x,y,z in world coords

var lampHead = new Lamp();
var lampMove = new Lamp();
var mat = new Material();

//====================shading/lighting====================
var SLmode = false;
//====================shading/lighting====================

//====================attenuation mode for head lamp====================
var att = false;
//====================attenuation mode for head lamp====================

var n  = false;


var ANGLE_STEP_hand = 45.0;  // default rotation angle rate (deg/sec)
var ANGLE_STEP = 45.0;  // default rotation angle rate (deg/sec)
var currentAngle_wing = 0.0;
var currentAngle = 0.0;



function main() {
//==============================================================================
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  
  // Set the vertex coordinates and color (the blue triangle is in the front)
  n = initVertexBuffers(gl);

  if (n < 0) {
    console.log('Failed to specify the vertex information');
    return;
  }

  // Register the Mouse & Keyboard Event-handlers-------------------------------

  canvas.onmousedown  = function(ev){myMouseDown(ev) }; 
            // when user's mouse button goes down, call mouseDown() function
  canvas.onmousemove =  function(ev){myMouseMove(ev) };
                      // when the mouse moves, call mouseMove() function          
  canvas.onmouseup =    function(ev){myMouseUp(ev)};

  // Register the event handler to be called on key press
  document.onkeydown= function(ev){keydown(ev);};
  document.onkeyup= function(ev){keyup(ev);};


  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1.0);

  gl.depthFunc(gl.LEQUAL);     
  gl.enable(gl.DEPTH_TEST);     

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_ViewMatrix  = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  u_ProjMatrix  = gl.getUniformLocation(gl.program, 'u_ProjMatrix');

  if (!u_ModelMatrix || !u_ViewMatrix || !u_ProjMatrix) { 
    console.log('Failed to Get the storage locations of u_ModelMatrix, u_ViewMatrix, and/or u_ProjMatrix');
    return;
  }

  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');

  if (!u_NormalMatrix) { 
    console.log('Failed to Get the storage locations of u_NormalMatrix');
    return;
  }

  u_eyePosWorld = gl.getUniformLocation(gl.program, 'u_eyePosWorld');

   if (!u_eyePosWorld) { 
    console.log('Failed to Get the storage locations of u_eyePosWorld');
    return;
  }

  SLmode = gl.getUniformLocation(gl.program, 'SLmode');

   if (!SLmode) { 
    console.log('Failed to Get the storage locations of SLmode');
    return;
  }

  att = gl.getUniformLocation(gl.program, 'att');

   if (!att) { 
    console.log('Failed to Get the storage locations of att');
    return;
  }


  //====================move light====================
  lampMove.initLamp_Pos_Ambi_Diff_Spec(gl,'lamp_move.u_LampPos','lamp_move.u_LampAmbi','lamp_move.u_LampDiff','lamp_move.u_LampSpec');
  lampMove.setPos([ 0.0, 0.0, 0.0]);
  lampMove.setAmbi([0.0, 0.0, 0.0]);
  lampMove.setDiff([0.0, 0.0, 0.0]);
  lampMove.setSpec([0.0, 0.0, 0.0]);
  //====================move light====================


//====================head light====================
  lampHead.initLamp_Pos_Ambi_Diff_Spec(gl,'lamp_head.u_LampPos','lamp_head.u_LampAmbi','lamp_head.u_LampDiff','lamp_head.u_LampSpec');
  lampHead.setPos([0.0,  0.0, 0.0]);
  lampHead.setAmbi([0.0, 0.0, 0.0]);
  lampHead.setDiff([0.0, 0.0, 0.0]);
  lampHead.setSpec([0.0, 0.0, 0.0]);
//====================head light====================

  mat.initMaterial(gl,'mat.u_Ke','mat.u_Ka','mat.u_Kd','mat.u_Ks','mat.u_Kshiny');



  var tick = function() {
    animate();  // Update the rotation angle

    headLampControl();

    moveLampControl()

    winResize();

    draw(); 

    requestAnimationFrame(tick, canvas);   
  };
  tick();       
}

// Creates a 3D torus in the XY plane, returns the data in a new object composed of
//   several Float32Array objects named 'vertices' and 'colors', according to
//   the following parameters:
// r:  big radius
// sr: section radius
// n:  number of faces
// sn: number of faces on section
// k:  factor between 0 and 1 defining the space between strips of the torus
function makeTorus(r, sr, n, sn, k)
{
  // Temporary arrays for the vertices, normals and colors
  var verts = new Array();

  // Iterates along the big circle and then around a section
  for(var i=0;i<n;i++)               // Iterates over all strip rounds
    for(var j=0;j<sn+1*(i==n-1);j++) // Iterates along the torus section
      for(var v=0;v<2;v++)           // Creates zigzag pattern (v equals 0 or 1)
      {
        // Pre-calculation of angles
        var a =  2*Math.PI*(i+j/sn+k*v)/n;
        var sa = 2*Math.PI*j/sn;
        var x, y, z, w;
      
        // Coordinates on the surface of the torus  
        verts.push(x = (r+sr*Math.cos(sa))*Math.cos(a)); // X
        verts.push(y = (r+sr*Math.cos(sa))*Math.sin(a)); // Y
        verts.push(z = sr*Math.sin(sa));                 // Z
        verts.push(w = 1.0);

        //normal
        verts.push(Math.cos(sa)*Math.cos(a));  // x
        verts.push(Math.cos(sa)*Math.cos(a)); // y
        verts.push(Math.sin(sa));  //z

      }

  torVerts = new Float32Array(verts);

}


function makeTetrahedron(){
  var c30 = Math.sqrt(0.75);          // == cos(30deg) == sqrt(3) / 2
  var sq2 = Math.sqrt(2.0);
  var sq6 = Math.sqrt(6.0);             

  tetVerts = new Float32Array([
  // Vertex coordinates(x,y,z,w) and color (R,G,B) for a new color tetrahedron:
  //    Apex on +z axis; equilateral triangle base at z=0
/*  Nodes:
     0.0,  0.0, sq2, 1.0,     0.0,  0.0,  1.0,  // Node 0 (apex, +z axis;  blue)
     c30, -0.5, 0.0, 1.0,     1.0,  0.0,  0.0,  // Node 1 (base: lower rt; red)
     0.0,  1.0, 0.0, 1.0,     0.0,  1.0,  0.0,  // Node 2 (base: +y axis;  grn)
    -c30, -0.5, 0.0, 1.0,     1.0,  1.0,  1.0,  // Node 3 (base:lower lft; white)
*/
      // Face 0: (left side)  
     0.0,  0.0, sq2, 1.0,   sq6, sq2, 1,// Node 0 (apex, +z axis;  blue)
     c30, -0.5, 0.0, 1.0,   sq6, sq2, 1,// Node 1 (base: lower rt; red)
     0.0,  1.0, 0.0, 1.0,   sq6, sq2, 1,// Node 2 (base: +y axis;  grn)
      // Face 1: (right side)
     0.0,  0.0, sq2, 1.0,   -sq6, sq2, 1,// Node 0 (apex, +z axis;  blue)
     0.0,  1.0, 0.0, 1.0,   -sq6, sq2, 1,// Node 2 (base: +y axis;  grn)
    -c30, -0.5, 0.0, 1.0,   -sq6, sq2, 1,// Node 3 (base:lower lft; white)
      // Face 2: (lower side)
     0.0,  0.0, sq2, 1.0,   0, -2*sq2, 1,// Node 0 (apex, +z axis;  blue) 
    -c30, -0.5, 0.0, 1.0,   0, -2*sq2, 1,// Node 3 (base:lower lft; white)
     c30, -0.5, 0.0, 1.0,   0, -2*sq2, 1,// Node 1 (base: lower rt; red) 
      // Face 3: (base side)  
    -c30, -0.5, 0.0, 1.0,   0, 0, -1,// Node 3 (base:lower lft; white)
     0.0,  1.0, 0.0, 1.0,   0, 0, -1,// Node 2 (base: +y axis;  grn)
     c30, -0.5, 0.0, 1.0,   0, 0, -1,// Node 1 (base: lower rt; red)
     
  ]);
}

function makeSphere(){

  var SPHERE_DIV = 13; //default: 13.  JT: try others: 11,9,7,5,4,3,2,

  var i, ai, si, ci;
  var j, aj, sj, cj;
  var p1, p2;

  var positions_Sphere = [];
  var normal_Sphere = [];

  sphVerts = [];

  // Generate coordinates
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = j * Math.PI / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = i * 2 * Math.PI / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      positions_Sphere.push(si * sj);  // X
      positions_Sphere.push(cj);       // Y
      positions_Sphere.push(ci * sj);  // Z

      normal_Sphere.push(si * sj);  // X
      normal_Sphere.push(cj);       // Y
      normal_Sphere.push(ci * sj);  // Z
    }
  }

  // Generate indices
  for (j = 0; j < SPHERE_DIV; j++) {
    for (i = 0; i < SPHERE_DIV; i++) {
      p1 = j * (SPHERE_DIV+1) + i;
      p2 = p1 + (SPHERE_DIV+1);

      
      sphVerts.push(positions_Sphere[p1*6]);
      sphVerts.push(positions_Sphere[p1*6+1]);
      sphVerts.push(positions_Sphere[p1*6+2]);
      sphVerts.push(1.0);
      
      sphVerts.push(normal_Sphere[p1*6]);
      sphVerts.push(normal_Sphere[p1*6+1]);
      sphVerts.push(normal_Sphere[p1*6+2]);
      


      sphVerts.push(positions_Sphere[p2*6]);
      sphVerts.push(positions_Sphere[p2*6+1]);
      sphVerts.push(positions_Sphere[p2*6+2]);
      sphVerts.push(1.0);
      
      sphVerts.push(normal_Sphere[p2*6]);
      sphVerts.push(normal_Sphere[p2*6+1]);
      sphVerts.push(normal_Sphere[p2*6+2]);
      


      sphVerts.push(positions_Sphere[(p1 + 1)*6]);
      sphVerts.push(positions_Sphere[(p1 + 1)*6+1]);
      sphVerts.push(positions_Sphere[(p1 + 1)*6+2]);
      sphVerts.push(1.0);
      
      sphVerts.push(normal_Sphere[(p1 + 1)*6]);
      sphVerts.push(normal_Sphere[(p1 + 1)*6+1]);
      sphVerts.push(normal_Sphere[(p1 + 1)*6+2]);

      


      sphVerts.push(positions_Sphere[(p1 + 1)*6]);
      sphVerts.push(positions_Sphere[(p1 + 1)*6+1]);
      sphVerts.push(positions_Sphere[(p1 + 1)*6+2]);
      sphVerts.push(1.0);
      
      sphVerts.push(normal_Sphere[(p1 + 1)*6]);
      sphVerts.push(normal_Sphere[(p1 + 1)*6+1]);
      sphVerts.push(normal_Sphere[(p1 + 1)*6+2]);
      


      sphVerts.push(positions_Sphere[p2*6]);
      sphVerts.push(positions_Sphere[p2*6+1]);
      sphVerts.push(positions_Sphere[p2*6+2]);
      sphVerts.push(1.0);
      
      sphVerts.push(normal_Sphere[p2*6]);
      sphVerts.push(normal_Sphere[p2*6+1]);
      sphVerts.push(normal_Sphere[p2*6+2]);
      


      sphVerts.push(positions_Sphere[(p2 + 1)*6]);
      sphVerts.push(positions_Sphere[(p2 + 1)*6+1]);
      sphVerts.push(positions_Sphere[(p2 + 1)*6+2]);
      sphVerts.push(1.0);
      
      sphVerts.push(normal_Sphere[(p2 + 1)*6]);
      sphVerts.push(normal_Sphere[(p2 + 1)*6+1]);
      sphVerts.push(normal_Sphere[(p2 + 1)*6+2]);
    }
  }

}


function makeGroundGrid(x_points, y_points, grid_size) {
  var x_start = -x_points/2;
  var y_start = -y_points/2;
  var x_end = x_points/2;
  var y_end = y_points/2;
  var y_count = 0;
  var x_count = 0;


  gndVerts =[];

  for (y_count = y_start; y_count < y_end; y_count += 2) {
    gndVerts.push(x_count*grid_size);//x
    gndVerts.push(y_count*grid_size);//y
    gndVerts.push(0.0);//z
    gndVerts.push(1.0);//w

    gndVerts.push(1.0);//r
    gndVerts.push(1.0);//g
    gndVerts.push(1.0);//b

    for (x_count = x_start; x_count < x_end; x_count++) {

      gndVerts.push(x_count*grid_size);//x
      gndVerts.push((y_count+1)*grid_size);//y
      gndVerts.push(0.0);//z
      gndVerts.push(1.0);//w

      gndVerts.push(1.0);//r
      gndVerts.push(1.0);//g
      gndVerts.push(1.0);//b

      gndVerts.push((x_count+1)*grid_size);//x
      gndVerts.push(y_count*grid_size);//y
      gndVerts.push(0.0);//z
      gndVerts.push(1.0);//w

      gndVerts.push(1.0);//r
      gndVerts.push(1.0);//g
      gndVerts.push(1.0);//b
    }

    for (x_count = x_end; x_count > x_start; x_count--) {

      gndVerts.push(x_count*grid_size);//x
      gndVerts.push((y_count+2)*grid_size);//y
      gndVerts.push(0.0);//z
      gndVerts.push(1.0);//w

      gndVerts.push(1.0);//r
      gndVerts.push(1.0);//g
      gndVerts.push(1.0);//b

      gndVerts.push((x_count-1)*grid_size);//x
      gndVerts.push((y_count+1)*grid_size);//y
      gndVerts.push(0.0);//z
      gndVerts.push(1.0);//w

      gndVerts.push(1.0);//r
      gndVerts.push(1.0);//g
      gndVerts.push(1.0);//b
    }
  }
}


function initVertexBuffers(gl) {
//==============================================================================

  
  makeTorus(0.7, 0.2, 15, 15, 1);


  makeSphere();
  makeTetrahedron();
  
  // Make our 'ground plane'; can you make a'torus' shape too?
  // (recall the 'basic shapes' starter code...)
  makeGroundGrid(200,200,1);

  
  // How much space to store all the shapes in one array?
  // (no 'var' means this is a global variable)
  mySiz = sphVerts.length + tetVerts.length + torVerts.length + gndVerts.length;

  // How many vertices total?
  var nn = mySiz / floatsPerVertex;

  // Copy all shapes into one big Float32 array:
  var verticesColorsNormals = new Float32Array(mySiz);
  // Copy them:  remember where to start for each shape:

  sphStart = 0;           // next, we'll store the sphere;
  for(i = 0, j=0; j< sphVerts.length; i++, j++) {// don't initialize i -- reuse it!
    verticesColorsNormals[i] = sphVerts[j];
    }
    tetStart = i;
  for(j=0; j< tetVerts.length; i++, j++) {// don't initialize i -- reuse it!
    verticesColorsNormals[i] = tetVerts[j];
    }
    torStart = i;           // next, we'll store the torus;
  for(j=0; j< torVerts.length; i++, j++) {
    verticesColorsNormals[i] = torVerts[j];
    }
    gndStart = i;           // next we'll store the ground-plane;
  for(j=0; j< gndVerts.length; i++, j++) {
    verticesColorsNormals[i] = gndVerts[j];
    }

  
  // Create a vertex buffer object (VBO)
  var vertexColorbuffer = gl.createBuffer();  
  if (!vertexColorbuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write vertex information to buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColorsNormals, gl.STATIC_DRAW);

  var FSIZE = verticesColorsNormals.BYTES_PER_ELEMENT;
  // Assign the buffer object to a_Position and enable the assignment
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  
  // Use handle to specify how to retrieve **POSITION** data from our VBO:
  gl.vertexAttribPointer(
      a_Position,   // choose Vertex Shader attribute to fill with data
      4,            // how many values? 1,2,3 or 4.  (we're using x,y,z,w)
      gl.FLOAT,     // data type for each value: usually gl.FLOAT
      false,        // did we supply fixed-point data AND it needs normalizing?
      FSIZE * floatsPerVertex, // Stride -- how many bytes used to store each vertex?
                    // (x,y,z,w, r,g,b) * bytes/value
      0);           // Offset -- now many bytes from START of buffer to the
                    // value we will actually use?
  gl.enableVertexAttribArray(a_Position);  
                    // Enable assignment of vertex buffer object's position data

  

    // Surface Normal = vertex position;
  var a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if(a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return -1;
  }
  
  gl.vertexAttribPointer(
    a_Normal,       
    3,              
    gl.FLOAT,       
    false,          
    FSIZE * floatsPerVertex,      
                    
    FSIZE * 4);     
                    
  gl.enableVertexAttribArray(a_Normal); 

  //--------------------------------DONE!
  // Unbind the buffer object 
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return mySiz/floatsPerVertex; // return # of vertices
}

function headLampControl(){
  changeAttMode();
  changeHeadLampColor();
}

function moveLampControl(){
  changeSLMode()
  changeMoveLampColor();
}

function changeHeadLampColor(){
  var ambiR = document.getElementById("headLamp_Ambi_R").value;
  document.getElementById('headLamp_Ambi_R_text').innerHTML='Ambi_R:\t'+ambiR;
  var ambiG = document.getElementById("headLamp_Ambi_G").value;
  document.getElementById('headLamp_Ambi_G_text').innerHTML='Ambi_G:\t'+ambiG;
  var ambiB = document.getElementById("headLamp_Ambi_B").value;
  document.getElementById('headLamp_Ambi_B_text').innerHTML='Ambi_B:\t'+ambiB;

  var diffR = document.getElementById("headLamp_Diff_R").value;
  document.getElementById('headLamp_Diff_R_text').innerHTML='Diff_R:\t'+diffR;
  var diffG = document.getElementById("headLamp_Diff_G").value;
  document.getElementById('headLamp_Diff_G_text').innerHTML='Diff_G:\t'+diffG;
  var diffB = document.getElementById("headLamp_Diff_B").value;
  document.getElementById('headLamp_Diff_B_text').innerHTML='Diff_B:\t'+diffB;

  var specR = document.getElementById("headLamp_Spec_R").value;
  document.getElementById('headLamp_Spec_R_text').innerHTML='Spec_R:\t'+specR;
  var specG = document.getElementById("headLamp_Spec_G").value;
  document.getElementById('headLamp_Spec_G_text').innerHTML='Spec_G:\t'+specG;
  var specB = document.getElementById("headLamp_Spec_B").value;
  document.getElementById('headLamp_Spec_B_text').innerHTML='Spec_B:\t'+specB;

  if(isOn_headLamp==true){
    lampHead.setAmbi([ambiR, ambiG, ambiB]);
    lampHead.setDiff([diffR, diffG, diffB]);
    lampHead.setSpec([specR, specG , specB]);
  }
}

function changeMoveLampColor(){
  var ambiR = document.getElementById("moveLamp_Ambi_R").value;
  document.getElementById('moveLamp_Ambi_R_text').innerHTML='Ambi_R:\t'+ambiR;
  var ambiG = document.getElementById("moveLamp_Ambi_G").value;
  document.getElementById('moveLamp_Ambi_G_text').innerHTML='Ambi_G:\t'+ambiG;
  var ambiB = document.getElementById("moveLamp_Ambi_B").value;
  document.getElementById('moveLamp_Ambi_B_text').innerHTML='Ambi_B:\t'+ambiB;

  var diffR = document.getElementById("moveLamp_Diff_R").value;
  document.getElementById('moveLamp_Diff_R_text').innerHTML='Diff_R:\t'+diffR;
  var diffG = document.getElementById("moveLamp_Diff_G").value;
  document.getElementById('moveLamp_Diff_G_text').innerHTML='Diff_G:\t'+diffG;
  var diffB = document.getElementById("moveLamp_Diff_B").value;
  document.getElementById('moveLamp_Diff_B_text').innerHTML='Diff_B:\t'+diffB;

  var specR = document.getElementById("moveLamp_Spec_R").value;
  document.getElementById('moveLamp_Spec_R_text').innerHTML='Spec_R:\t'+specR;
  var specG = document.getElementById("moveLamp_Spec_G").value;
  document.getElementById('moveLamp_Spec_G_text').innerHTML='Spec_G:\t'+specG;
  var specB = document.getElementById("moveLamp_Spec_B").value;
  document.getElementById('moveLamp_Spec_B_text').innerHTML='Spec_B:\t'+specB;

  if(isOn_moveLamp==true){
    lampMove.setAmbi([ambiR, ambiG, ambiB]);
    lampMove.setDiff([diffR, diffG, diffB]);
    lampMove.setSpec([specR, specG , specB]);
  }

}

function changeSLMode(){
  var e = document.getElementById("SLmode");
  var slmode = e.options[e.selectedIndex].value;
  gl.uniform1i(SLmode, slmode);
}

function changeAttMode(){
  var e = document.getElementById("ATTmode");
  var attMode = e.options[e.selectedIndex].value;
  gl.uniform1i(att, attMode);
}

var isOn_headLamp = false;
function headLampSwitch(){
  if(isOn_headLamp == false){
    isOn_headLamp = true;
    lampHead.turnOn();
    document.getElementById("headLampSwitch").innerHTML = "Off";
  }
  else{
    isOn_headLamp = false;
    lampHead.turnOff();
    document.getElementById("headLampSwitch").innerHTML = "On ";
  }

}

var isOn_moveLamp = true;
function moveLampSwitch(){
  if(isOn_moveLamp == true){
    isOn_moveLamp = false;
    lampMove.turnOff();
    document.getElementById("moveLampSwitch").innerHTML = "On ";
  }
  else{
    isOn_moveLamp = true;
    lampMove.turnOn();
    document.getElementById("moveLampSwitch").innerHTML = "Off";
  }

}



//cameraWalking variables
var Wkey = 0;
var Skey = 0;
var Akey = 0;
var Dkey = 0;
var Qkey = 0;
var Ekey = 0;
var Rkey = 0;
var Fkey = 0;

//cameraRotateView variables
var Ikey = 0;
var Kkey = 0;
var JKey = 0;
var LKey = 0;
var UKey = 0;
var OKey = 0;


function keydown(ev) {
//------------------------------------------------------
//HTML calls this'Event handler' or 'callback function' when we press a key:

  switch(ev.keyCode) {      // keycodes !=ASCII, but are very consistent for 
  //  nearly all non-alphanumeric keys for nearly all keyboards in all countries.

    //cameraWalking
    case 87: Wkey = 1; break;
    case 83: Skey = 1; break;
    case 65: Akey = 1; break;
    case 68: Dkey = 1; break;
    case 81: Qkey = 1; break;
    case 69: Ekey = 1; break;

    //cameraRotateView
    case 73: Ikey = 1; break;
    case 75: Kkey = 1; break;
    case 74: JKey = 1; break;
    case 76: LKey = 1; break;
    case 85: UKey = 1; break;
    case 79: OKey = 1; break;
    default:
      console.log('myKeyDown()--keycode=', ev.keyCode, ', charCode=', ev.charCode);
     
      break;
  }
}

function keyup(ev) {

  switch(ev.keyCode) { 

    //moveCamera
    case 87: Wkey = 0; break;
    case 83: Skey = 0; break;
    case 65: Akey = 0; break;
    case 68: Dkey = 0; break;
    case 81: Qkey = 0; break;
    case 69: Ekey = 0; break;

    //cameraRotateView
    case 73: Ikey = 0; break;
    case 75: Kkey = 0; break;
    case 74: JKey = 0; break;
    case 76: LKey = 0; break;
    case 85: UKey = 0; break;
    case 79: OKey = 0; break;
  

    default:
      console.log('myKeyUp()--keycode=', ev.keyCode, ', charCode=', ev.charCode);
     
      break;
  }

}

var EyeX = 0, EyeY = 4.0, EyeZ = -21;
var AtX = 0, AtY = 4.0, AtZ = -20;
var UpX = 0, UpY = 1, UpZ = 0;

function moveCamera(){

  if(Wkey==1){
    var ex = EyeX;
    var ey = EyeY;
    var ez = EyeZ;
    var ax = AtX;
    var ay = AtY;
    var az = AtZ;
    var viewlength = Math.sqrt((az - ez)*(az - ez) + (ay - ey)*(ay - ey) + (ax - ex)*(ax - ex));
    AtZ += 0.05*(az - ez)/viewlength;
    EyeZ += 0.05*(az - ez)/viewlength;
    AtX += 0.05*(ax - ex)/viewlength;
    EyeX += 0.05*(ax - ex)/viewlength;
  }

  if(Skey==1){
    var ex = EyeX;
    var ey = EyeY;
    var ez = EyeZ;
    var ax = AtX;
    var ay = AtY;
    var az = AtZ;
    var viewlength = Math.sqrt((az - ez)*(az - ez) + (ay - ey)*(ay - ey) + (ax - ex)*(ax - ex));
    AtZ -= 0.05*(az - ez)/viewlength;
    EyeZ -= 0.05*(az - ez)/viewlength;
    AtX -= 0.05*(ax - ex)/viewlength;
    EyeX -= 0.05*(ax - ex)/viewlength;
  }

  if(Akey==1){
    var ex = EyeX;
    var ey = EyeY;
    var ez = EyeZ;
    var ax = AtX;
    var ay = AtY;
    var az = AtZ;
    var viewlength = Math.sqrt((az - ez)*(az - ez) + (ay - ey)*(ay - ey) + (ax - ex)*(ax - ex));
    AtZ -= 0.05*(ax - ex)/viewlength;
    EyeZ -= 0.05*(ax - ex)/viewlength;
    AtX += 0.05*(az - ez)/viewlength;
    EyeX += 0.05*(az - ez)/viewlength;

  }

  if(Dkey==1){
    var ex = EyeX;
    var ey = EyeY;
    var ez = EyeZ;
    var ax = AtX;
    var ay = AtY;
    var az = AtZ;
    var viewlength = Math.sqrt((az - ez)*(az - ez) + (ay - ey)*(ay - ey) + (ax - ex)*(ax - ex));
    AtZ += 0.05*(ax - ex)/viewlength;
    EyeZ += 0.05*(ax - ex)/viewlength;
    AtX -= 0.05*(az - ez)/viewlength;
    EyeX -= 0.05*(az - ez)/viewlength;
  }

  if(Qkey==1){
    var ex = EyeX;
    var ey = EyeY;
    var ez = EyeZ;
    var ax = AtX;
    var ay = AtY;
    var az = AtZ;
    var viewlength = Math.sqrt((az - ez)*(az - ez) + (ay - ey)*(ay - ey) + (ax - ex)*(ax - ex));
    AtY += 0.05*viewlength;
    EyeY += 0.05*viewlength;
  }

  if(Ekey==1){
    var ex = EyeX;
    var ey = EyeY;
    var ez = EyeZ;
    var ax = AtX;
    var ay = AtY;
    var az = AtZ;
    var viewlength = Math.sqrt((az - ez)*(az - ez) + (ay - ey)*(ay - ey) + (ax - ex)*(ax - ex));
    AtY -= 0.05*viewlength;
    EyeY -= 0.05*viewlength;
  }
}


var light_move_X = 0.0, light_move_Y = 3.0, light_move_Z = 0.0;

function moveLight(){

  if(Ikey==1){
    light_move_Z+=0.05;
  }

  if(Kkey==1){
    light_move_Z-=0.05;
  }

  if(JKey==1){
    light_move_X+=0.05;
  }

  if(LKey==1){
    light_move_X-=0.05;
  }

  if(UKey==1){
    light_move_Y+=0.05;
  }

  if(OKey==1){
    light_move_Y-=0.05;
  }

}


function draw() {

  // Clear <canvas> color AND DEPTH buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//==============================================================================
  
  // draw perspective
  gl.viewport(0,                              // Viewport lower-left corner
              0,                              // (x,y) location(in pixels)
              canvas.width,         // viewport width, height.
              canvas.height);

  var vpAspect = canvas.width /      // On-screen aspect ratio for
                canvas.height;   // this camera: width/height.

  projMatrix.setPerspective(40, vpAspect, 1, 100);

  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

  
  moveCamera();

  eyePosWorld.set([EyeX, EyeY, EyeZ]);
  gl.uniform3fv(u_eyePosWorld, eyePosWorld);

  //============set head lamp position==============
  lampHead.setPos([EyeX,EyeY,EyeZ]);
  //============set head lamp position==============

  viewMatrix.setLookAt(EyeX, EyeY, EyeZ,   // eye position
                        AtX, AtY, AtZ,                // look-at point (origin)
                        UpX, UpY, UpZ);               // up vector (+y)

  

  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  // Draw the scene:
  drawMyScene();
}


function drawMyScene() {


  drawTree(3, 1.7, 0, 0.4);
  

  // for(var i = 0; i< 22; i++){
  //   drawTetrahedron(6*Math.sin(i*15),-0.6,6*Math.cos(i*15),0.5,i+1);
  // }

  drawSnowman(0,0.6,3,0.4,12);

  drawGround();
 
  moveLight();
  drawLight();


}

function drawTetrahedron(x,y,z,scale,matNo){
  modelMatrix.setTranslate(x,y,z);
  modelMatrix.scale(scale,scale,scale);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  mat.setMaterialByIndex(matNo);

   gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                tetStart/floatsPerVertex, // start at this vertex number, and 
                tetVerts.length/floatsPerVertex); // draw this many vertices.

}


function drawLight(){
  var scale = 0.4;
  modelMatrix.setIdentity();
  modelMatrix.translate(light_move_X,light_move_Y,light_move_Z);
  modelMatrix.scale(scale, scale, scale);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      // Draw just the sphere's vertices

  lampMove.setPos([light_move_X, light_move_Y, light_move_Z]);

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();

  modelMatrix.rotate(currentAngle * 2, 1, 1, 1);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  mat.setMaterialByInput(
                  [1.0, 1.0, 0.0, 1.0],
                  [1.0, 1.0, 0.0, 1.0],
                  [1.0, 1.0, 0.0, 1.0],
                  [1.0, 1.0, 0.0, 1.0],
                  128);  
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                sphStart/floatsPerVertex, // start at this vertex number, and 
                sphVerts.length/floatsPerVertex); // draw this many vertices.

  
  modelMatrix.setIdentity();
  modelMatrix.translate(light_move_X,light_move_Y,light_move_Z);
  modelMatrix.scale(scale*1.6, scale*1.6, scale*1.6);
  modelMatrix.rotate(currentAngle * 2, 0, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  mat.setMaterialByInput(
                  [0.6, 0.0, 1.0, 1.0],
                  [0.6, 0.0, 1.0, 1.0],
                  [0.6, 0.0, 1.0, 1.0],
                  [0.6, 0.0, 1.0, 1.0],
                  128);  
  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                torStart/floatsPerVertex, // start at this vertex number, and 
                torVerts.length/floatsPerVertex);

  modelMatrix.setTranslate(light_move_X,light_move_Y - 1,light_move_Z);
  modelMatrix.scale(scale * 1.5,scale * 1.5,scale * 1.5);
  modelMatrix.rotate(22.5, 1, 0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  mat.setMaterialByInput(
                    [1.0, 0.0, 0.0, 1.0],
                    [0.0, 0.0, 0.0, 1.0],
                    [0.0, 0.5, 1.0, 1.0],
                    [0.0, 0.0, 0.0, 1.0],
                    1);


   gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                tetStart/floatsPerVertex, // start at this vertex number, and 
                tetVerts.length/floatsPerVertex); 
}


function drawGround(){

  modelMatrix.setIdentity();


  modelMatrix.setRotate(-90.0, 1,0,0);  // new one has "+z points upwards",
                                      // made by rotating -90 deg on +x-axis.
                                      // Move those new drawing axes to the 
                                      // bottom of the trees:
  modelMatrix.translate(0.0, 0.0, -0.6);  
  modelMatrix.scale(0.4, 0.4,0.4);    // shrink the drawing axes 
                                      //for nicer-looking ground-plane, and
  // Pass the modified view matrix to our shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);


  mat.setMaterialByIndex(1);
                  
  
  // Now, using these drawing axes, draw our ground plane: 
  gl.drawArrays(gl.TRIANGLE_STRIP,             // use this drawing primitive, and
                gndStart/floatsPerVertex, // start at this vertex number, and
                gndVerts.length/floatsPerVertex);   // draw this many vertices
}

function drawSnowman(x,y,z,scale,matNo){

  modelMatrix.setTranslate(0, -0.6, 0);
  modelMatrix.translate(x, y + 1, z); 

  modelMatrix.rotate(90,1,0,0);

  modelMatrix.scale(scale,scale,-scale);

  pushMatrix(modelMatrix);

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  mat.setMaterialByIndex(13);

  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                torStart/floatsPerVertex, // start at this vertex number, and
                torVerts.length/floatsPerVertex); // draw this many vertices.


  modelMatrix.setTranslate(x,y,z);
  modelMatrix.scale(scale,scale,scale);

  pushMatrix(modelMatrix);
  // pushMatrix(modelMatrix);

  modelMatrix.scale(1.2,1.2,1.2);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      // Draw just the sphere's vertices

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  mat.setMaterialByIndex(20);

  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                sphStart/floatsPerVertex, // start at this vertex number, and 
                sphVerts.length/floatsPerVertex); // draw this many vertices.

  modelMatrix.setTranslate(x + 0.25,y + 0.1 ,z - 0.45);
  modelMatrix.scale(scale / 6,scale / 6,scale / 6);

  pushMatrix(modelMatrix);
  // pushMatrix(modelMatrix);

  modelMatrix.scale(1.2,1.2,1.2);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      // Draw just the sphere's vertices

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  mat.setMaterialByIndex(5);

  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                sphStart/floatsPerVertex, // start at this vertex number, and 
                sphVerts.length/floatsPerVertex); // draw this many vertices.

  modelMatrix.setTranslate(x - 0.25,y + 0.1 ,z - 0.45);
  modelMatrix.scale(scale / 6,scale / 6,scale / 6);

  pushMatrix(modelMatrix);

  modelMatrix.scale(1.2,1.2,1.2);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      // Draw just the sphere's vertices

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  mat.setMaterialByIndex(5);

  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                sphStart/floatsPerVertex, // start at this vertex number, and 
                sphVerts.length/floatsPerVertex);

  modelMatrix.setTranslate(x,y - 1,z);
  modelMatrix.scale(scale * 1.5,scale * 1.5,scale * 1.5);
  modelMatrix.rotate(22.5, 1, 0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  mat.setMaterialByInput(
                    [0.0, 0.0, 0.0, 1.0],
                    [0.0, 0.0, 0.0, 1.0],
                    [0.0, 0.5, 1.0, 1.0],
                    [0.0, 0.0, 0.0, 1.0],
                    1);


   gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                tetStart/floatsPerVertex, // start at this vertex number, and 
                tetVerts.length/floatsPerVertex); // draw this many vertices.

}

function drawTree(x, y, z, scale){

  for (var i = 0; i < 6; i++) {
    modelMatrix.setTranslate(x,y - 0.4*i,z);
    modelMatrix.scale(scale * 1.5 + 0.1 * i,scale * 1.5 + 0.1 * i,scale * 1.5 + 0.1 * i);
    modelMatrix.rotate(22.5, 1, 0, 0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    mat.setMaterialByIndex(2);

    gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                tetStart/floatsPerVertex, // start at this vertex number, and 
                tetVerts.length/floatsPerVertex); // draw this many vertices.
  };
  
  modelMatrix.setTranslate(x,y + 0.5,z + 0.2);
  modelMatrix.scale(scale,scale,scale);

  pushMatrix(modelMatrix);

  modelMatrix.scale(0.5,0.5,0.5);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      // Draw just the sphere's vertices

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  mat.setMaterialByInput(
                  [1.0, 0.0, 0.0, 1.0],
                  [1.0, 0.0, 0.0, 1.0],
                  [1.0, 0.0, 0.0, 1.0],
                  [1.0, 0.0, 0.0, 1.0],
                  128);

  gl.drawArrays(gl.TRIANGLE_STRIP,        // use this drawing primitive, and
                sphStart/floatsPerVertex, // start at this vertex number, and 
                sphVerts.length/floatsPerVertex);
}

function winResize() {
//==============================================================================
// Called when user re-sizes their browser window , because our HTML file
// contains:  <body onload="main()" onresize="winResize()">

  canvas = document.getElementById('webgl');  // get current canvas
  gl = getWebGLContext(canvas);             // and context:

  
  //Make canvas fill the  browser window:
  canvas.width = innerWidth;
  canvas.height = innerHeight*0.90;
  //IMPORTANT!  need to re-draw screen contents
  //draw();
     
}

//===================Mouse and Keyboard event-handling Callbacks

// Global vars for mouse click-and-drag for rotation.
var isDrag=false;   // mouse-drag: true when user holds down mouse button
var xMclik=0.0;     // last mouse button-down position (in CVV coords)
var yMclik=0.0;   
var xMdragTot=0.0;  // total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot=0.0;  

function myMouseDown(ev) {

  var rect = ev.target.getBoundingClientRect(); 
  var xp = ev.clientX - rect.left;  
  var yp = canvas.height - (ev.clientY - rect.top); 


  var x = (xp - canvas.width/2)  / (canvas.width/2);
  var y = (yp - canvas.height/2) / (canvas.height/2);
  
  isDrag = true; 
  xMclik = x; 
  yMclik = y;
};


function myMouseMove(ev) {


  if(isDrag==false) return;  


  var rect = ev.target.getBoundingClientRect(); 
  var xp = ev.clientX - rect.left;                  
  var yp = canvas.height - (ev.clientY - rect.top); 


  var x = (xp - canvas.width/2) /(canvas.width/2);     
  var y = (yp - canvas.height/2) /(canvas.height/2);

  //====================camera angle control==========================

  AtY -= 0.5*(y - yMclik);
  AtZ = EyeZ + Math.cos(0.5*(xMdragTot));
  AtX = EyeX + Math.sin(0.5*(xMdragTot));


  //====================camera angle control==========================

  xMdragTot += (x - xMclik);      
  yMdragTot += (y - yMclik);
  xMclik = x;               
  yMclik = y;
};

function myMouseUp(ev) {

  var rect = ev.target.getBoundingClientRect(); 
  var xp = ev.clientX - rect.left;                 
  var yp = canvas.height - (ev.clientY - rect.top); 

  

  var x = (xp - canvas.width/2)  / (canvas.width/2);
  var y = (yp - canvas.height/2) / (canvas.height/2);
  
  isDrag = false;   
  xMdragTot += (x - xMclik);
  yMdragTot += (y - yMclik);
};


// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();

function animate() {
//==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  
  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
//  if(angle >  120.0 && ANGLE_STEP_hand > 0) ANGLE_STEP_hand = -ANGLE_STEP_hand;
//  if(angle < -120.0 && ANGLE_STEP_hand < 0) ANGLE_STEP_hand = -ANGLE_STEP_hand;

  currentAngle = currentAngle + (ANGLE_STEP * elapsed) / 1000.0;
  currentAngle %= 360;
  
  if(currentAngle_wing >   30.0 && ANGLE_STEP_hand > 0) ANGLE_STEP_hand = -ANGLE_STEP_hand;
  if(currentAngle_wing <  0.0 && ANGLE_STEP_hand < 0) ANGLE_STEP_hand = -ANGLE_STEP_hand;
  
  currentAngle_wing = currentAngle_wing + (ANGLE_STEP_hand * elapsed) / 5000.0;
  currentAngle_wing %= 360;
}
