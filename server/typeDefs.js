const { gql } = require('apollo-server')

const typeDefs = gql`
  type UploadedFile {
    filename: String
    bucketName: ID
    objectName: ID
  }

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type User {
    username: String
    userID: ID
    uploads: [UploadedFile]
  }

  type Query {
    user(userID: ID): User
    uploads(userID: ID): [UploadedFile]
  }

  type Mutation {
    authenticate(username: String, password: String): User
    register(username: String, password: String): User
    createUpload(file: Upload!, userID: ID): File
    createPresignedLink(bucketName: ID, objectName: ID): String
  }
`

module.exports = {
  typeDefs
}
