const {Schema, model} = require('mongoose');

const schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: false,
  },
  photo: {
    type: String,
    required: false,
  },
});

module.exports = model('User', schema);
