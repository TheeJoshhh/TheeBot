const mongoose = require('mongoose');

const data = {
  type: Array,
  default: [],
  required: false
}

const ModeratorsSchema = new mongoose.Schema({
  _id: String,
  users: data,
  roles: data
});

module.exports = mongoose.model('Moderators', ModeratorsSchema);