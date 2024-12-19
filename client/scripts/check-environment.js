const { execSync } = require('child_process');

function checkNodeVersion() {
  const nodeVersion = process.version;
  console.log('Node.js version:', nodeVersion);
  
  const major = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (major < 16) {
    console.error('Error: Node.js version 16 or higher is required');
    process.exit(1);
  }
}

function checkNpmVersion() {
  try {
    const npmVersion = execSync('npm -v').toString().trim();
    console.log('npm version:', npmVersion);
    
    const major = parseInt(npmVersion.split('.')[0]);
    if (major < 7) {
      console.error('Error: npm version 7 or higher is required');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error: Unable to determine npm version');
    process.exit(1);
  }
}

function main() {
  checkNodeVersion();
  checkNpmVersion();
  console.log('\nEnvironment check passed! ✅\n');
  console.log('To start the application:');
  console.log('1. Run "npm install" in both root and client directories');
  console.log('2. Run "npm run dev" to start the development server');
  console.log('3. Open http://localhost:5173 in your browser\n');
}

main();