const express = require('express')
const multer = require('multer')
const { ApolloServer, ApolloError } = require('apollo-server')
const { Upload, User, db } = require('./mongoSchema')
const { minioClient } = require('./minioClient')
const { resolvers } = require('./resolvers')
const { typeDefs } = require('./typeDefs')
const app = express()
const port = 4000

const context = async ({ req }) => {
  return {
    req,
    Upload,
    User
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  debug: true,
  context
})

const serverOptions = {
  cors: {
    credentials: true,
    origin: [`http://localhost:3000`]
  },
  port: 8000,
  playground: '/gqlplayground',
  endpoint: '/graphql',
  subscriptions: '/graphql'
}

minioClient.listBuckets(function(e, buckets) {
  if (e) return console.log(e)
  console.log('buckets :', buckets)
})

var objectsStream = minioClient.listObjectsV2(
  '5cf69f0c3d57a51cba9aece3',
  '',
  true,
  ''
)
objectsStream.on('data', function(obj) {
  console.log(obj)
})
objectsStream.on('error', function(e) {
  console.log(e)
})

app.get('/upload/download/:objectName', async (req, res, next) => {
  const {
    params: { objectName }
  } = req
  const uploadReference = await Upload.findOne({ objectName })
  const { filename, bucketName } = uploadReference

  minioClient.getObject(`${bucketName}`, `${objectName}`, function(
    err,
    dataStream
  ) {
    if (err) {
      return console.log(err)
    }
    res.set({
      'Content-Disposition': `attachment; filename=${filename}`
    })
    dataStream.pipe(res)
  })
})

db.once('open', () => {
  console.log('Database connection open')
  // DROP DATABASES
  User.deleteMany({})
  Upload.deleteMany({})
  // START SERVICES
  app.listen(port, () => console.log(`Express server on ${port}!`))
  server.listen(serverOptions).then(({ url }) => {
    console.log(`Server ready at ${url}`)
  })
})

module.exports = {
  minioClient
}
