const { spawn } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('🚀 Starting ResuMatch AI Platform (Backend + Frontend)');
console.log('====================================================\n');

// 1. Spawn Backend Node.js Server
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  shell: true,
  stdio: 'inherit'
});

// 2. Spawn Frontend Vite Dev Server
const frontend = spawn('npx', ['vite', '--port', '5173'], {
  cwd: path.join(__dirname, 'frontend'),
  shell: true,
  stdio: 'inherit'
});

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
});

frontend.on('close', (code) => {
  console.log(`Frontend process exited with code ${code}`);
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
