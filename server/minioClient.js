const minio = require('minio');

const minioClient = new minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    // CHANGE THESE WHEN RUNNING MINIO FROM DOCKER
     accessKey: 'AKIAIOSFODNN7EXAMPLE',
     secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
  });

  module.exports={
      minioClient
  }