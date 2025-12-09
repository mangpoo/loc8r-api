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

// [디버깅 로그 추가] 장소 목록 거리 기반 조회
const locationsListByDistance = async (req, res) => {
  // 1. API 진입 로그
  console.log("=========================================");
  console.log("1. [API 요청 받음] locationsListByDistance 시작");

  const lng = parseFloat(req.query.lng);
  const lat = parseFloat(req.query.lat);
  const maxDistance = parseFloat(req.query.maxDistance) || 20000;

  console.log(`2. [파라미터 확인] 경도(lng): ${lng}, 위도(lat): ${lat}, 거리: ${maxDistance}`);

  if (isNaN(lng) || isNaN(lat)) {
    console.log("X. [에러] 좌표가 숫자가 아님");
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
    maxDistance: maxDistance,
  };
  
  const LIMIT_COUNT = 10; 

  try {
    // 3. DB 검색 직전 로그
    console.log("3. [DB 검색 시작] MongoDB에 쿼리를 보냅니다...");
    
    // ★★★ 여기가 멈추는 구간인지 확인해야 함 ★★★
    let results = await Loc.aggregate([
      {
        $geoNear: {
          near,
          ...geoOptions
        }
      },
      { $limit: LIMIT_COUNT } 
    ]);

    // 4. DB 검색 성공 로그
    console.log(`4. [DB 검색 완료] 결과 개수: ${results.length}개`);

    const locations = results.map(result => {
      return {
        _id: result._id,
        name: result.name,
        address: result.address,
        rating: result.rating,
        facilities: result.facilities,
        distance: Math.round(result.distance.calculated)
      };
    });

    console.log("5. [응답 전송] 클라이언트로 데이터를 보냅니다.");
    res.status(200).json(locations);

  } catch (err) {
    console.error("!!! [치명적 에러] DB 조회 중 에러 발생:", err);
    res.status(500).json({ error: '데이터를 조회하는 중 서버 오류가 발생했습니다.' });
  }
};

// 장소 생성 (Create)
const locationsCreate = async (req, res) => {
    console.log("-------------------");
    console.log("Received Body:", req.body);
    try {
        const newLocation = await Loc.create({
            name: req.body.name,
            address: req.body.address,
            facilities: req.body.facilities.split(",").map(item => item.trim()), 
            coords: {
                type: "Point",
                coordinates: [
                    parseFloat(req.body.lng),
                    parseFloat(req.body.lat)
                ]
            },
            openingTimes: [{
                days: req.body.days1,
                opening: req.body.opening1,
                closing: req.body.closing1,
                closed: req.body.closed1 === 'true' 
            },
            {
                days: req.body.days2,
                opening: req.body.opening2,
                closing: req.body.closing2,
                closed: req.body.closed2 === 'true'
            }]
        });

        res.status(201).json(newLocation); 

    } catch (err) {
        console.error("Error creating location:", err);
        res.status(400).json(err); 
    }
};

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