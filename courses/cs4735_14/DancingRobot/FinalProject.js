// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_MdlMatrix;\n' +
  'uniform mat4 u_NMdlMatrix;\n' +
  'uniform float u_NormalDirection;\n' +
  'varying vec4 v_Color;\n' +
  'varying vec4 v_Position;\n' +
  'varying vec4 v_Normal;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * u_MdlMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '  v_Position = u_MdlMatrix * a_Position;\n' +
  '  v_Normal = u_NormalDirection * u_NMdlMatrix *a_Normal;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE = 
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +
  'varying vec4 v_Position;\n' +
  'varying vec4 v_Normal;\n' +
  'uniform vec4 u_Ambient;\n' +
  'uniform vec4 u_Diffuse;\n' +
  'uniform vec4 c_black;\n' +
  'uniform vec4 c_white;\n' +
  'uniform vec4 u_Specular;\n' +
  'uniform vec4 u_LightLocation;\n' +
  'uniform float u_Floor;\n' +
  'uniform vec4 u_Eye;\n' +
  'void main() {\n' +
  ' if(u_Floor == 0.0) {\n' +
  '  float nDotL = max(0.0, dot(normalize(v_Normal), normalize(u_LightLocation-v_Position)));\n' +
  '  float hDotL = max(0.0, dot(normalize(v_Normal), normalize(normalize(u_LightLocation-v_Position)+normalize(u_Eye-v_Position))));\n' +
  '  gl_FragColor = v_Color*u_Ambient + v_Color*u_Diffuse*nDotL + v_Color*u_Specular*pow(hDotL, 256.0);\n' +
   '}\n' +
  ' else { if (v_Position.y != 0.0) { \n' +
  '   if ((mod(1.0 * (v_Position.z + 0.5), 1.0) < 0.5) ^^ (mod(1.0 * (v_Position.x + 0.5), 1.0) < 0.5))\n' +
      'gl_FragColor = c_black;\n' + 
  '   else\n' +
  '     gl_FragColor = c_white;}\n' +
  '}\n' +

  '}\n';

// light movement variables
 var moveX = 0;
 var moveZ = 0;

var ZoomZ = 11;
var discoAngle = 20;

var xEtra = 0;
var zEtra = 0;

// Program for the shader   
var cubeProg;

// Counters to toggle dance moves 
var danceCounters = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

// Delta in time for physics 
var dt = 0.0;

// Colors
var RED=new Float32Array([1, 0, 0]);
var WHITE=new Float32Array([1, 1, 1]);
var GRAY=new Float32Array([0.5, 0.5, 0.5]);
var SILVER=new Float32Array([0.75, 0.75, 0.75]);
var BLACK=new Float32Array([0.0, 0.0, 0.0]);
var BLUE=new Float32Array([0.0, 0.0, 1.0]);
var GREEN=new Float32Array([0.0, 1.0, 0.0]);
var LIGHTBLUE=new Float32Array([0.0, 1.0, 1.0]);

// Create Data Structure For Robot Parts
var robotDataStructure = {
  robot: {
    attributes: {rotateRange: [357, 0], translateRange: [0.2, -0.09], rotate: [0, -1, 1, 0], translate: [0.0, 0.0, 0.0], partAngleSpeed: 0.0, partSpeed: [0.0, 0.0, 0.0], partTransAcceleration: [0.000000, 0.0, 0.000000], partSpeed: [0.0, 0.0, 0.0], partTransAcceleration: [0.000000, 0.0, 0.000000], partAcceleration: 0.00000, control: controlFunction, transControl: transControlFunction, rotationType: 0},
    children: {
      topCore: {
        attributes: {rotateRange: [357, 0], translateRange: [0.5, -0.2], rotate: [0, -1, -1, 0], translate: [0.0, 0.0, 0.0], partAngleSpeed: 0.0, partSpeed: [0.0, 0.0, 0.0], partTransAcceleration: [0.000000, 0.0, 0.000000], partAcceleration: 0.00000, control: controlFunction, transControl: transControlFunction, transControl: transControlFunction, rotationType: 0, joint: [0.0, 0.4, 0.0]},
        children: {
          robotHead: { 
            attributes: {rotateRange: [357, 0], translateRange: [0.5, -0.2], rotate: [0, -1, -1, 0], translate: [0.0, 0.0, 0.0], partAngleSpeed: 0.0, partSpeed: [0.0, 0.0, 0.0], partTransAcceleration: [0.000000, 0.0, 0.000000], partAcceleration: 0.00000, control: controlFunction, transControl: transControlFunction, transControl: transControlFunction, rotationType: 0, joint: [0.0, 0.9, 0.0]},
            children: {
              robotHeadShell: {
                attributes: {translate: [0.0, 0.9, 0.0], scale: [0.12, 0.17, 0.12], rotateRange: [357, 0] , partType: 0, translateRange: [0.5, -0.2], rotate: [0, 0, 1, 0], cubeColors: [null, GRAY, GRAY, GRAY, GRAY, GRAY], partAngleSpeed: 0.0, partSpeed: [0.0, 0.0, 0.0], partTransAcceleration: [0.000000, 0.0, 0.000000], partAcceleration: 0.00000, control: controlFunction, transControl: transControlFunction, transControl: transControlFunction, rotationType: 0}  
              },
              robotHeadInnerShell: {
                attributes: {translate: [0.0, 0.93, 0.0], scale: [0.10, 0.12, 0.11], rotateRange: [357, 0] , partType: 0, translateRange: [0.5, -0.2], rotate: [0, 0, 1, 0], cubeColors: [null, BLACK, BLACK, BLACK, BLACK, BLACK], partAngleSpeed: 0.0, partSpeed: [0.0, 0.0, 0.0], partTransAcceleration: [0.000000, 0.0, 0.000000], partAcceleration: 0.00000, control: controlFunction, transControl: transControlFunction, rotationType: 0}  
              },
              robotMiddleMouth: {
                attributes: {translate: [0, 0.9, 0], scale: [0.07, 0.02, 0.02], rotateRange: [357, 0] , partType: 2, translateRange: [0.5, -0.2], rotate: [0, 0, 1, 0], cubeColors: [WHITE, WHITE, WHITE, WHITE, WHITE, WHITE], partAngleSpeed: 0.0, partSpeed: [0.0, 0.0, 0.0], partTransAcceleration: [0.000000, 0.0, 0.000000], partAcceleration: 0.00000, control: controlFunction, transControl: transControlFunction, rotationType: 0}
              },
              robotRightEye: {
                attributes: {translate: [-0.04, 1.0, 0], scale: [0.02, 0.02, 0.02], rotateRange: [357, 0] , partType: 2, translateRange: [0.5, -0.2], rotate: [0, 0, 1, 0], cubeColors: [LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE], partAngleSpeed: 0.0, partSpeed: [0.0, 0.0, 0.0], partTransAcceleration: [0.000000, 0.0, 0.000000], partAcceleration: 0.00000, control: controlFunction, transControl: transControlFunction, rotationType: 0}
              },
              robotLeftEye: {
                attributes: {translate: [0.04, 1.0, 0], scale: [0.02, 0.02, 0.02], rotateRange: [357, 0] , partType: 2, translateRange: [0.5, -0.2], rotate: [0, 0, 1, 0], cubeColors: [LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE], partAngleSpeed: 0.0, partSpeed: [0.0, 0.0, 0.0], partTransAcceleration: [0.000000, 0.0, 0.000000], partAcceleration: 0.00000, control: controlFunction, transControl: transControlFunction, rotationType: 0}
              }
            }
          },
          topTorso: {
            attributes: {translate: [0.0, 0.6, -0.05], scale: [0.3, 0.2, 0.2], rotateRange: [357, 0], partType: 0, translateRange: [0.5, -0.2], rotate: [0, 0, 1, 0], cubeColors: [GRAY, GRAY, GRAY, GRAY, GRAY, GRAY]}
          }, 
          robotRightArm: { 
            attributes: {rotateRange: [357, 0], translateRange: [0.5, -0.2], rotate: [0, 0, 0, 1], translate: [0.0, 0.0, 0.0], partAngleSpeed: 0.0, partSpeed: [0.0, 0.0, 0.0], partTransAcceleration: [0.000000, 0.0, 0.000000], partAcceleration: 0.00000, control: controlFunction, transControl: transControlFunction, rotationType: 0, joint: [-0.4, 0.7, -0.05]},
            children: {
              shoulder: {
                attributes: {translate: [-0.4, 0.7, -0.05], scale: [0.13, 0.13, 0.13], rotateRange: [357, 0] , partType: 0, translateRange: [0.5, -0.2], rotate: [0, 0, 1, 0], cubeColors: [GRAY, GRAY, GRAY, GRAY, GRAY, GRAY]}
              }, 
              topArm: {
                attributes: {translate: [-0.42, 0.5, -0.05], scale: [0.08, 0.25, 0.08], rotateRange: [357, 0] , partType: 1, translateRange: [0.5, -0.2], rotate: [0, 0, 1, 0], cubeColors: [SILVER, SILVER, SILVER, SILVER, SILVER, SILVER]}
              }, 
              bottomArm: {
                attributes: {rotateRange: [357, 0], translateRange: [0.5, -0.2], rotate: [0, -1, 0, 0], translate: [0.0, 0.0, 0.0], partAngleSpeed: 0.0, partSpeed: [0.0, 0.0, 0.0], partTransAcceleration: [0.000000, 0.0, 0.000000], partAcceleration: 0.00000, control: controlFunction, transControl: transControlFunction, rotationType: 0, joint: [-0.42, 0.18, -0.05]},
                children: {
                  foreArm: {
                    attributes: {translate: [-0.42, 0.1, -0.05], scale: [0.11, 0.17, 0.11], rotateRange: [357, 0] , partType: 0, translateRange: [0.5, -0.2], rotate: [0, 0, 1, 0], cubeColors: [GRAY, GRAY, GRAY, GRAY, GRAY, GRAY]}
                  }, 
                  hand: {
                    attributes: {translate: [-0.42, -0.14, -0.05], scale: [0.07, 0.07, 0.07], rotateRange: [357, 0] , partType: 0, translateRange: [0.5, -0.2], rotate: [0, 0, 1, 0], cubeColors: [SILVER, SILVER, SILVER, SILVER, SILVER, SILVER]}
                  }
                }
              }
            }
          },
          robotLeftArm: {
            attributes: {rotateRange: [357, 0], translateRange: [0.5, -0.2], rotate: [0, -1, 0, 0], translate: [0.0, 0.0, 0.0], partAngleSpeed: 0.0, partSpeed: [0.0, 0.0, 0.0], partTransAcceleration: [0.000000, 0.0, 0.000000], partAcceleration: 0.00000, control: controlFunction, transControl: transControlFunction, rotationType: 0, joint: [0.4, 0.7, -0.05]},
            children: {
              shoulder: {
                attributes: {translate: [0.4, 0.7, -0.05], scale: [0.13, 0.13, 0.13], rotateRange: [357, 0] , partType: 0, translateRange: [0.5, -0.2], rotate: [0, 0, 1, 0], cubeColors: [GRAY, GRAY, GRAY, GRAY, GRAY, GRAY]}
              }, 
              topArm: {
                attributes: {translate: [0.42, 0.5, -0.05], scale: [0.08, 0.25, 0.08], rotateRange: [357, 0] , partType: 1, translateRange: [0.5, -0.2], rotate: [0, 0, 1, 0], cubeColors: [SILVER, SILVER, SILVER, SILVER, SILVER, SILVER]}
              }, 
              bottomArm: {
                attributes: {rotateRange: [357, 0], translateRange: [0.5, -0.2], rotate: [0, 0, 1, 0], translate: [0.0, 0.0, 0.0], partAngleSpeed: 0.0, partSpeed: [0.0, 0.0, 0.0], partTransAcceleration: [0.000000, 0.0, 0.000000], partAcceleration: 0.00000, control: controlFunction, transControl: transControlFunction, rotationType: 0, joint: [0.42, 0.27, -0.11]},
                children: {
                  foreArm: {
                    attributes: {translate: [0.42, 0.1, -0.05], scale: [0.11, 0.17, 0.11], rotateRange: [357, 0] , partType: 0, translateRange: [0.5, -0.2], rotate: [0, 0, 1, 0], cubeColors: [GRAY, GRAY, GRAY, GRAY, GRAY, GRAY]}
                  }, 
                  hand: {
                    attributes: {translate: [0.42, -0.14, -0.05], scale: [0.07, 0.07, 0.07], rotateRange: [357, 0] , partType: 0, translateRange: [0.5, -0.2], rotate: [0, 0, 1, 0], cubeColors: [SILVER, SILVER, SILVER, SILVER, SILVER, SILVER]}
                  }
                }
              }
            }
          }
        }
      },
      bottomCore: {
        attributes: {rotateRange: [357, 0], translateRange: [0.5, -0.2], rotate: [0, 1, 1, 0], translate: [0.0, 0.0, 0.0], partAngleSpeed: 0.0, partSpeed: [0.0, 0.0, 0.0], partTransAcceleration: [0.000000, 0.0, 0.000000], partAcceleration: 0.00000, control: controlFunction, transControl: transControlFunction, rotationType: 0, joint: [0.0, 0.15, -0.05]},
        children: {
          bottomTorso: {
            attributes: {translate: [0.0, 0.15, -0.05], scale: [0.23, 0.25, 0.17], rotateRange: [357, 0] , partType: 1, translateRange: [0.5, -0.2], rotate: [0, 0, 1, 0], cubeColors: [SILVER, SILVER, SILVER, SILVER, SILVER, SILVER], rotateRange: [357, 0], translateRange: [0.5, -0.2], rotate: [0, 1, 1, 0], partAngleSpeed: 0.0, partSpeed: [0.0, 0.0, 0.0], partTransAcceleration: [0.000000, 0.0, 0.000000], partAcceleration: 0.00000, control: controlFunction, transControl: transControlFunction, rotationType: 0}
          },
          robotLeftLeg: {
            attributes: {rotateRange: [357, 0], translateRange: [0.5, -0.2], rotate: [0, 0, 0, 1], translate: [0.0, 0.0, 0.0], partAngleSpeed: 0.0, partSpeed: [0.0, 0.0, 0.0], partTransAcceleration: [0.000000, 0.0, 0.000000], partAcceleration: 0.00000, control: controlFunction, transControl: transControlFunction, rotationType: 0, joint: [0.17, -0.28, -0.05]},
            children: {  
              topLeg: { 
                attributes: {translate: [0.17, -0.30, -0.05], scale: [0.12, 0.2, 0.13], rotateRange: [357, 0] , partType: 1, translateRange: [0.5, -0.2], rotate: [0, 0, 1, 0], cubeColors: [GRAY, GRAY, GRAY, GRAY, GRAY, GRAY]}
              }, 
              bottomLeg: {
                attributes: {rotateRange: [357, 0], translateRange: [0.5, -0.2], rotate: [0, 1, 1, 0], translate: [0.0, 0.0, 0.0], partAngleSpeed: 0.0, partSpeed: [0.0, 0.0, 0.0], partTransAcceleration: [0.000000, 0.0, 0.000000], partAcceleration: 0.00000, control: controlFunction, transControl: transControlFunction, rotationType: 0, joint: [0.17, -0.68, -0.05]},
                children: {
                  calf: {
                    attributes: {translate: [0.17, -0.70, -0.05], scale: [0.075, 0.2, 0.075], rotateRange: [357, 0] , partType: 1, translateRange: [0.5, -0.2], rotate: [0, 0, 1, 0], cubeColors: [SILVER, SILVER, SILVER, SILVER, SILVER, SILVER]} 
                  },
                  foot: {
                    attributes: {translate: [0.17, -0.90, 0.0], scale: [0.1, 0.1, 0.2], rotateRange: [357, 0] , partType: 0, translateRange: [0.5, -0.2], rotate: [0, 1, 0, 0], cubeColors: [SILVER, SILVER, SILVER, SILVER, SILVER, SILVER]}
                  }
                }
              }
            }
          },
          robotRightLeg: {
            attributes: {rotateRange: [357, 0], translateRange: [0.5, -0.2], rotate: [0, 0, 0, 1], translate: [0.0, 0.0, 0.0], partAngleSpeed: 0.0, partSpeed: [0.0, 0.0, 0.0], partTransAcceleration: [0.000000, 0.0, 0.000000], partAcceleration: 0.00000, control: controlFunction, transControl: transControlFunction, rotationType: 0, joint: [-0.17, -0.28, -0.05]},
            children: {  
              topLeg: { 
                attributes: {translate: [-0.17, -0.30, -0.05], scale: [0.12, 0.2, 0.13], rotateRange: [357, 0] , partType: 1, translateRange: [0.5, -0.2], rotate: [0, 0, 1, 0], cubeColors: [GRAY, GRAY, GRAY, GRAY, GRAY, GRAY]}
              }, 
              bottomLeg: {
                attributes: {rotateRange: [357, 0], translateRange: [0.5, -0.2], rotate: [0, -1, -1, 0], translate: [0.0, 0.0, 0.0], partAngleSpeed: 0.0, partSpeed: [0.0, 0.0, 0.0], partTransAcceleration: [0.000000, 0.0, 0.000000], partAcceleration: 0.00000, control: controlFunction, transControl: transControlFunction, rotationType: 0, joint: [-0.17, -0.68, -0.05]},
                children: {
                  calf: {
                    attributes: {translate: [-0.17, -0.70, -0.05], scale: [0.075, 0.2, 0.075], rotateRange: [357, 0] , partType: 1, translateRange: [0.5, -0.2], rotate: [0, 0, 1, 0], cubeColors: [SILVER, SILVER, SILVER, SILVER, SILVER, SILVER]} 
                  },
                  foot: {
                    attributes: {translate: [-0.17, -0.90, 0.0], scale: [0.1, 0.1, 0.2], rotateRange: [357, 0] , partType: 0, translateRange: [0.5, -0.2], rotate: [0, 1, 0, 0], cubeColors: [SILVER, SILVER, SILVER, SILVER, SILVER, SILVER]}
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};


// Control function for robot rotations
function controlFunction(node){
  if(node.attributes.rotate[0] > node.attributes.rotateRange[0] && node.attributes.partAcceleration > 0.0) {
    node.attributes.partAcceleration *= node.attributes.rotationType;
    if (node.attributes.rotationType == 0){ 
      node.attributes.partAngleSpeed = 0.0;
    }
  }
  if(node.attributes.rotate[0] < node.attributes.rotateRange[1] && node.attributes.partAcceleration < 0.0) {
    node.attributes.partAcceleration *= -1;
  }
};

// Control function for robot translations 
function transControlFunction(node){
  for(var i = 0; i < 3; i++) {
    if(node.attributes.translate[i] > node.attributes.translateRange[0] && node.attributes.partTransAcceleration[i] > 0.0) {
      node.attributes.partTransAcceleration[i] *= -1;
      
    }
    if(node.attributes.translate[i] < -node.attributes.translateRange[1] && node.attributes.partTransAcceleration[i] < 0.0) {
      node.attributes.partTransAcceleration[i] *= -0;
      node.attributes.partSpeed[i] = 0.0;
    } 
  } 
};

 
function main() {
  // Retrieve <canvas> & <hud> element
  var canvas = document.getElementById('webgl');
  var hud = document.getElementById('hud');


  if (!canvas || !hud) { 
    console.log('Failed to get HTML elements');
    return false; 
  }  

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);

  // Get the rendering context for 2DCG
  var ctx = hud.getContext('2d');

  if (!gl || !ctx) {
    console.log('Failed to get rendering context');
    return;
  }

  // Initialize shaders
  cubeProg = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);

  if (!cubeProg) {
    console.log('Failed to intialize shader.');
    return;
  }


/* CUBE PROGRAM */
  // Get the storage location of u_MvpMatrix
  var u_MvpMatrix = gl.getUniformLocation(cubeProg, 'u_MvpMatrix');
  if (!u_MvpMatrix) {
    console.log('Failed to get the storage location of u_MvpMatrix');
    return;
  }
  
    // Get the storage location of u_MdlMatrix
  var u_MdlMatrix = gl.getUniformLocation(cubeProg, 'u_MdlMatrix');
  if (!u_MdlMatrix) {
    console.log('Failed to get the storage location of u_MdlMatrix');
    return;
  }
  
  // Get the storage location of u_NMdlMatrix
  var u_NMdlMatrix = gl.getUniformLocation(cubeProg, 'u_NMdlMatrix');
  if (!u_NMdlMatrix) {
    console.log('Failed to get the storage location of u_NMdlMatrix');
    return;
  }

  // Get the storage location of u_Floor
  var u_Floor = gl.getUniformLocation(cubeProg, 'u_Floor');
  if (!u_Floor) {
    console.log('Failed to get the storage location of u_Floor');
    return;
  }

    // Get storage location of c_white
  var c_white = gl.getUniformLocation(cubeProg, 'c_white');
  if (!c_white) { 
    console.log('Failed to get the storage location of c_white');
    return;
  }
  
  // Get storage location of c_black
  var c_black = gl.getUniformLocation(cubeProg, 'c_black');
  if (!c_black) { 
    console.log('Failed to get the storage location of c_black');
    return;
  }
  
  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  gl.useProgram(cubeProg);

  gl.uniform4f(c_white, 1, 0, 1, 1);
  gl.uniform4f(c_black, 0, 1, 1, 1);
  gl.uniform1f(u_Floor, 1.0);
  
  // Set the eye point and the viewing volume
  var EYE=new Float32Array([0, 0, 6]);
  var mvpMatrix = new Matrix4();
  mvpMatrix.setPerspective(30, 1, 1, 100);
  mvpMatrix.lookAt(EYE[0], EYE[1], EYE[2], 0, 0, 0, 0, 1, 0);

  // Pass the model view projection matrix to u_MvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  var mdlMatrix = new Matrix4();
  mdlMatrix.setIdentity();  
  
  setupLight(gl, EYE);

  var currentAngle = new Float32Array([0, 0, 0]);
  initEventHandlers(canvas, currentAngle); 
    
var tick = function() {   // Start drawing
 dt = animate();
 discoAngle += 45.0;
 draw2D(ctx); // Draw 2D
 draw(gl, u_Floor, u_MvpMatrix, u_MdlMatrix, u_NMdlMatrix, currentAngle);
 requestAnimationFrame(tick, canvas);
};
  tick();
  
}
  
function getInverseTranspose(mat4){
  m = new Matrix4();
  m.setInverseOf(mat4);
  m.transpose();
  return m;
}

// Draw the HUD
function draw2D(ctx) {
  ctx.clearRect(0, 0, 2000, 2000); // Clear <hud>
 
  ctx.font = 'bold 25px "Courier New"';
  ctx.fillStyle = 'rgba(0, 0, 0, 1)'; // Set white to the color of letters

  // Title 
  ctx.fillText('ROBOT STATUS', 1025, 50); 


  var info = new Array();
  buildTextTree(robotDataStructure, info, 0);
  var i = 0;
  

  for (var status in info) {
    ctx.font = 'bold 12px "Courier New"';
    if(i % 3 == 0) {
      ctx.font = 'bold 15px "Courier New"';
    }

  // Part Status 
  ctx.fillText(info[status], 1025, 75 + i); 
  i += 20;

  }

}

function draw(gl, u_Floor, u_MvpMatrix, u_MdlMatrix, u_NMdlMatrix, currentAngle) {
  gl.useProgram(cubeProg);
   
  // Set the eye point and the viewing volume
  var EYEINIT=new Object;
  EYEINIT.elements=new Float32Array([
    0, 0, ZoomZ, 1,
    0, 0, 0, 1,
    0, 0, 0, 1,
    0, 0, 0, 0
  ]);

  var mvpMatrix = new Matrix4();
  
  
  var eyeMatrix = new Matrix4();
  
  eyeMatrix.rotate(-currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  eyeMatrix.rotate(-currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  
  eyeMatrix.concat(EYEINIT);
  
  
  mvpMatrix.setPerspective(30, 1, 1, 100);
  mvpMatrix.lookAt(EYEINIT.elements[0], EYEINIT.elements[1], EYEINIT.elements[2], 0, 0, 0, 0, 1, 0);
  
  mvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  mvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  
  var EYE = new Float32Array([eyeMatrix.elements[0], eyeMatrix.elements[1], eyeMatrix.elements[2]]);


  // Pass the model view projection matrix to u_MvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  var mdlMatrix = new Matrix4();
  mdlMatrix.setIdentity();  
  
  setupLight(gl, EYE, 0);  
  setupLight(gl, EYE, 1);  
  drawRoom(gl, u_MdlMatrix, mdlMatrix, u_NMdlMatrix, u_Floor);
  
  
}

function drawRoom(gl, u_MdlMatrix, mdlMatrix, u_NMdlMatrix, u_Floor){

gl.uniformMatrix4fv(u_MdlMatrix, false, mdlMatrix.elements);
gl.uniformMatrix4fv(u_NMdlMatrix, false, getInverseTranspose(mdlMatrix).elements);
drawFloor(gl, u_MdlMatrix, mdlMatrix, u_NMdlMatrix, u_Floor);
    

  // Pass the robot data structure to be drawn 
  drawRobot(gl, u_MdlMatrix, mdlMatrix, u_NMdlMatrix, robotDataStructure);
  
  //DiscoBall
  mdlMatrix.translate(moveX, 0, moveZ);
  mdlMatrix.rotate(discoAngle, 0, 1, 0);
  xEtra = mdlMatrix.elements[10] + moveX;
  zEtra = mdlMatrix.elements[8] + moveZ;

  drawDiscoBall(gl, u_MdlMatrix, mdlMatrix, u_NMdlMatrix);

}

function drawRobot(gl, u_MdlMatrix, mdlMatrix, u_NMdlMatrix, robot){

  // go through all parts of the robot
  for (var robotPart in robot) {

      if(robot[robotPart].attributes.partAcceleration && robot[robotPart].attributes.partAcceleration != 0.0) {
          //console.log(robot[robotPart].attributes.partAngleSpeed);
          robot[robotPart].attributes.partAngleSpeed += robot[robotPart].attributes.partAcceleration * dt;
          robot[robotPart].attributes.rotate[0] += robot[robotPart].attributes.partAngleSpeed * dt;

          if(robot[robotPart].attributes.control) {
            robot[robotPart].attributes.control(robot[robotPart]);
          }
      }

      for(var i = 0; i < 3; i++) {
        if(robot[robotPart].attributes.partTransAcceleration && robot[robotPart].attributes.partTransAcceleration[i] != 0.0) {       
          robot[robotPart].attributes.partSpeed[i] += (robot[robotPart].attributes.partTransAcceleration[i] * dt);
          robot[robotPart].attributes.translate[i] += robot[robotPart].attributes.partSpeed[i] * dt;

        }
      } 

      if(robot[robotPart].attributes.transControl) {
        robot[robotPart].attributes.transControl(robot[robotPart]);
      }



      // if there's children apply attributes
      if(typeof robot[robotPart].children !== "undefined") { // this is a parent 

        mdlMatrixChild=new Matrix4(mdlMatrix);        

        //partAngleSpeed: 0.0, partSpeed: [0.0, 0.0, 0.0], partTransAcceleration: [0.000000, 0.0, 0.000000], partAcceleration

        // rotation
        var robotRotate = robot[robotPart].attributes.rotate;
        if(robot[robotPart].attributes.partTransAcceleration) {
          var robotTranslate = robot[robotPart].attributes.translate;
          mdlMatrixChild.translate(robotTranslate[0], robotTranslate[1], robotTranslate[2]);
          

        }

        if(robot[robotPart].attributes.joint) {
          mdlMatrixChild.translate(robot[robotPart].attributes.joint[0], robot[robotPart].attributes.joint[1], robot[robotPart].attributes.joint[2]);
          mdlMatrixChild.rotate(robotRotate[0], robotRotate[1], robotRotate[2], robotRotate[3]); 
          mdlMatrixChild.translate(-robot[robotPart].attributes.joint[0], -robot[robotPart].attributes.joint[1], -robot[robotPart].attributes.joint[2]);
        }
        else {
          mdlMatrixChild.rotate(robotRotate[0], robotRotate[1], robotRotate[2], robotRotate[3]); 
        }
        

        // pass children
        drawRobot(gl, u_MdlMatrix, mdlMatrixChild, u_NMdlMatrix, robot[robotPart].children); 
      }

      // draw the part
      else {

        // get the part attributes
        var partAttributes = robot[robotPart].attributes;
        mdlMatrixChild=new Matrix4(mdlMatrix);

        // part translation
        var robotTranslate = partAttributes.translate;

        // part scale
        var robotScale = partAttributes.scale;
      
        // part rotation  
        var robotRotate = partAttributes.rotate; 

        // part colors
        cubeColors = partAttributes.cubeColors;

        // part type 
        var partType = partAttributes.partType;

        // draw the part
        drawRobotPart(robotTranslate, robotScale, robotRotate, cubeColors, partType, gl, u_MdlMatrix, mdlMatrixChild, u_NMdlMatrix);
      }
  }
}

function drawRobotPart(robotTranslate, robotScale, robotRotate, cubeColors, partType, gl, u_MdlMatrix, mdlMatrix, u_NMdlMatrix) {


  mdlMatrixChild=new Matrix4(mdlMatrix);
  mdlMatrixChild.translate(robotTranslate[0], robotTranslate[1], robotTranslate[2]);
  mdlMatrixChild.scale(robotScale[0], robotScale[1], robotScale[2]);

  mdlMatrixChild.rotate(robotRotate[0], robotRotate[1], robotRotate[2], robotRotate[3]); 
  
  gl.uniformMatrix4fv(u_MdlMatrix, false, mdlMatrixChild.elements);
  gl.uniformMatrix4fv(u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild).elements);

  switch(partType) {
    case 0: 
      drawCube(gl, cubeColors, 1);
      break;
    case 1: 
      drawCylinder(gl, cubeColors, 1);
      break;
    case 2:
      drawBall(gl, cubeColors, 1);
     break;

  }
}


function drawFloor(gl, u_MdlMatrix, mdlMatrix, u_NMdlMatrix, u_Floor) {

  var dFloorSize = 2;
  var dFloorColor1 = [null, null, null, null, RED, null];
  var dFloorColor2 = [null, null, null, null, WHITE, null];

  mdlMatrixChild=new Matrix4(mdlMatrix);  
  mdlMatrixChild.scale(3.0, 1, 3.0);
  gl.uniformMatrix4fv(u_MdlMatrix, false, mdlMatrixChild.elements);
  gl.uniformMatrix4fv(u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild).elements);
  gl.uniform1f(u_Floor, 1.0);
  drawCube(gl, dFloorColor1, -1);
  gl.uniform1f(u_Floor, 0.0);

  }


function drawDiscoBall(gl, u_MdlMatrix, mdlMatrix, u_NMdlMatrix){

  mdlMatrixChild=new Matrix4(mdlMatrix);
  mdlMatrixChild.translate(0.0, 2.5, 0.0);  
  mdlMatrixChild.scale(0.3, 0.3, 0.3);
  gl.uniformMatrix4fv(u_MdlMatrix, false, mdlMatrixChild.elements);
  gl.uniformMatrix4fv(u_NMdlMatrix, false, getInverseTranspose(mdlMatrixChild).elements);
  cubeColors=[WHITE, WHITE, BLACK, WHITE, WHITE, WHITE];
  drawBall(gl, cubeColors, -1);
}



function drawBall(gl, cubeColors, normalDirection) {

  switch(cubeColors[0]) {
      case SILVER: 
        cubeColors = [SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER];
      break;
      case GRAY:
        cubeColors = [GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY];
      break;
      case LIGHTBLUE:
        cubeColors = [LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE, LIGHTBLUE];
      break;
      case WHITE:
        cubeColors = [WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE, WHITE];
      break;
      default:
        cubeColors = [WHITE, SILVER, WHITE, SILVER, WHITE, SILVER, WHITE, SILVER, WHITE, WHITE, SILVER, SILVER, WHITE, WHITE, SILVER, SILVER, WHITE, WHITE, SILVER, SILVER, WHITE, WHITE, SILVER, SILVER, WHITE, SILVER, WHITE, SILVER, WHITE, SILVER, WHITE, SILVER];
      break;
    }

  // Create a DiscoBall 
  var vertices = new Float32Array([   // Vertex coordinates
    0.0, 0.5, -1.0,  0.0, 1.0, 0.0,  0.7, 0.5, -0.7,  0.0, 1.0, 0.0,  // top lid 1

    0.7, 0.5, -0.7,  0.0, 1.0, 0.0,  1.0, 0.5, 0.0,   0.0, 1.0, 0.0,  // top lid 2 

    1.0, 0.5, 0.0,  0.0, 1.0, 0.0,  0.7, 0.5, 0.7,   0.0, 1.0, 0.0,  // top lid 3

    0.7, 0.5, 0.7,  0.0, 1.0, 0.0,  0.0, 0.5, 1.0,   0.0, 1.0, 0.0,  // top lid 4


    0.0, 0.5, 1.0,  0.0, 1.0, 0.0,  -0.7, 0.5, 0.7,  0.0, 1.0, 0.0,  // top lid 5

    -0.7, 0.5, 0.7,  0.0, 1.0, 0.0,  -1.0, 0.5, 0.0,   0.0, 1.0, 0.0,  // top lid 6 

    -1.0, 0.5, 0.0,  0.0, 1.0, 0.0,  -0.7, 0.5, -0.7,   0.0, 1.0, 0.0,  // top lid 7

    -0.7, 0.5, -0.7,  0.0, 1.0, 0.0,  0.0, 0.5, -1.0,   0.0, 1.0, 0.0,  // top lid 8


     0.0, 0.5, -1.0,  0.0,-0.5, -1.0,  0.7, 0.5, -0.7,  0.0, 0.5, -1.0,  // r1
     0.7,-0.5, -0.7,  0.0,-0.5, -1.0,  0.7, 0.5, -0.7,  0.7,-0.5, -0.7,  // r1

     0.7, 0.5, -0.7,  0.71,-0.5, -0.7, 1.0, 0.5, 0.0,  0.7, 0.5, -0.7,    // r2
     1.0,-0.5, 0.0,   0.71,-0.5, -0.7, 1.0, 0.5, 0.0,  1.0,-0.5, 0.0,     // r2

     1.0, 0.5, 0.0,   1.0,-0.5, 0.0,  0.7, 0.5, 0.7,   1.0, 0.5, 0.0,    // r3
     0.7,-0.5, 0.7,   1.0,-0.5, 0.0,  0.7, 0.5, 0.7,   0.7,-0.5, 0.7,    // r3

     0.7, 0.5, 0.7,   0.7,-0.5, 0.7,  0.0, 0.5, 1.0,   0.7, 0.5, 0.7,    // r4
     0.0,-0.5, 1.0,   0.7,-0.5, 0.7,  0.0, 0.5, 1.0,   0.0,-0.5, 1.0,    // r4

     0.0, 0.5, 1.0,   0.0,-0.5, 1.0,  -0.7, 0.5, 0.7,   0.0, 0.5, 1.0,   // r5
     -0.7,-0.5, 0.7,   0.0,-0.5, 1.0,  -0.7, 0.5, 0.7,   -0.7,-0.5, 0.7,   // r5

     -0.7, 0.5, 0.7,  -0.71,-0.5,0.7, -1.0, 0.5, 0.0,  -0.7, 0.5, 0.7,    // r6
      -1.0,-0.5, 0.0,  -0.71,-0.5,0.7, -1.0, 0.5, 0.0,   -1.0,-0.5, 0.0,    // r6


     -1.0, 0.5, 0.0,   -1.0,-0.5, 0.0,  -0.7, 0.5, -0.7,   -1.0, 0.5, 0.0,    // r7
     -0.7,-0.5, -0.7,   -1.0,-0.5, 0.0,  -0.7, 0.5, -0.7,   -0.7,-0.5, -0.7,    // r7

     -0.7, 0.5, -0.7,   -0.7,-0.5, -0.7,  0.0, 0.5, -1.0,  -0.7, 0.5, -0.7,    // r8 
     0.0,-0.5, -1.0,   -0.7,-0.5, -0.7,  0.0, 0.5, -1.0,   0.0,-0.5, -1.0,    // r8




    0.0, -0.5, -1.0,  0.0, -1.0, 0.0,  0.7, -0.5, -0.7,  0.0, -1.0, 0.0,  // top lid 1

    0.7, -0.5, -0.7,  0.0, -1.0, 0.0,  1.0, -0.5, 0.0,   0.0, -1.0, 0.0,  // top lid 2 

    1.0, -0.5, 0.0,  0.0, -1.0, 0.0,  0.7, -0.5, 0.7,   0.0, -1.0, 0.0,  // top lid 3

    0.7, -0.5, 0.7,  0.0, -1.0, 0.0,  0.0, -0.5, 1.0,   0.0, -1.0, 0.0,  // top lid 4


    0.0, -0.5, 1.0,  0.0, -1.0, 0.0,  -0.7, -0.5, 0.7,  0.0, -1.0, 0.0,  // top lid 5

    -0.7, -0.5, 0.7,  0.0, -1.0, 0.0,  -1.0, -0.5, 0.0,   0.0, -1.0, 0.0,  // top lid 6 

    -1.0, -0.5, 0.0,  0.0, -1.0, 0.0,  -0.7, -0.5, -0.7,   0.0, -1.0, 0.0,  // top lid 7

    -0.7, -0.5, -0.7,  0.0, -1.0, 0.0,  0.0, -0.5, -1.0,   0.0, -1.0, 0.0  // top lid 8

  ]);
  
  var normals = new Float32Array([   // Normal coordinates

  0.15, 0.7, -0.35, 0.0,  0.15, 0.7, -0.35, 0.0,  0.15, 0.7, -0.35, 0.0,   0.15, 0.7, -0.35, 0.0,  // top lid 1 
  0.35, 0.7, -0.15, 0.0,  0.35, 0.7, -0.15, 0.0,  0.35, 0.7, -0.15, 0.0,   0.35, 0.7, -0.15, 0.0,  // top lid 1 
  0.35, 0.7, 0.15, 0.0,  0.35, 0.7, 0.15, 0.0,  0.35, 0.7, 0.15, 0.0,   0.35, 0.7, 0.15, 0.0,  // top lid 1 
  -0.35, 0.7, 0.35, 0.0,  -0.35, 0.7, 0.35, 0.0,  -0.35, 0.7, 0.35, 0.0,   -0.35, 0.7, 0.35, 0.0,  // top lid 1 

  -0.15, 0.7, 0.35, 0.0,  -0.15, 0.7, 0.35, 0.0,  -0.15, 0.7, 0.35, 0.0,   -0.15, 0.7, 0.35, 0.0,  // top lid 1 
  -0.35, 0.7, 0.15, 0.0,  -0.35, 0.7, 0.15, 0.0,  -0.35, 0.7, 0.15, 0.0,   -0.35, 0.7, 0.15, 0.0,  // top lid 1 
  -0.35, 0.7, -0.15, 0.0,  -0.35, 0.7, -0.15, 0.0,  -0.35, 0.7, -0.15, 0.0,   -0.35, 0.7, -0.15, 0.0,  // top lid 1 
  0.35, 0.7, -0.35, 0.0,  0.35, 0.7, -0.35, 0.0,  0.35, 0.7, -0.35, 0.0,   0.35, 0.7, -0.35, 0.0,  // top lid 1 

  0.6, 0.0, -1.4,0.0,  0.6, 0.0, -1.4,0.0,   0.6, 0.0, -1.4,0.0,  0.6, 0.0, -1.4,0.0,   // v7-v4-v3-v2 down
  0.6, 0.0, -1.4,0.0,  0.6, 0.0, -1.4,0.0,   0.6, 0.0, -1.4,0.0,  0.6, 0.0, -1.4,0.0,   // v7-v4-v3-v2 down
  1.4, 0.0, -0.6,0.0,  1.4, 0.0, -0.6,0.0,   1.4, 0.0, -0.6,0.0,   1.4, 0.0, -0.6,0.0,  // v0-v3-v4-v5 right
  1.4, 0.0, -0.6,0.0,  1.4, 0.0, -0.6,0.0,   1.4, 0.0, -0.6,0.0,   1.4, 0.0, -0.6,0.0,  // v0-v3-v4-v5 right
  1.4, 0.0, 0.6,0.0,   1.4, 0.0, 0.6,0.0,   1.4, 0.0, 0.6,0.0,  1.4, 0.0, 0.6,0.0,  // v0-v5-v6-v1 up
  1.4, 0.0, 0.6,0.0,   1.4, 0.0, 0.6,0.0,   1.4, 0.0, 0.6,0.0,  1.4, 0.0, 0.6,0.0,  // v0-v5-v6-v1 up
  0.6, 0.0, 1.4,0.0,   0.6, 0.0, 1.4,0.0,   0.6, 0.0, 1.4,0.0,  0.6, 0.0, 1.4,0.0,  // v4-v7-v6-v5 back
  0.6, 0.0, 1.4,0.0,   0.6, 0.0, 1.4,0.0,   0.6, 0.0, 1.4,0.0,  0.6, 0.0, 1.4,0.0,  // v4-v7-v6-v5 back



 -0.6, 0.0, 1.4, 0.0,  -0.6, 0.0, 1.4, 0.0,  -0.6, 0.0, 1.4, 0.0,   -0.6, 0.0, 1.4, 0.0,  // v0-v1-v2-v3 front
 -0.6, 0.0, 1.4, 0.0,  -0.6, 0.0, 1.4, 0.0,  -0.6, 0.0, 1.4, 0.0,   -0.6, 0.0, 1.4, 0.0,  // v0-v1-v2-v3 front

 -1.4, 0.0, 0.6,0.0,   -1.4, 0.0, 0.6,0.0,   -1.4, 0.0, 0.6,0.0,   -1.4, 0.0, 0.6,0.0,  // v0-v3-v4-v5 right
 -1.4, 0.0, 0.6,0.0,   -1.4, 0.0, 0.6,0.0,   -1.4, 0.0, 0.6,0.0,   -1.4, 0.0, 0.6,0.0,  // v0-v3-v4-v5 right

 -1.4, 0.0, -0.6,0.0,   -1.4, 0.0, -0.6,0.0,  -1.4, 0.0, -0.6,0.0,  -1.4, 0.0, -0.6,0.0,  // v0-v5-v6-v1 up
 -1.4, 0.0, -0.6,0.0,   -1.4, 0.0, -0.6,0.0,  -1.4, 0.0, -0.6,0.0,  -1.4, 0.0, -0.6,0.0,  // v0-v5-v6-v1 up

 -0.6, 0.0, -1.4,0.0,   -0.6, 0.0, -1.4,0.0,   -0.6, 0.0, -1.4,0.0,  -0.6, 0.0, -1.4,0.0,  // v1-v6-v7-v2 left
 -0.6, 0.0, -1.4,0.0,   -0.6, 0.0, -1.4,0.0,   -0.6, 0.0, -1.4,0.0,  -0.6, 0.0, -1.4,0.0,  // v1-v6-v7-v2 left


 0.15, 0.7, -0.35, 0.0,  0.15, 0.7, -0.35, 0.0,  0.15, 0.7, -0.35, 0.0,   0.15, 0.7, -0.35, 0.0,  // top lid 1 
 0.35, 0.7, -0.15, 0.0,  0.35, 0.7, -0.15, 0.0,  0.35, 0.7, -0.15, 0.0,   0.35, 0.7, -0.15, 0.0,  // top lid 1 
 0.35, 0.7, 0.15, 0.0,  0.35, 0.7, 0.15, 0.0,  0.35, 0.7, 0.15, 0.0,   0.35, 0.7, 0.15, 0.0,  // top lid 1 
 -0.35, 0.7, 0.35, 0.0,  -0.35, 0.7, 0.35, 0.0,  -0.35, 0.7, 0.35, 0.0,   -0.35, 0.7, 0.35, 0.0,  // top lid 1 

 -0.15, 0.7, 0.35, 0.0,  -0.15, 0.7, 0.35, 0.0,  -0.15, 0.7, 0.35, 0.0,   -0.15, 0.7, 0.35, 0.0,  // top lid 1 
 -0.35, 0.7, 0.15, 0.0,  -0.35, 0.7, 0.15, 0.0,  -0.35, 0.7, 0.15, 0.0,   -0.35, 0.7, 0.15, 0.0,  // top lid 1 
 -0.35, 0.7, -0.15, 0.0,  -0.35, 0.7, -0.15, 0.0,  -0.35, 0.7, -0.15, 0.0,   -0.35, 0.7, -0.15, 0.0,  // top lid 1 
 0.35, 0.7, -0.35, 0.0,  0.35, 0.7, -0.35, 0.0,  0.35, 0.7, -0.35, 0.0,   0.35, 0.7, -0.35, 0.0,  // top lid 1 

 -0.6, 0.0, 1.4,0.0,   -0.6, 0.0, 1.4,0.0,   -0.6, 0.0, 1.4,0.0,  -0.6, 0.0, 1.4,0.0,   // v7-v4-v3-v2 down
 -0.6, 0.0, 1.4,0.0,   -0.6, 0.0, 1.4,0.0,   -0.6, 0.0, 1.4,0.0,  -0.6, 0.0, 1.4,0.0,   // v7-v4-v3-v2 down
 -1.4, 0.0, 0.6,0.0,   -1.4, 0.0, 0.6,0.0,   -1.4, 0.0, 0.6,0.0,   -1.4, 0.0, 0.6,0.0,  // v0-v3-v4-v5 right
 -1.4, 0.0, 0.6,0.0,   -1.4, 0.0, 0.6,0.0,   -1.4, 0.0, 0.6,0.0,   -1.4, 0.0, 0.6,0.0,  // v0-v3-v4-v5 right
 -1.4, 0.0, -0.6,0.0,    -1.4, 0.0, -0.6,0.0,  -1.4, 0.0, -0.6,0.0,  -1.4, 0.0, -0.6,0.0,  // v0-v5-v6-v1 up
 -1.4, 0.0, -0.6,0.0,    -1.4, 0.0, -0.6,0.0,  -1.4, 0.0, -0.6,0.0,  -1.4, 0.0, -0.6,0.0,  // v0-v5-v6-v1 up
 -0.6, 0.0, -1.4,0.0,   -0.6, 0.0, -1.4,0.0,   -0.6, 0.0, -1.4,0.0,  -0.6, 0.0, -1.4,0.0,  // v4-v7-v6-v5 back
 -0.6, 0.0, -1.4,0.0,   -0.6, 0.0, -1.4,0.0,   -0.6, 0.0, -1.4,0.0,  -0.6, 0.0, -1.4,0.0  // v4-v7-v6-v5 back

  ]);
  
  var BLACK=new Float32Array([0.0, 0.0, 0.0]);
  
  var indicesTemp = [];
  var colors = new Float32Array(32*4*3);
  for(i=0; i<32; i++){
  
  var faceColor=cubeColors[i];
  
  if(null!=faceColor){
    indicesTemp.push(i*4);
    indicesTemp.push(i*4+1);
    indicesTemp.push(i*4+2);
    
    indicesTemp.push(i*4);
    indicesTemp.push(i*4+2);
    indicesTemp.push(i*4+3);
  } else {
    faceColor=BLACK;
  }
    
      
  for(j=0; j<4; j++){
    for(k=0; k<3; k++){
      colors[k+3*j+4*3*i]=faceColor[k];
    }   
  }
  }
  
  var indices = new Uint8Array(indicesTemp);

  // Create a buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) 
    return -1;

  // Write the vertex coordinates and color to the buffer object
  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
    return -1;

  if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
    return -1;
  
  if (!initArrayBuffer(gl, normals, 4, gl.FLOAT, 'a_Normal'))
    return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  
  // Get the storage location of u_NormalDirection
  var u_NormalDirection = gl.getUniformLocation(cubeProg, 'u_NormalDirection');
  if (!u_NormalDirection) {
    console.log('Failed to get the storage location of u_NormalDirection');
    return;
  }
  
  gl.uniform1f(u_NormalDirection, normalDirection);

   // Draw the cube
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
}

function drawCube(gl, cubeColors, normalDirection) {

  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  var vertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
  ]);
  
  var normals = new Float32Array([   // Normal coordinates
     0.0, 0.0, 1.0, 0.0,  0.0, 0.0, 1.0,0.0,  0.0,0.0, 1.0,0.0,   0.0,0.0, 1.0,0.0,  // v0-v1-v2-v3 front
     1.0, 0.0, 0.0,0.0,   1.0,0.0, 0.0,0.0,   1.0,0.0,0.0,0.0,   1.0, 0.0,0.0,0.0,  // v0-v3-v4-v5 right
     0.0, 1.0, 0.0,0.0,   0.0, 1.0,0.0,0.0,  0.0, 1.0,0.0,0.0,  0.0, 1.0, 0.0,0.0,  // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0,0.0,   -1.0,0.0, 0.0,0.0,   -1.0,0.0,0.0, 0.0,  -1.0, 0.0,0.0,0.0,  // v1-v6-v7-v2 left
    0.0, -1.0, 0.0,0.0,   0.0, -1.0,0.0,0.0,  0.0, -1.0,0.0,0.0,  0.0, -1.0, 0.0,0.0,  // v7-v4-v3-v2 down
     0.0, 0.0, -1.0,0.0,  0.0, 0.0, -1.0,0.0,  0.0,0.0, -1.0,0.0,   0.0,0.0, -1.0, 0.0  // v4-v7-v6-v5 back
  ]);
  
  var BLACK=new Float32Array([0.0, 0.0, 0.0]);
  
  var indicesTemp = [];
  var colors = new Float32Array(6*4*3);
  for(i=0; i<6; i++){
  
  var faceColor=cubeColors[i];
  
  if(null!=faceColor){
    indicesTemp.push(i*4);
    indicesTemp.push(i*4+1);
    indicesTemp.push(i*4+2);
    
    indicesTemp.push(i*4);
    indicesTemp.push(i*4+2);
    indicesTemp.push(i*4+3);
  } else {
    faceColor=BLACK;
  }
    
      
  for(j=0; j<4; j++){
    for(k=0; k<3; k++){
      colors[k+3*j+4*3*i]=faceColor[k];
    }   
  }
  }
  
  var indices = new Uint8Array(indicesTemp);

  // Create a buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) 
    return -1;

  // Write the vertex coordinates and color to the buffer object
  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
    return -1;

  if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
    return -1;
  
  if (!initArrayBuffer(gl, normals, 4, gl.FLOAT, 'a_Normal'))
    return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  
  // Get the storage location of u_NormalDirection
  var u_NormalDirection = gl.getUniformLocation(cubeProg, 'u_NormalDirection');
  if (!u_NormalDirection) {
    console.log('Failed to get the storage location of u_NormalDirection');
    return;
  }
  
  gl.uniform1f(u_NormalDirection, normalDirection);

   // Draw the cube
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
}



function drawCylinder(gl, cubeColors, normalDirection) {

  switch(cubeColors[0]) {
    case SILVER: 
      cubeColors = [SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER, SILVER];
    break;
    case GRAY:
      cubeColors = [GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY, GRAY];
    break;
  }

  

   // Create a Cylinder 
  var vertices = new Float32Array([   // Vertex coordinates
    0.0, 1.0, -1.0,  0.0, 1.0, 0.0,  0.7, 1.0, -0.7,  0.0, 1.0, 0.0,  // top lid 1

    0.7, 1.0, -0.7,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // top lid 2 

    1.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.7, 1.0, 0.7,   0.0, 1.0, 0.0,  // top lid 3

    0.7, 1.0, 0.7,  0.0, 1.0, 0.0,  0.0, 1.0, 1.0,   0.0, 1.0, 0.0,  // top lid 4


    0.0, 1.0, 1.0,  0.0, 1.0, 0.0,  -0.7, 1.0, 0.7,  0.0, 1.0, 0.0,  // top lid 5

    -0.7, 1.0, 0.7,  0.0, 1.0, 0.0,  -1.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // top lid 6 

    -1.0, 1.0, 0.0,  0.0, 1.0, 0.0,  -0.7, 1.0, -0.7,   0.0, 1.0, 0.0,  // top lid 7

    -0.7, 1.0, -0.7,  0.0, 1.0, 0.0,  0.0, 1.0, -1.0,   0.0, 1.0, 0.0,  // top lid 8


   0.0, 1.0, -1.0,  0.0,-1.0, -1.0,  0.7, 1.0, -0.7,  0.0, 1.0, -1.0,  // r1
   0.7,-1.0, -0.7,  0.0,-1.0, -1.0,  0.7, 1.0, -0.7,  0.7,-1.0, -0.7,  // r1

   0.7, 1.0, -0.7,  0.71,-1.0, -0.7, 1.0, 1.0, 0.0,  0.7, 1.0, -0.7,    // r2
   1.0,-1.0, 0.0,   0.71,-1.0, -0.7, 1.0, 1.0, 0.0,  1.0,-1.0, 0.0,     // r2

   1.0, 1.0, 0.0,   1.0,-1.0, 0.0,  0.7, 1.0, 0.7,   1.0, 1.0, 0.0,    // r3
   0.7,-1.0, 0.7,   1.0,-1.0, 0.0,  0.7, 1.0, 0.7,   0.7,-1.0, 0.7,    // r3

   0.7, 1.0, 0.7,   0.7,-1.0, 0.7,  0.0, 1.0, 1.0,   0.7, 1.0, 0.7,    // r4
   0.0,-1.0, 1.0,   0.7,-1.0, 0.7,  0.0, 1.0, 1.0,   0.0,-1.0, 1.0,    // r4

   0.0, 1.0, 1.0,   0.0,-1.0, 1.0,  -0.7, 1.0, 0.7,   0.0, 1.0, 1.0,   // r5
   -0.7,-1.0, 0.7,   0.0,-1.0, 1.0,  -0.7, 1.0, 0.7,   -0.7,-1.0, 0.7,   // r5

   -0.7, 1.0, 0.7,  -0.71,-1.0,0.7, -1.0, 1.0, 0.0,  -0.7, 1.0, 0.7,    // r6
   -1.0,-1.0, 0.0,  -0.71,-1.0,0.7, -1.0, 1.0, 0.0,   -1.0,-1.0, 0.0,    // r6


   -1.0, 1.0, 0.0,   -1.0,-1.0, 0.0,  -0.7, 1.0, -0.7,   -1.0, 1.0, 0.0,    // r7
   -0.7,-1.0, -0.7,   -1.0,-1.0, 0.0,  -0.7, 1.0, -0.7,   -0.7,-1.0, -0.7,    // r7

   -0.7, 1.0, -0.7,   -0.7,-1.0, -0.7,  0.0, 1.0, -1.0,  -0.7, 1.0, -0.7,    // r8 
   0.0,-1.0, -1.0,   -0.7,-1.0, -0.7,  0.0, 1.0, -1.0,   0.0,-1.0, -1.0,    // r8


    0.0, -1.0, -1.0,  0.0, -1.0, 0.0,  0.7, -1.0, -0.7,  0.0, -1.0, 0.0,  // top lid 1

    0.7, -1.0, -0.7,  0.0, -1.0, 0.0,  1.0, -1.0, 0.0,   0.0, -1.0, 0.0,  // top lid 2 

    1.0, -1.0, 0.0,  0.0, -1.0, 0.0,  0.7, -1.0, 0.7,   0.0, -1.0, 0.0,  // top lid 3

    0.7, -1.0, 0.7,  0.0, -1.0, 0.0,  0.0, -1.0, 1.0,   0.0, -1.0, 0.0,  // top lid 4


    0.0, -1.0, 1.0,  0.0, -1.0, 0.0,  -0.7, -1.0, 0.7,  0.0, -1.0, 0.0,  // top lid 5

    -0.7, -1.0, 0.7,  0.0, -1.0, 0.0,  -1.0, -1.0, 0.0,   0.0, -1.0, 0.0,  // top lid 6 

    -1.0, -1.0, 0.0,  0.0, -1.0, 0.0,  -0.7, -1.0, -0.7,   0.0, -1.0, 0.0,  // top lid 7

    -0.7, -1.0, -0.7,  0.0, -1.0, 0.0,  0.0, -1.0, -1.0,   0.0, -1.0, 0.0  // top lid 8

  ]);
  
  var normals = new Float32Array([   // Normal coordinates
    0.0, 1.0, 0.0, 0.0,  0.0, 1.0, 0.0, 0.0,  0.0, 1.0, 0.0, 0.0,   0.0, 1.0, 0.0, 0.0,  // top lid 1 
    0.0, 1.0, 0.0, 0.0,  0.0, 1.0, 0.0, 0.0,  0.0, 1.0, 0.0, 0.0,   0.0, 1.0, 0.0, 0.0,  // top lid 1 
    0.0, 1.0, 0.0, 0.0,  0.0, 1.0, 0.0, 0.0,  0.0, 1.0, 0.0, 0.0,   0.0, 1.0, 0.0, 0.0,  // top lid 1 
    0.0, 1.0, 0.0, 0.0,  0.0, 1.0, 0.0, 0.0,  0.0, 1.0, 0.0, 0.0,   0.0, 1.0, 0.0, 0.0,  // top lid 1 
    0.0, 1.0, 0.0, 0.0,  0.0, 1.0, 0.0, 0.0,  0.0, 1.0, 0.0, 0.0,   0.0, 1.0, 0.0, 0.0,  // top lid 1 
    0.0, 1.0, 0.0, 0.0,  0.0, 1.0, 0.0, 0.0,  0.0, 1.0, 0.0, 0.0,   0.0, 1.0, 0.0, 0.0,  // top lid 1 
    0.0, 1.0, 0.0, 0.0,  0.0, 1.0, 0.0, 0.0,  0.0, 1.0, 0.0, 0.0,   0.0, 1.0, 0.0, 0.0,  // top lid 1 
    0.0, 1.0, 0.0, 0.0,  0.0, 1.0, 0.0, 0.0,  0.0, 1.0, 0.0, 0.0,   0.0, 1.0, 0.0, 0.0,  // top lid 1 


     0.6, 0.0, -1.4,0.0,   0.6, 0.0, -1.4,0.0,   0.6, 0.0, -1.4,0.0,  0.6, 0.0, -1.4,0.0,   // v7-v4-v3-v2 down
      0.6, 0.0, -1.4,0.0,   0.6, 0.0, -1.4,0.0,   0.6, 0.0, -1.4,0.0,  0.6, 0.0, -1.4,0.0,   // v7-v4-v3-v2 down
     1.4, 0.0, -0.6,0.0,   1.4, 0.0, -0.6,0.0,   1.4, 0.0, -0.6,0.0,   1.4, 0.0, -0.6,0.0,  // v0-v3-v4-v5 right
      1.4, 0.0, -0.6,0.0,   1.4, 0.0, -0.6,0.0,   1.4, 0.0, -0.6,0.0,   1.4, 0.0, -0.6,0.0,  // v0-v3-v4-v5 right
     1.4, 0.0, 0.6,0.0,    1.4, 0.0, 0.6,0.0,  1.4, 0.0, 0.6,0.0,  1.4, 0.0, 0.6,0.0,  // v0-v5-v6-v1 up
     1.4, 0.0, 0.6,0.0,    1.4, 0.0, 0.6,0.0,  1.4, 0.0, 0.6,0.0,  1.4, 0.0, 0.6,0.0,  // v0-v5-v6-v1 up
    0.6, 0.0, 1.4,0.0,   0.6, 0.0, 1.4,0.0,   0.6, 0.0, 1.4,0.0,  0.6, 0.0, 1.4,0.0,  // v4-v7-v6-v5 back
    0.6, 0.0, 1.4,0.0,   0.6, 0.0, 1.4,0.0,   0.6, 0.0, 1.4,0.0,  0.6, 0.0, 1.4,0.0,  // v4-v7-v6-v5 back



     -0.6, 0.0, 1.4, 0.0,  -0.6, 0.0, 1.4, 0.0,  -0.6, 0.0, 1.4, 0.0,   -0.6, 0.0, 1.4, 0.0,  // v0-v1-v2-v3 front
     -0.6, 0.0, 1.4, 0.0,  -0.6, 0.0, 1.4, 0.0,  -0.6, 0.0, 1.4, 0.0,   -0.6, 0.0, 1.4, 0.0,  // v0-v1-v2-v3 front

     -1.4, 0.0, 0.6,0.0,   -1.4, 0.0, 0.6,0.0,   -1.4, 0.0, 0.6,0.0,   -1.4, 0.0, 0.6,0.0,  // v0-v3-v4-v5 right
     -1.4, 0.0, 0.6,0.0,   -1.4, 0.0, 0.6,0.0,   -1.4, 0.0, 0.6,0.0,   -1.4, 0.0, 0.6,0.0,  // v0-v3-v4-v5 right

     -1.4, 0.0, -0.6,0.0,   -1.4, 0.0, -0.6,0.0,  -1.4, 0.0, -0.6,0.0,  -1.4, 0.0, -0.6,0.0,  // v0-v5-v6-v1 up
     -1.4, 0.0, -0.6,0.0,   -1.4, 0.0, -0.6,0.0,  -1.4, 0.0, -0.6,0.0,  -1.4, 0.0, -0.6,0.0,  // v0-v5-v6-v1 up

      -0.6, 0.0, -1.4,0.0,   -0.6, 0.0, -1.4,0.0,   -0.6, 0.0, -1.4,0.0,  -0.6, 0.0, -1.4,0.0,  // v1-v6-v7-v2 left
       -0.6, 0.0, -1.4,0.0,   -0.6, 0.0, -1.4,0.0,   -0.6, 0.0, -1.4,0.0,  -0.6, 0.0, -1.4,0.0,  // v1-v6-v7-v2 left


    0.0, -1.0, 0.0, 0.0,  0.0, -1.0, 0.0, 0.0,  0.0, -1.0, 0.0, 0.0,   0.0, -1.0, 0.0, 0.0,  // top lid 1 
    0.0, -1.0, 0.0, 0.0,  0.0, -1.0, 0.0, 0.0,  0.0, -1.0, 0.0, 0.0,   0.0, -1.0, 0.0, 0.0,  // top lid 1 
    0.0, -1.0, 0.0, 0.0,  0.0, -1.0, 0.0, 0.0,  0.0, -1.0, 0.0, 0.0,   0.0, -1.0, 0.0, 0.0,  // top lid 1 
    0.0, -1.0, 0.0, 0.0,  0.0, -1.0, 0.0, 0.0,  0.0, -1.0, 0.0, 0.0,   0.0, -1.0, 0.0, 0.0,  // top lid 1 
    0.0, -1.0, 0.0, 0.0,  0.0, -1.0, 0.0, 0.0,  0.0, -1.0, 0.0, 0.0,   0.0, -1.0, 0.0, 0.0,  // top lid 1 
    0.0, -1.0, 0.0, 0.0,  0.0, -1.0, 0.0, 0.0,  0.0, -1.0, 0.0, 0.0,   0.0, -1.0, 0.0, 0.0,  // top lid 1 
    0.0, -1.0, 0.0, 0.0,  0.0, -1.0, 0.0, 0.0,  0.0, -1.0, 0.0, 0.0,   0.0, -1.0, 0.0, 0.0,  // top lid 1 
    0.0, -1.0, 0.0, 0.0,  0.0, -1.0, 0.0, 0.0,  0.0, -1.0, 0.0, 0.0,   0.0, -1.0, 0.0, 0.0  // top lid 1 
  ]);
  
  var BLACK=new Float32Array([0.0, 0.0, 0.0]);
  
  var indicesTemp = [];
  var colors = new Float32Array(32*4*3);
  for(i=0; i<32; i++){
  
  var faceColor=cubeColors[i];
  
  if(null!=faceColor){
    indicesTemp.push(i*4);
    indicesTemp.push(i*4+1);
    indicesTemp.push(i*4+2);
    
    indicesTemp.push(i*4);
    indicesTemp.push(i*4+2);
    indicesTemp.push(i*4+3);
  } else {
    faceColor=BLACK;
  }
    
      
  for(j=0; j<4; j++){
    for(k=0; k<3; k++){
      colors[k+3*j+4*3*i]=faceColor[k];
    }   
  }
  }
  
  var indices = new Uint8Array(indicesTemp);

  // Create a buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) 
    return -1;

  // Write the vertex coordinates and color to the buffer object
  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
    return -1;

  if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
    return -1;
  
  if (!initArrayBuffer(gl, normals, 4, gl.FLOAT, 'a_Normal'))
    return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  
  // Get the storage location of u_NormalDirection
  var u_NormalDirection = gl.getUniformLocation(cubeProg, 'u_NormalDirection');
  if (!u_NormalDirection) {
    console.log('Failed to get the storage location of u_NormalDirection');
    return;
  }
  
  gl.uniform1f(u_NormalDirection, normalDirection);

   // Draw the cube
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
}



function initArrayBuffer(gl, data, num, type, attribute) {
  var buffer = gl.createBuffer();   // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(cubeProg, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

function setupLight(gl, eye, spot){
    
  // Get the storage location of u_Ambient
  var u_Ambient = gl.getUniformLocation(cubeProg, 'u_Ambient');
  if (!u_Ambient) {
    console.log('Failed to get the storage location of u_Ambient');
    return;
  }
  
  // Get the storage location of u_Diffuse
  var u_Diffuse = gl.getUniformLocation(cubeProg, 'u_Diffuse');
  if (!u_Diffuse) {
    console.log('Failed to get the storage location of u_Diffuse');
    return;
  }
  
  // Get the storage location of u_Specular
  var u_Specular = gl.getUniformLocation(cubeProg, 'u_Specular');
  if (!u_Specular) {
    console.log('Failed to get the storage location of u_Specular');
    return;
  }
  
  // Get the storage location of u_LightLocation
  var u_LightLocation = gl.getUniformLocation(cubeProg, 'u_LightLocation');
  if (!u_LightLocation) {
    console.log('Failed to get the storage location of u_LightLocation');
    return;
  }
  
  // Get the storage location of u_Eye
  var u_Eye = gl.getUniformLocation(cubeProg, 'u_Eye');
  if (!u_Eye) {
    console.log('Failed to get the storage location of u_Eye');
    return;
  }
  
  gl.uniform4f(u_Ambient, 0.25, 0.25, 0.25, 1.0);

  gl.uniform4f(u_Diffuse, 0.9, 0.9, 0.9, 1.0);
  
  gl.uniform4f(u_Specular, 1.0, 1.0, 1.0, 1.0);
  
  if(spot == 0) {
    gl.uniform4f(u_LightLocation, -xEtra, 1.7, -zEtra, 1.0);
  }
  else {
    gl.uniform4f(u_LightLocation, xEtra, 1.7, zEtra, 1.0);
  }
  
  
  gl.uniform4f(u_Eye, eye[0], eye[1], eye[2], 1.0);
}

function initEventHandlers(canvas, currentAngle) {
  var dragging = false;         // Dragging or not
  var lastX = -1, lastY = -1;   // Last position of the mouse

  hud.onmousedown = function(ev) {   // Mouse is pressed
    var x = ev.clientX, y = ev.clientY;
    // Start dragging if a moue is in <canvas>
    var rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      lastX = x; lastY = y;
      dragging = true;
    }
  };

  hud.onmouseup = function(ev) { dragging = false;  }; // Mouse is released

  hud.onmousemove = function(ev) { // Mouse is moved
    var x = ev.clientX, y = ev.clientY;
    if (dragging) {
      var factor = 100/canvas.height; // The rotation ratio
      var dx = factor * (x - lastX);
      var dy = factor * (y - lastY);
      // Limit x-axis rotation angle to -90 to 90 degrees
      currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
      currentAngle[1] = currentAngle[1] + dx;
    }
    lastX = x, lastY = y;
  };



// movement of table
document.onkeypress = function(ev) { 
  
 // 160 -> charCode for space

  var code = String.fromCharCode(ev.charCode);
    switch (code) {

      //Zooming
      case '-': if (ZoomZ <= 20) ZoomZ += 1; break; // - key
      case '=': if (ZoomZ >= 5) ZoomZ -= 1;  break; //= key

      // Flip
      case ' ': 
      //robotDataStructure.robot.attributes.rotate = [0,-1,0,0]; 
        //robotDataStructure.robot.attributes.partAcceleration = 0.0005;    

        robotDataStructure.robot.attributes.partTransAcceleration[1] = 0.000008;  
      break; //space key 

      // Arm Flap
      case '0': 
        if (danceCounters[0]%2 == 0){ 
          robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.rotate = [0,0,0,-1]; 
          robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.partAcceleration = 0.00002;   
          robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.rotate = [0,0,0,1]; 
          robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.partAcceleration = 0.00002; 

          robotDataStructure.robot.children.topCore.attributes.rotate = [0,0,-1,0]; 
          robotDataStructure.robot.children.topCore.attributes.rotateRange = [10,0]; 
          robotDataStructure.robot.children.topCore.attributes.rotationType = -1; 
          robotDataStructure.robot.children.topCore.attributes.partAcceleration = 0.0001; 

          robotDataStructure.robot.children.bottomCore.attributes.rotate = [0,0,1,0]; 
          robotDataStructure.robot.children.bottomCore.attributes.rotateRange = [5,0]; 
          robotDataStructure.robot.children.bottomCore.attributes.rotationType = -1; 
          robotDataStructure.robot.children.bottomCore.attributes.partAcceleration = 0.0001; 

          robotDataStructure.robot.children.bottomCore.children.robotRightLeg.attributes.rotate = [0,0,0,-1];
          robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.attributes.rotate = [0,0,0,1];
          robotDataStructure.robot.children.bottomCore.children.robotRightLeg.attributes.partAcceleration = 0.00001;
          robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.attributes.partAcceleration = 0.00001;                  

        }  
        else{
          robotDataStructure.robot.children.topCore.children.robotHead.attributes.rotationType = 0;
        } 
        danceCounters[0]++;
      break; //0 key

      case '9': 
        if (danceCounters[9]%2 == 0){ 

          robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.rotate = [0,0,0,-1]; 
          robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.partAcceleration = 0.0001;   
          robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotate = [0,0,0,1]; 
          robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.partAcceleration = 0.0001;

          robotDataStructure.robot.children.bottomCore.children.robotRightLeg.children.bottomLeg.attributes.rotate = [0,0,-1,0];
          robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.children.bottomLeg.attributes.rotate = [0,0,1,0];

          robotDataStructure.robot.children.bottomCore.children.robotRightLeg.children.bottomLeg.attributes.partAcceleration = 0.0001;
          robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.children.bottomLeg.attributes.partAcceleration = 0.0001;
           
        }  
        else{
          robotDataStructure.robot.children.topCore.children.robotHead.attributes.rotationType = 0;
        } 
        danceCounters[9]++;
      break; //0 key


      // Head Spin
      case '1': 
        if (danceCounters[1]%2 == 0){ 
          robotDataStructure.robot.children.topCore.children.robotHead.attributes.rotate = [0,0,1,0]; 
          robotDataStructure.robot.children.topCore.children.robotHead.attributes.partAcceleration = 0.0004;  
        }  
        else{
          robotDataStructure.robot.children.topCore.children.robotHead.attributes.rotationType = 0;
        } 
        danceCounters[1]++;
      break; //1 key
     
      // Arm Spin
      case '2': 
        robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.rotate = [0,1,0,0]; 
        robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.partAcceleration = 0.0001;   
        robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.rotate = [0,1,0,0]; 
        robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.partAcceleration = 0.0001;   
      break; //2 key
      
      // Lean Back
      case '3':  
        
        if (danceCounters[3]%2 == 0){
          robotDataStructure.robot.children.topCore.attributes.rotate = [0,0,-1,0]; 
          robotDataStructure.robot.children.topCore.attributes.rotateRange = [5,0]; 
          robotDataStructure.robot.children.topCore.attributes.rotationType = -1; 
          robotDataStructure.robot.children.bottomCore.children.bottomTorso.attributes.rotate = [0,0,-1,0]; 
          robotDataStructure.robot.children.bottomCore.children.bottomTorso.attributes.rotateRange = [5,0];
          robotDataStructure.robot.children.bottomCore.children.bottomTorso.attributes.rotationType = -1;  
          
          robotDataStructure.robot.children.bottomCore.children.bottomTorso.attributes.partAcceleration = 0.0001; 
          robotDataStructure.robot.children.topCore.attributes.partAcceleration = 0.0001;   
        }
        else {
          robotDataStructure.robot.children.topCore.attributes.rotationType = 0; 
          robotDataStructure.robot.children.bottomCore.children.bottomTorso.attributes.rotationType = 0;  
        }
        danceCounters[3]++;
      break; //3 key

      //Step
      case '4':
        if (danceCounters[4]%2 == 0){
          robotDataStructure.robot.children.bottomCore.children.robotRightLeg.attributes.rotate = [0,-1,0,0];
          robotDataStructure.robot.children.bottomCore.children.robotRightLeg.attributes.rotateRange = [5,0]; 
          robotDataStructure.robot.children.bottomCore.children.robotRightLeg.attributes.rotationType = -1; 
          robotDataStructure.robot.children.bottomCore.children.robotRightLeg.children.bottomLeg.attributes.rotate = [0,-1,0,0];
          robotDataStructure.robot.children.bottomCore.children.robotRightLeg.children.bottomLeg.attributes.rotateRange = [-5,-5]; 
          robotDataStructure.robot.children.bottomCore.children.robotRightLeg.children.bottomLeg.attributes.rotationType = -1; 

          robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.attributes.rotate = [0,1,0,0];
          robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.attributes.rotateRange = [5,0]; 
          robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.attributes.rotationType = -1; 
          robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.children.bottomLeg.attributes.rotate = [0,-1,0,0];
          robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.children.bottomLeg.attributes.rotateRange = [-5,-5]; 
          robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.children.bottomLeg.attributes.rotationType = -1; 


          robotDataStructure.robot.children.bottomCore.children.robotRightLeg.children.bottomLeg.attributes.partAcceleration = 0.00004;
          robotDataStructure.robot.children.bottomCore.children.robotRightLeg.attributes.partAcceleration = 0.00004;

          robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.children.bottomLeg.attributes.partAcceleration = 0.00004;
          robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.attributes.partAcceleration = 0.00004; 

        }
        else{
          robotDataStructure.robot.children.bottomCore.children.robotRightLeg.attributes.rotationType = 0;
          robotDataStructure.robot.children.bottomCore.children.robotRightLeg.children.bottomLeg.attributes.rotationType = 0; 

          robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.attributes.rotationType = 0;
          robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.children.bottomLeg.attributes.rotationType = 0;
        }
        danceCounters[4]++;
      break;

      // Arms up
      case '5': 
        if (danceCounters[5]%2 == 0){
          robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.rotate = [0,0,0,-1]; 
          robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.rotateRange = [40,0];
          robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.partAcceleration = 0.00004;   
          robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotate = [0,0,0,1]; 
          robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotateRange = [40,0];
          robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.partAcceleration = 0.00004;

          robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.rotate = [0,0,0,-1];
          robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.rotationType = -1;
          robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.rotateRange = [-90,90];
          robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.partAcceleration = 0.0003;

          robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.rotate = [0,0,0,1];
          robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.rotationType = -1;
          robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.rotateRange = [-90,90];
          robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.partAcceleration = 0.0003;
        }
        else{

          robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.rotationType = 0;
          robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.rotationType = 0;

          robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.rotate = [0,0,0,1]; 
          robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.rotateRange = [40,0];
          robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.partAcceleration = 0.00004;   
          robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotate = [0,0,0,-1]; 
          robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotateRange = [40,0];
          robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.partAcceleration = 0.00004;

        }
        danceCounters[5]++; 
      break; //2 key

      //Splits
      case '6':
        if (danceCounters[6]%2 == 0){
          //legs
          robotDataStructure.robot.children.bottomCore.children.robotRightLeg.attributes.rotate = [0,0,0,-1];
          robotDataStructure.robot.children.bottomCore.children.robotRightLeg.attributes.rotateRange = [80,80]; 
          robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.attributes.rotate = [0,0,0,1];
          robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.attributes.rotateRange = [80,80]; 
          //arms
          robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.rotate = [0,-1,0,0];  
          robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.rotateRange = [170,170]; 
          robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.rotate = [0,-1,0,0];
          robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.rotateRange = [170,170];  

          //robot
          robotDataStructure.robot.attributes.rotate =[0,0,1,0];
          robotDataStructure.robot.attributes.rotateRange =[1080,0];
          robotDataStructure.robot.attributes.translate = [0,1,0];
          robotDataStructure.robot.attributes.translateRange = [0.1,0.4];
          
          //accelerations
          robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.partAcceleration = 0.0008;
          robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.partAcceleration = 0.0008;
          robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.attributes.partAcceleration = 0.0006;
          robotDataStructure.robot.children.bottomCore.children.robotRightLeg.attributes.partAcceleration = 0.0006;
          robotDataStructure.robot.attributes.partAcceleration = 0.00008;

          robotDataStructure.robot.attributes.partTransAcceleration[1] = 0.000002;
        }
        else {
         
        }
        danceCounters[6]++;
      break;

      //Splits
      case '7':
        if (danceCounters[7]%2 == 0){
          robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.rotate = [0,0,0,1]; 
          robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.rotateRange = [50,0];
          robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.partAcceleration = 0.0004;  

          robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.rotate = [0,0,0,-1]; 
          robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.rotateRange = [20,0];
          robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.partAcceleration = 0.0004;

          robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotate = [0,0,0,-1]; 
          robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotateRange = [1,0];
          robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotationType = -1;
          robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.partAcceleration = 0.00008; 

          robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.rotate = [0,0,0,1]; 
          robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.rotateRange = [150,0];
          robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.partAcceleration = 0.0004;
        }
        else {
          robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotationType = 0;
        }
        danceCounters[7]++;
      break;

      //arms on hips
      case 'z':
        robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.rotate = [0,0,0,1]; 
        robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.rotateRange = [50,0];
        robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.partAcceleration = 0.0004;  

        robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.rotate = [0,0,0,-1]; 
        robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.rotateRange = [20,0];
        robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.partAcceleration = 0.0004;

        robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotate = [0,0,0,-1]; 
        robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotateRange = [50,0];
        robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.partAcceleration = 0.0004; 

        robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.rotate = [0,0,0,1]; 
        robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.rotateRange = [20,0];
        robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.partAcceleration = 0.0004;
      break;

      //legs out
      case 'x':
        robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.children.bottomLeg.attributes.rotate = [0,0,0,-1];
        robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.children.bottomLeg.attributes.rotateRange = [20,0];
        robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.children.bottomLeg.attributes.partAcceleration = 0.0004;

        robotDataStructure.robot.children.bottomCore.children.robotRightLeg.children.bottomLeg.attributes.rotate = [0,0,0,1];
        robotDataStructure.robot.children.bottomCore.children.robotRightLeg.children.bottomLeg.attributes.rotateRange = [20,0];
        robotDataStructure.robot.children.bottomCore.children.robotRightLeg.children.bottomLeg.attributes.partAcceleration = 0.0004;

        robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.attributes.rotate = [0,0,0,1];
        robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.attributes.rotateRange = [20,0];
        robotDataStructure.robot.children.bottomCore.children.robotLeftLeg.attributes.partAcceleration = 0.0004;

        robotDataStructure.robot.children.bottomCore.children.robotRightLeg.attributes.rotate = [0,0,0,-1];
        robotDataStructure.robot.children.bottomCore.children.robotRightLeg.attributes.rotateRange = [20,0];
        robotDataStructure.robot.children.bottomCore.children.robotRightLeg.attributes.partAcceleration = 0.0004;
      break;

      //body tilt left
      case 'c':
        robotDataStructure.robot.attributes.rotate = [0,0,0,1];
        robotDataStructure.robot.attributes.rotateRange = [4,4];
        robotDataStructure.robot.attributes.rotationType = -1;
        robotDataStructure.robot.attributes.partAcceleration = 0.00008;
      break;
      //body tilt right
      case 'v':
        robotDataStructure.robot.attributes.rotate = [0,0,0,1];
        robotDataStructure.robot.attributes.rotateRange = [-4,-4];
        robotDataStructure.robot.attributes.rotationType = -1;
        robotDataStructure.robot.attributes.partAcceleration = 0.00008;
      break;
      //body stop
      case 'b':
        robotDataStructure.robot.attributes.rotationType = 0;
      break;

    //arms up
      case 'a':
        robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.rotate = [0,0,0,1]; 
        robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.rotateRange = [50,0];
        robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.partAcceleration = 0.0004;  

        robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.rotate = [0,-1,1,0]; 
        robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.rotateRange = [70,0];
        robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.partAcceleration = 0.0004;

        robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotate = [0,0,0,-1]; 
        robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotateRange = [50,0];
        robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.partAcceleration = 0.0004; 

        robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.rotate = [0,-1,-1,0]; 
        robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.rotateRange = [70,0];
        robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.partAcceleration = 0.0004;
      break;
       //arms bob
      case 's':
        robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.rotate = [0,-1,0,0]; 
        robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.rotateRange = [40,40];
        robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.rotationType = -1;
        robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.partAcceleration = 0.0004;  

        robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotate = [0,-1,0,0]; 
        robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotateRange = [40,40];
        robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotationType = -1;
        robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.partAcceleration = 0.0004; 

        robotDataStructure.robot.children.topCore.attributes.rotate = [0,1,0,0]; 
        robotDataStructure.robot.children.topCore.attributes.rotateRange = [4,4];
        robotDataStructure.robot.children.topCore.attributes.rotationType = -1;
        robotDataStructure.robot.children.topCore.attributes.partAcceleration = 0.0004; 
      break;
      //stop arms bob
      case 'd':
        robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.rotationType = 0; 

        robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotationType = 0;

        robotDataStructure.robot.children.topCore.attributes.rotationType = 0;
      break;

      //arms first pump
      case 'q':
        robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.rotate = [0,0,0,1]; 
        robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.rotateRange = [30,0];
        robotDataStructure.robot.children.topCore.children.robotRightArm.children.bottomArm.attributes.partAcceleration = 0.0004;  

        robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.rotate = [0,-1,0,0]; 
        robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.rotateRange = [60,0];
        robotDataStructure.robot.children.topCore.children.robotRightArm.attributes.partAcceleration = 0.0004;

        robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotate = [0,1,0,-1]; 
        robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotateRange = [20,19];
        robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotationType = -1;
        robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.partAcceleration = 0.0004; 

        robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.rotate = [0,-1,0,0]; 
        robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.rotateRange = [180,0];
        robotDataStructure.robot.children.topCore.children.robotLeftArm.attributes.partAcceleration = 0.0004;
      break;
      //spin robo
      case 'w':
        robotDataStructure.robot.attributes.rotate = [0,0,1,0];
        robotDataStructure.robot.attributes.rotateRange = [710,0];
        robotDataStructure.robot.attributes.partAcceleration = 0.0001;
      break;
      //stop fist pump
      case 'e':
        robotDataStructure.robot.children.topCore.children.robotLeftArm.children.bottomArm.attributes.rotationType = 0;
      break;
    } 
  };
}


// UTILITIES

// Last time that this function was called
var g_last = Date.now();
function animate() {
   // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;

  g_last = now;

  return elapsed; 
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

// build text output for robot status 
function buildTextTree(robot, info, indent) {

  // go through all parts of the robot
  for (var robotPart in robot) {

    var something = false;

    var robotHasRotation = false; 
    if (robot[robotPart].attributes.partAcceleration != 0.0 && robot[robotPart].attributes.partAcceleration)
      robotHasRotation = true; 

    var robotHasTranslate = false;
    for(var i = 0; i < 3; i++) {
      if(robot[robotPart].attributes.partTransAcceleration && robot[robotPart].attributes.partTransAcceleration[i] != 0.0) {      
        robotHasTranslate = true;
        break;
      }
    } 

    if(robotHasRotation || robotHasTranslate) {
      var part = robotPart.toUpperCase(); 
      info.push(getSpaces(indent) + part);
      something = true;

      // Rotation
      if(robotHasRotation) {
          
          var axis = "[AXIS:" + robot[robotPart].attributes.rotate[1] + "," + robot[robotPart].attributes.rotate[2] + "," + robot[robotPart].attributes.rotate[3] + "]";
          var speed = "[V:" + robot[robotPart].attributes.partAngleSpeed.toFixed(2) + "]";
          var acceleration = "[A:" + robot[robotPart].attributes.partAcceleration + "]";
          var angle = "[ANGLE:" + robot[robotPart].attributes.rotate[0].toFixed(2) + "]";

          info.push(getSpaces(indent) + angle + speed + acceleration + axis); 
      }
      else {
        info.push(getSpaces(indent) + "[ROTATION: NONE]");
      }

      // Translation
      if(robotHasTranslate) {
          var speed = "[V:" + robot[robotPart].attributes.partSpeed[0].toFixed(2) + "," + robot[robotPart].attributes.partSpeed[1].toFixed(2) + "," + robot[robotPart].attributes.partSpeed[2].toFixed(2) + "]";
          var acceleration = "[A:" + robot[robotPart].attributes.partTransAcceleration[0].toFixed(2) + "," + robot[robotPart].attributes.partTransAcceleration[1].toFixed(2) + "," + robot[robotPart].attributes.partTransAcceleration[2].toFixed(2) + "]";
          var trans = "[TRANSLATION:" + robot[robotPart].attributes.translate[0].toFixed(2) + "," + robot[robotPart].attributes.translate[1].toFixed(2) + "," + robot[robotPart].attributes.translate[2].toFixed(2) + "]";

          info.push(getSpaces(indent) + trans + speed + acceleration);
      }
      else {
        info.push(getSpaces(indent) + "[TRANSLATION: NONE]");
      }
    }

    // part so call for children 
    if(typeof robot[robotPart].children !== "undefined") {
      newIndent = 0;

      if(something) 
        var newIndent = indent + 1; 
      buildTextTree(robot[robotPart].children, info, newIndent); 
    }
  }
}

// get number of tabs needed for given line
function getSpaces(num) {

  var extraIndents = "";

  for(var i = 0; i < num; i++) {
    extraIndents += "\t\t";
  }

  return extraIndents;
}





