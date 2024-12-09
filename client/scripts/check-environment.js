import { execSync } from 'child_process';

try {
  // Check Node.js version
  const nodeVersion = execSync('node --version').toString().trim();
  console.log('Node.js version:', nodeVersion);

  // Check npm version
  const npmVersion = execSync('npm --version').toString().trim();
  console.log('npm version:', npmVersion);

  console.log('\nEnvironment check passed! ✅');
  console.log('\nTo start the application:');
  console.log('1. Run "npm install" in both root and client directories');
  console.log('2. Run "npm run dev" to start the development server');
  console.log('3. Open http://localhost:5173 in your browser\n');
} catch (error) {
  console.error('\n❌ Error: Node.js or npm is not properly installed.\n');
  console.error('Please follow these steps to fix this issue:');
  console.error('1. Download and install Node.js from https://nodejs.org/ (LTS version recommended)');
  console.error('2. The installation will include npm automatically');
  console.error('3. After installation, close all terminal windows');
  console.error('4. Open a new terminal and verify the installation by typing:');
  console.error('   node --version');
  console.error('   npm --version\n');
  console.error('If you still see this error after installation, you may need to:');
  console.error('1. Add Node.js to your system PATH');
  console.error('2. Restart your computer\n');
  process.exit(1);
}