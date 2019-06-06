const express = require('express')
const multer = require('multer')
//const minio = require('minio')
const { ApolloServer, ApolloError} = require('apollo-server');
const {Upload, User, db} = require('./mongoSchema');
const {minioClient} = require('./minioClient')
const {resolvers} = require('./resolvers')
const {typeDefs} = require('./typeDefs');
const app = express()
const port = 4000
const upload = multer({dest: '/Users/micaela/Desktop/my-app/server/tmp'})
const R= require('ramda')

const context = async ({req}) =>{
  return{
    req,
    Upload,
    User
  }
}

const server = new ApolloServer(
  {
    typeDefs,
    resolvers,
    debug: true,
    context
  }
)

const serverOptions = {
  cors: {
    credentials: true,
    origin: [`http://localhost:3000`]
  },
  port: 8000,
  playground:"/gqlplayground",
  endpoint: "/graphql",
  subscriptions: '/graphql'
}

minioClient.listBuckets(function(e, buckets) {
  if (e) return console.log(e)
  console.log('buckets :', buckets)
})

var objectsStream = minioClient.listObjectsV2('5cf69f0c3d57a51cba9aece3', '', true,'')
objectsStream.on('data', function(obj) {
  console.log(obj)
})
objectsStream.on('error', function(e) {
  console.log(e)
})



// const fileNotUploaded = (file, allUploads) => (
//     R.not(R.includes(
//         R.prop('originalname', file),
//         R.pluck('filename', allUploads)
//     ))
// )

// app.get('/upload/all',
//     async (req, res) => {
//         const uploads = await Upload.find({})
//         // console.log(uploads)
//         res.json(uploads)
//         //res.sendStatus(200)
//     }
// )

app.get('/upload/download/:objectName',
    async (req, res, next) => {
        const {params: {objectName}} = req
        const uploadReference = await Upload.findOne({objectName})
        const {filename, bucketName} = uploadReference;

        minioClient.getObject(`${bucketName}`, `${objectName}`, function(err, dataStream) {
          if (err) {
            return console.log(err)
          }
          res.set({
            'Content-Disposition': `attachment; filename=${filename}`
          });
          dataStream.pipe(res)
        })
})


// app.put('/upload', upload.single('uploadedFile'),
//     async (req, res, next) => {
//         const {file} = req
//         const {originalname} = file;
//         const upload = new Upload({bucketName: '5cf69f0c3d57a51cba9aece3', filename: originalname})
//         const allUploads = await Upload.find({})
//         // fileNotUploaded needs to be refactored to account for the userID bucketName
//         if (fileNotUploaded(file, allUploads)) {
//             const {bucketName, objectName, filename} = await upload.save()
//             console.log('UPLOADING FILE', bucketName, objectName)
//             const metaData = { 
//                 'Content-Type': 'application/octet-stream',
//                 'X-Amz-Meta-Testing': 1234,
//                 'example': 5678
//             }
//             console.log(file.path, 'filePath')
//             // Using fPutObject API upload your file to the bucket
//             minioClient.fPutObject(`${bucketName}`, `${objectName}`, file.path, metaData, function(err, etag) {
//                 if (err) return console.log(err, etag)
//                 console.log('File uploaded successfully.')
//             })
//         }
//         res.sendStatus(200);
//     }
// )
db.once(
    'open',
    () => {
      console.log('Database connection open')
      // DROP DATABASES
      User.deleteMany({})
      Upload.deleteMany({})
      // START SERVICES
      app.listen(port, () => console.log(`Express server on ${port}!`))
      server.listen(serverOptions).then(({ url }) => {
        console.log(`Server ready at ${url}`);
      });
    }
)

module.exports={
  minioClient
}