import '../styles/index.scss';
import * as mat2 from "gl-matrix";


if (process.env.NODE_ENV === 'development') {
  require('../index.html');
}

document.addEventListener("DOMContentLoaded", start);
var gl;

function start(){
 
  console.log("Started");
  var canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl2");

  const positions = [
      // Front face
      -0.5, -0.5, -0.5,
      0.5, -0.5, -0.5,
      0.5, 0.5,  -0.5,
      0.5, 0.5,  -0.5,
      -0.5,  0.5,  -0.5,
      -0.5,  -0.5,  -0.5,
    
      // Back face
      -0.5, -0.5, 0.5,
      0.5, -0.5, 0.5,
      0.5, 0.5, 0.5,
      0.5,  0.5, 0.5,
      -0.5,  0.5, 0.5,
      -0.5, -0.5, 0.5,
    
      // Top face
      -0.5,  0.5, 0.5,
      -0.5,  0.5, -0.5,
      -0.5,  -0.5, -0.5,
      -0.5,  -0.5,  -0.5,
      -0.5,  -0.5,  0.5,
      -0.5,  0.5, 0.5,
    
      // Bottom face
      0.5, 0.5, 0.5,
      0.5, 0.5, -0.5,
      0.5, -0.5, -0.5,
      0.5, -0.5, -0.5,
      0.5, -0.5,  0.5,
      0.5, 0.5,  0.5,
    
      // Right face
      -0.5, -0.5, -0.5,
      0.5,  -0.5, -0.5,
      0.5,  -0.5,  0.5,
      0.5, -0.5,  0.5,
      -0.5, -0.5, 0.5,
      -0.5, -0.5, -0.5,
    
      // Left face
      -0.5, 0.5, -0.5,
      0.5, 0.5,  -0.5,
      0.5,  0.5,  0.5,
      0.5,  0.5, 0.5,
      -0.5, 0.5, 0.5,
      -0.5, 0.5, -0.5
    ];

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const faceColors = [
      [1.0,  0.0,  0.0,  1.0],    // Front face: white
      [0.0,  1.0,  0.0,  1.0],    // Back face: red
      [0.0,  0.0,  1.0,  1.0],    // Top face: green
      [1.0,  1.0,  0.0,  1.0],    // Bottom face: blue
      [1.0,  0.0,  1.0,  1.0],    // Right face: yellow
      [0.0,  1.0,  1.0,  1.0]    // Left face: purple
    ];

  var colors = []; 

  faceColors.forEach(function(color)  {
      for(var i = 0; i < 6; i++) {
          colors = colors.concat(color);
      } 
  });  


  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);


  var vertexShader = getAndCompileShader("vertexShader");
  var fragmentShader = getAndCompileShader("fragmentShader");
  var shaderProgram = gl.createProgram();

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
  }

  gl.useProgram(shaderProgram);

  var vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  var positionAttributeLocation = gl.getAttribLocation(shaderProgram, "position");
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  //void gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);


  var colorAttributeLocation = gl.getAttribLocation(shaderProgram, "color");
  gl.enableVertexAttribArray(colorAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  //void gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
  gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);

  var modelMatrix = mat2.mat4.create();
  var viewMatrix = mat2.mat4.create();
  var projectionMatrix = mat2.mat4.create();

  mat2.mat4.perspective(projectionMatrix, 45*Math.PI/180.0,canvas.width/canvas.height, 0.1, 10); 
  
  var modelMatrixLocation = gl.getUniformLocation(shaderProgram, "modelMatrix");
  var viewMatrixLocation = gl.getUniformLocation(shaderProgram, "viewMatrix");
  var projectionMatrixLocation = gl.getUniformLocation(shaderProgram, "projectionMatrix");

  gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

  var angle = .1;

  requestAnimationFrame(runRenderLoop);

  function runRenderLoop() {
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);

      mat2.mat4.identity(modelMatrix);
      mat2.mat4.translate(modelMatrix, modelMatrix, [0, 0, -7]);
      mat2.mat4.rotateY(modelMatrix, modelMatrix, angle);
      mat2.mat4.rotateX(modelMatrix, modelMatrix, angle);
      angle += .01;

      gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
      gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
      gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);


      gl.useProgram(shaderProgram);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 36);

      requestAnimationFrame(runRenderLoop);

  }
}


function getAndCompileShader(id) {
var shader;
var shaderElement = document.getElementById(id);
var shaderText = shaderElement.textContent.trim();

if(id == "vertexShader")
    shader = gl.createShader(gl.VERTEX_SHADER);
else if (id == "fragmentShader")  
    shader = gl.createShader(gl.FRAGMENT_SHADER);  

gl.shaderSource(shader, shaderText);
gl.compileShader(shader);

if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
}
return shader; 

}