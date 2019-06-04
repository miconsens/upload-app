const express = require('express')
const multer = require('multer')
const minio = require('minio')
const { gql, ApolloServer, ApolloError } = require('apollo-server');
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
   username: String
   userID: ID
   uploads: [UploadedFile]
 }

 type Query{
   user(
     userID: String
   ): User
   uploads(
     userID: String
   ): [UploadedFile]
 }

 type Mutation{
   authenticate(
     username: String
     password: String
   ): User
   register(
     username: String
     password: String
   ): User
 }
`;

const resolvers = {
  User: {
    uploads: async ({userID}, variables, {Upload}) => {
      // console.log(userID)
      return await Upload.find({bucketName: userID})
     // return filter(uploads, { user: user.name });
    },
  },
  Query: {
    user: async (parent, {userID}, {User}) => {
      return await User.findOne({userID})
      //return context.Uploads.find(user, { id: args.id });
    },
    uploads: async (parent, {userID}, {Upload}) => {
      return await Upload.find({bucketName: userID})
      //return context.Users.find(uploads)
    }
  },
  Mutation: {
    authenticate: async (parent, {username, password}, {User}) =>{
      // console.log('auth', username, password)
      const returningUser = await User.findOne({username, password})
      if (!returningUser){
        throw new ApolloError('Username or password is invalid')
      }
      return returningUser
    },
    register: async (parent, {username, password}, {User}) =>{
      const existing =  await User.findOne({username});
      if (!existing){
        const newUser = new User({ username, password});
        // console.log('New user');
        const {userID} = await newUser.save()
        // Make a bucket with the user's ID.
        minioClient.makeBucket(`${userID}`, 'us-east-1', function(err) {
          if (err) return console.log(err)
          console.log('Users bucket created successfully in "us-east-1".')
        })
        return newUser
      } else {
        throw new ApolloError('User already exists')
      }
    }
  },
};

// DATABASE UPLOAD DOCUMENT SCHEMA
const uploadSchema = new mongoose.Schema({
  bucketName: {type: mongoose.Schema.Types.ObjectId}, // no auto since passed in from userID
  objectName: {type: mongoose.Schema.Types.ObjectId, auto: true},
  filename: String
})
const Upload = mongoose.model('Upload', uploadSchema)

//DATABASE USER SCHEMA
const userSchema = new mongoose.Schema({
  username: {type: String},
  password: {type: String},
  userID: {type: mongoose.Schema.Types.ObjectId, auto: true},
})

const User = mongoose.model('User', userSchema)

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

const minioClient = new minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    // CHANGE THESE WHEN RUNNING MINIO FROM DOCKER
     accessKey: 'AKIAIOSFODNN7EXAMPLE',
     secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
});

minioClient.listBuckets(function(e, buckets) {
  if (e) return console.log(e)
  console.log('buckets :', buckets)
})

var objectsStream = minioClient.listObjectsV2('uploads', '', true,'')
objectsStream.on('data', function(obj) {
  console.log(obj)
})
objectsStream.on('error', function(e) {
  console.log(e)
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
        // console.log(uploads)
        res.json(uploads)
        //res.sendStatus(200)
    }
)

app.get('/upload/download/:objectName',
    async (req, res, next) => {
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
