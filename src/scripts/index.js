import '../styles/index.scss';
import * as mat2 from "gl-matrix";


if (process.env.NODE_ENV === 'development') {
  require('../index.html');
}

document.addEventListener("DOMContentLoaded", start);
var gl;

function createCube() {

  var cube = {};

  cube.positions = [
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

  cube.positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cube.positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.positions), gl.STATIC_DRAW);

  const faceColors = [
      [1.0,  0.0,  0.0,  1.0],    // Front face: white
      [0.0,  1.0,  0.0,  1.0],    // Back face: red
      [0.0,  0.0,  1.0,  1.0],    // Top face: green
      [1.0,  1.0,  0.0,  1.0],    // Bottom face: blue
      [1.0,  0.0,  1.0,  1.0],    // Right face: yellow
      [0.0,  1.0,  1.0,  1.0]    // Left face: purple
    ];

  cube.colors = []; 

  faceColors.forEach(function(color)  {
      for(var i = 0; i < 6; i++) {
          cube.colors = cube.colors.concat(color);
      } 
  });  


  cube.colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cube.colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.colors), gl.STATIC_DRAW);


  cube.vertexShader = getAndCompileShader("vertexShader");
  cube.fragmentShader = getAndCompileShader("fragmentShader");
  cube.shaderProgram = gl.createProgram();

  gl.attachShader(cube.shaderProgram, cube.vertexShader);
  gl.attachShader(cube.shaderProgram, cube.fragmentShader);
  gl.linkProgram(cube.shaderProgram);

  if(!gl.getProgramParameter(cube.shaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
  }

  cube.vao = gl.createVertexArray();
  gl.bindVertexArray(cube.vao);

  cube.positionAttributeLocation = gl.getAttribLocation(cube.shaderProgram, "position");
  gl.enableVertexAttribArray(cube.positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, cube.positionBuffer);
  //void gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
  gl.vertexAttribPointer(cube.positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);


  cube.colorAttributeLocation = gl.getAttribLocation(cube.shaderProgram, "color");
  gl.enableVertexAttribArray(cube.colorAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, cube.colorBuffer);
  //void gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
  gl.vertexAttribPointer(cube.colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);

  cube.modelMatrix = mat2.mat4.create();
  cube.modelMatrixLocation = gl.getUniformLocation(cube.shaderProgram, "modelMatrix");

  return cube;
}

function start(){
 
  console.log("Started");
  var canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl2");

  var cube = createCube();

  gl.useProgram(cube.shaderProgram);

  var viewMatrix = mat2.mat4.create();
  var projectionMatrix = mat2.mat4.create();

  mat2.mat4.perspective(projectionMatrix, 45*Math.PI/180.0,canvas.width/canvas.height, 0.1, 10); 
  
  var viewMatrixLocation = gl.getUniformLocation(cube.shaderProgram, "viewMatrix");
  var projectionMatrixLocation = gl.getUniformLocation(cube.shaderProgram, "projectionMatrix");

  gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

  var angle = .1;

  requestAnimationFrame(runRenderLoop);

  function runRenderLoop() {
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);

      mat2.mat4.identity(cube.modelMatrix);
      mat2.mat4.translate(cube.modelMatrix, cube.modelMatrix, [-2, 0, -7]);
      mat2.mat4.rotateY(cube.modelMatrix, cube.modelMatrix, angle);
      mat2.mat4.rotateX(cube.modelMatrix, cube.modelMatrix, angle);
      angle += .01;

      gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
      gl.uniformMatrix4fv(cube.modelMatrixLocation, false, cube.modelMatrix);
      gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);


      gl.useProgram(cube.shaderProgram);
      gl.bindVertexArray(cube.vao);
      gl.drawArrays(gl.TRIANGLES, 0, 36);

      mat2.mat4.identity(cube.modelMatrix);
      mat2.mat4.translate(cube.modelMatrix, cube.modelMatrix, [0, 0, -7]);
      mat2.mat4.rotateY(cube.modelMatrix, cube.modelMatrix, angle);
      mat2.mat4.rotateX(cube.modelMatrix, cube.modelMatrix, angle);
      angle += .01;

      gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
      gl.uniformMatrix4fv(cube.modelMatrixLocation, false, cube.modelMatrix);
      gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);


      gl.useProgram(cube.shaderProgram);
      gl.bindVertexArray(cube.vao);
      gl.drawArrays(gl.TRIANGLES, 0, 36);

      mat2.mat4.identity(cube.modelMatrix);
      mat2.mat4.translate(cube.modelMatrix, cube.modelMatrix, [2, 0, -7]);
      mat2.mat4.rotateY(cube.modelMatrix, cube.modelMatrix, angle);
      mat2.mat4.rotateX(cube.modelMatrix, cube.modelMatrix, angle);
      angle += .01;

      gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
      gl.uniformMatrix4fv(cube.modelMatrixLocation, false, cube.modelMatrix);
      gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);


      gl.useProgram(cube.shaderProgram);
      gl.bindVertexArray(cube.vao);
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