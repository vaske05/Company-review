var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
  body: { type: String, required: true }


});

module.exports = mongoose.model('Message', messageSchema);
