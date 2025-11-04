const mongoose = require('mongoose');
const Loc = mongoose.model('Location');

// 특정 장소 상세 조회 (Read One)
const locationsReadOne = async (req, res) => {
  try {
    const location = await Loc.findOne({ _id: req.params.locationid }).exec();

    if (!location) {
      return res.status(404).json({ message: "location not found" });
    }
    
    res.status(200).json(location);
  } catch (err) {
    console.error("Error in locationsReadOne:", err);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
};

// 장소 목록 거리 기반 조회 (List By Distance)
const locationsListByDistance = async (req, res) => {
  const lng = parseFloat(req.query.lng);
  const lat = parseFloat(req.query.lat);

  if (isNaN(lng) || isNaN(lat)) {
    return res
      .status(400)
      .json({ "message": "경도(lng)와 위도(lat)가 유효한 숫자가 아닙니다." });
  }

  const near = {
    type: "Point",
    coordinates: [lng, lat]
  };
  
  const geoOptions = {
    distanceField: "distance.calculated", 
    spherical: true,                     
    maxDistance: 20000,                  
  };
  
  const LIMIT_COUNT = 10; 

  try {
    let results = await Loc.aggregate([
      {
        $geoNear: {
          near,
          ...geoOptions
        }
      },
      { $limit: LIMIT_COUNT } 
    ]);

    const locations = results.map(result => {
      const distanceWithUnit = `${Math.round(result.distance.calculated)}m`;

      return {
        _id: result._id,
        name: result.name,
        address: result.address,
        rating: result.rating,
        facilities: result.facilities,
        distance: distanceWithUnit
      };
    });

    res.status(200).json(locations);

  } catch (err) {
    console.error("Error in locationsListByDistance:", err);
    res.status(500).json({ error: '데이터를 조회하는 중 서버 오류가 발생했습니다.' });
  }
};

// 장소 생성 (Create)
const locationsCreate = async (req, res) => {
    console.log("-------------------");
    console.log("Received Body:", req.body);
    try {
        // 1. 요청 본문(req.body)의 데이터를 사용하여 새 문서 객체 생성
        const newLocation = await Loc.create({
            name: req.body.name,
            address: req.body.address,
            // 쉼표로 구분된 문자열을 배열로 변환
            facilities: req.body.facilities.split(",").map(item => item.trim()), 
            coords: {
                type: "Point",
                coordinates: [
                    // 문자열을 숫자로 변환
                    parseFloat(req.body.lng),
                    parseFloat(req.body.lat)
                ]
            },
            openingTimes: [{
                days: req.body.days1,
                opening: req.body.opening1,
                closing: req.body.closing1,
                // 문자열 'true'를 boolean true로 변환
                closed: req.body.closed1 === 'true' 
            },
            {
                days: req.body.days2,
                opening: req.body.opening2,
                closing: req.body.closing2,
                closed: req.body.closed2 === 'true'
            }]
        });

        // 2. HTTP 201 Created 상태 코드와 함께 새로 생성된 문서 반환
        res.status(201).json(newLocation); 

    } catch (err) {
        // 3. 데이터 유효성 검사 실패 등 오류 발생 시 처리
        console.error("Error creating location:", err);
        res.status(400).json(err); // 400 Bad Request
    }
};

// 나머지 함수 (Update, Delete)
const locationsUpdateOne = (req, res) => {
  res.status(200).json({"status" : "success"});
};
const locationsDeleteOne = (req, res) => {
  res.status(200).json({"status" : "success"});
};

module.exports = {
  locationsListByDistance,
  locationsCreate,
  locationsReadOne,
  locationsUpdateOne,
  locationsDeleteOne
};