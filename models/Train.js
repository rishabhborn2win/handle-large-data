const mongoose = require("mongoose");

const TrainSchema = new mongoose.Schema({
    geometry: {
        type: {type: String},
        coordinates: [{type: Number}]
    },
    properties: {
        state: {type: String},
        code: {type: String},
        name: {type: String},
        zone: {type: String},
        address: {type: String}
    }
})

module.exports = Train = mongoose.model("train", TrainSchema);