const { gql} = require('apollo-server');

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

module.exports = {
    typeDefs
  }