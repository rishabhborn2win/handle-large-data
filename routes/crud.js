const express = require("express");
const router = express.Router();
const Station = require("../models/Station");
const Train = require("../models/Train");

router.get("/", (req, res) => {
  res.send("Hi I am in Route Folder");
});

//get Station details using the station code
router.get("/:station_code", (req, res) => {
  Station.find({ "properties.code": req.params.station_code })
    .then((virtualRes) => res.status(200).json(virtualRes))
    .catch((err) => {
      console.log(err.message);
      return res.send(err.message);
    });
});

//aggregate the train details
router.get("/train_details/:train_number", (req, res) => {
  Train.aggregate([
    { $match: { "properties.number": req.params.train_number } },
    {
      $lookup: {
        from: "schedules",
        localField: "properties.number",
        foreignField: "train_number",
        as: "schedule",
      },
    },
    {
      $project: {
        train_number: "$properties.number",
        train_name: "$properties.name",
        from_station_code: "$properties.from_station_code",
        from_station_name: "$properties.from_station_name",
        to_station_code: "$properties.to_station_code",
        to_station_name: "$properties.to_station_name",
        type: "$properties.type",
        arrival: "$properties.arrival",
        departure: "$properties.departure",
        distance: "$properties.distance",
        return_train: "$properties.return_train",
        coaches: {
          third_ac: "$properties.third_ac",
          second_ac: "$properties.second_ac",
          first_ac: "$properties.first_ac",
          chair_car: "$properties.chair_car",
          sleeper: "$properties.sleeper",
          first_class: "$properties.first_class",
        },
        zone: "$properties.zone",
        duration: {
          hour: "$properties.duration_h",
          min: "$properties.duration_m",
        },
        running_route: "$geometry.coordinates",
        schedule: 1,
      },
    },
  ])
    .then((virtualRes) => {
      console.log("Result Found");
      //add the field of the stopping station
      var stoppingStations = [], sourceStationLat, sourceStationLon;

      //as for the source station of the train the arrival will be none
      sourceStationLat = virtualRes[0].running_route[0][0];
      sourceStationLon = virtualRes[0].running_route[0][1];

      virtualRes[0].schedule.map((station, index) => {
        station.distance = getDistanceFromLatLonInKm( virtualRes[0].running_route[index][1], virtualRes[0].running_route[index][0], sourceStationLon, sourceStationLat);
        console.log(station.distance)
         
          //checking weather the train stops at the staion or not
        if (station.arrival === "None" ) {
            stoppingStations.push(station);
        }else if(station.departure == "None"){
            stoppingStations.push(station);
        }else{
            var splitted1 = station.departure.split(":");
            var splitted2 = station.arrival.split(":");
            var time1 = splitted1[0] * 60 + splitted1[1];
            var time2 = splitted2[0] * 60 + splitted2[1];
            var minutesDiff = time1 > time2 ? time1 - time2 : time2 - time1;
            if (minutesDiff > 0) {
              console.log("Minutes Difference" + minutesDiff);
              
              stoppingStations.push(station);
            }
        }
       
      });
      console.log(stoppingStations)
      virtualRes[0]["stopping_station"] = stoppingStations;
      return res.status(200).json(virtualRes);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ msg: err.message });
    });
});

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }
module.exports = router;
