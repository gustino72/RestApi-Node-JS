const Service = require('node-windows').Service;

const svc = new Service({
  name: "SERVER_TIMBANGAN",
  description: "MediaSoft Solusindo",
  script: "D:\\SITIMPA\\server_timbangan\\index_deploy.js"
});

svc.on('install', function() {
  svc.start();
});

svc.on('uninstall', function() {
  svc.stop();
});

svc.install();
// svc.uninstall();