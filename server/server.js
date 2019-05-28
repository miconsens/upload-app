const express = require('express')
const multer = require('multer')
const minio = require('minio')
const { gql, ApolloServer } = require('apollo-server');
const app = express()
const { find, filter } = require('lodash');
const port = 4000
const axios = require('axios');
const upload = multer({dest: '/Users/micaela/Desktop/my-app/server/tmp'})
const R= require('ramda')
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/uploadapp', {useNewUrlParser: true});
const db= mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));

const typeDefs = gql`
 type UploadedFile {
   filename: String
   bucketName: ID
   objectName: ID
 }

 type User {
   name: String
   username: String
   uploads: [UploadedFile]
 }

 type Query{
   user(
     username: String
   ): User
   uploads(
     username: String
   ): [UploadedFile]
 }
`;

const resolvers = {
  User: {
    uploads: async ({name, username}, variables, {Upload}) => {
      return await Upload.find({})
     // return filter(uploads, { user: user.name });
    },
  },
  Query: {
    user: async (parent, {username}, context) => {
      return {
        name: 'dasd',
        username: 'username'
      }
      //return context.Uploads.find(user, { id: args.id });
    },
    uploads: async (parent, {username}, {Upload}) => {
      return await Upload.find({})
      //return context.Users.find(uploads)
    }
  },
};

// DATABASE UPLOAD DOCUMENT SCHEMA
const uploadSchema = new mongoose.Schema({
  bucketName: {type: String, default: 'uploads'},
  objectName: {type: mongoose.Schema.Types.ObjectId, auto: true},
  filename: String
})
const Upload = mongoose.model('Upload', uploadSchema)

const context = async ({req}) =>{
  console.log('context being made')
  return{
    req,
    Upload
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

const minioClient = new minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    // CHANGE THESE WHEN RUNNING MINIO FROM DOCKER
     accessKey: 'AKIAIOSFODNN7EXAMPLE',
     secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
});
  // Make a bucket called uploads.
minioClient.makeBucket('uploads', 'us-east-1', function(err) {
    if (err) return console.log(err)
    console.log('Bucket created successfully in "us-east-1".')
})

const expressPath = '/Users/micaela/Desktop/my-app/server'
const minioPath = `${expressPath}/tmp/minio`


const fileNotUploaded = (file, allUploads) => (
    R.not(R.includes(
        R.prop('originalname', file),
        R.pluck('filename', allUploads)
    ))
)

app.get('/upload/all',
    async (req, res) => {
        const uploads = await Upload.find({})
        console.log(uploads)
        res.json(uploads)
        //res.sendStatus(200)
    }
)

app.get('/upload/download/:objectName',
    async (req, res) => {
        const {params: {objectName}} = req
        const uploadReference = await Upload.findOne({objectName})
        const {filename} = uploadReference;
        res.download(`${minioPath}/${filename}`, (err)=>{
            if (err) {
                next(err);
              } else {
                console.log('Sent:', filename)
              }
        })
})


app.put('/upload', upload.single('uploadedFile'),
    async (req, res, next) => {
        const {file} = req
        const {originalname} = file;
        const upload = new Upload({filename: originalname})
        const allUploads = await Upload.find({})
        // console.log(allUploads)
        if (fileNotUploaded(file, allUploads)) {
            const {bucketName, objectName, filename} = await upload.save()
            console.log(`${objectName}`)
            const metaData = { 
                'Content-Type': 'application/octet-stream',
                'X-Amz-Meta-Testing': 1234,
                'example': 5678
            }
            // Using fPutObject API upload your file to the bucket
            minioClient.fPutObject(bucketName, `${objectName}`, file.path, metaData, function(err, etag) {
                if (err) return console.log(err, etag)
                console.log('File uploaded successfully.')
                // Publish to upload notification channel when MinIO done
                // Do this for each file you need
                minioClient.fGetObject(bucketName, `${objectName}`, `${minioPath}/${filename}`,
                    err => {
                        if (err) {return console.log(err)}
                        console.log('File successfully downloaded')
                        //session.publish('uploads.upload', [], {uploadedFilePath: etag})
                    }
                )
            })
            // console.log(file);
        }
        res.sendStatus(200);
    }
)
db.once(
    'open',
    () => {
      console.log('Database connection open')
      app.listen(port, () => console.log(`Express server on ${port}!`))
      server.listen(serverOptions).then(({ url }) => {
        console.log(`Server ready at ${url}`);
      });
    }
)
