const mongoose = require("mongoose");

const StationSchema = new mongoose.Schema({
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

module.exports = Station = mongoose.model("station", StationSchema);