const {Schema, model} = require('mongoose');

const schema = new Schema({
  createdBy: {
    type: String,
    required: true,
  },
  assignedTo: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  sizes: {
    width: {type: Number, required: true},
    height: {type: Number, required: true},
    length: {type: Number, required: true},
    weight: {type: Number, required: true},
  },
});

module.exports = model('Truck', schema);
