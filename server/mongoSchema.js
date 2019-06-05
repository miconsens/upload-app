const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/uploadapp', {useNewUrlParser: true});
const db= mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));

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

  module.exports = {
    Upload,
    User,
    mongoose,
    db
  }