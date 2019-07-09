const { ApolloError } = require('apollo-server')
const { minioClient } = require('./minioClient')

const resolvers = {
  User: {
    uploads: async ({ userID }, variables, { Upload }) => {
      return await Upload.find({ bucketName: userID })
    }
  },
  Query: {
    user: async (parent, { userID }, { User }) => {
      return await User.findOne({ userID })
    },
    uploads: async (parent, { userID }, { Upload }) => {
      return await Upload.find({ bucketName: userID })
    }
  },
  Mutation: {
    authenticate: async (parent, { username, password }, { User }) => {
      const returningUser = await User.findOne({ username, password })
      if (!returningUser) {
        throw new ApolloError('Username or password is invalid')
      }
      return returningUser
    },
    register: async (parent, { username, password }, { User }) => {
      const existing = await User.findOne({ username })
      if (!existing) {
        const newUser = new User({ username, password })
        const { userID } = await newUser.save()
        // Make a bucket with the user's ID.
        minioClient.makeBucket(`${userID}`, 'us-east-1', function(err) {
          if (err) return console.log(err)
          console.log('Users bucket created successfully in "us-east-1".')
        })
        return newUser
      } else {
        throw new ApolloError('User already exists')
      }
    },
    createUpload: async (parent, { userID, file }, { Upload }) => {
      const { filename, mimetype, encoding, createReadStream } = await file
      const stream = createReadStream()
      const newUpload = new Upload({ bucketName: userID, filename })
      const { objectName } = await newUpload.save()
      minioClient.putObject(`${userID}`, `${objectName}`, stream, function(
        err,
        etag
      ) {
        if (err) {
          return console.log(err)
        }
      })
      return null
    },

    createPresignedLink: async (
      parent,
      { bucketName, objectName },
      { Upload }
    ) => {
      const upload = await Upload.findOne({ bucketName, objectName })
      const { filename } = upload
      return new Promise((resolve, reject) => {
        minioClient.presignedGetObject(
          `${bucketName}`,
          `${objectName}`,
          24 * 60 * 60,
          {
            'response-content-disposition': `attachment; filename=${filename}`
          },
          function(err, presignedUrl) {
            if (err) return reject(err)
            resolve(presignedUrl)
          }
        )
      })
    }
  }
}

module.exports = {
  resolvers
}
