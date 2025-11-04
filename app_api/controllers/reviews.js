const mongoose = require('mongoose');
const Loc = mongoose.model('Location');

// ===============================================
// 내부 도우미 함수: 평균 평점 계산 및 업데이트
// ===============================================
const updateAverageRating = async (locationId) => {
    try {
        // ID로 장소 문서 조회 (평점 필드만 선택)
        const location = await Loc.findById(locationId).select('rating reviews').exec();
        
        if (!location) return; // 장소가 없으면 종료

        if (location.reviews && location.reviews.length > 0) {
            const count = location.reviews.length;
            const totalRating = location.reviews.reduce((sum, review) => sum + review.rating, 0);
            
            // 새 평균 평점 계산 (소수점 이하 1자리로 반올림)
            const newAverageRating = (totalRating / count).toFixed(1);

            // 장소 문서의 rating 필드 업데이트
            location.rating = parseFloat(newAverageRating);

            await location.save();
        } else {
            // 리뷰가 없다면 평점 0으로 초기화
            location.rating = 0;
            await location.save();
        }
    } catch (err) {
        console.error("Error updating average rating:", err);
    }
};

// ===============================================
// 리뷰 생성 로직 (평균 평점 업데이트 로직 추가)
// ===============================================
const doAddReview = async (req, res, location) => {
    if (!location.reviews) {
        location.reviews = [];
    }
    
    // rating을 숫자로 변환
    const newRating = parseInt(req.body.rating, 10);
    
    location.reviews.push({
        author: req.body.author,
        rating: newRating,
        reviewText: req.body.reviewText
    });
    
    try {
        await location.save();
        // ⭐ 리뷰 추가 후 평균 평점 업데이트
        await updateAverageRating(location._id); 
        
        const thisReview = location.reviews.slice(-1)[0];
        return res.status(201).json(thisReview);
    } catch (err) {
        return res.status(400).json(err);
    }
};

// ===============================================
// 리뷰 수정 (PUT) 로직
// ===============================================
const reviewsUpdateOne = async (req, res) => {
    const { locationid, reviewid } = req.params;
    
    // 1. 필수 파라미터 검증
    if (!locationid || !reviewid) {
        return res.status(404).json({ "message": "Not found, locationid and reviewid are both required" });
    }

    try {
        // 2. 장소 찾기 (이름, 리뷰 배열, 평점 필드 선택)
        const location = await Loc.findById(locationid)
            .select('name reviews rating')
            .exec();
        
        if (!location) {
            return res.status(404).json({ "message": "Location not found" });
        }
        
        if (!location.reviews || location.reviews.length === 0) {
            return res.status(404).json({ "message": "No reviews found" });
        }

        // 3. 리뷰 서브 문서 찾기
        const thisReview = location.reviews.id(reviewid);

        if (!thisReview) {
            return res.status(404).json({ "message": "Review not found" });
        }

        // 4. 리뷰 필드 업데이트 (요청 본문의 데이터로 덮어쓰기)
        // rating을 숫자로 변환하여 저장
        thisReview.author = req.body.author;
        thisReview.rating = parseInt(req.body.rating, 10); 
        thisReview.reviewText = req.body.reviewText;

        // 5. 장소 문서 저장 및 평균 평점 업데이트
        await location.save();
        await updateAverageRating(locationid); // ⭐ 수정 후 평균 평점 업데이트

        // 6. 업데이트된 리뷰 객체 반환
        return res.status(200).json(thisReview);

    } catch (err) {
        console.error("Error updating review:", err);
        return res.status(400).json(err);
    }
};

// ===============================================
// 리뷰 삭제 (DELETE) 로직
// ===============================================
const reviewsDeleteOne = async (req, res) => {
    const { locationid, reviewid } = req.params;
    
    if (!locationid || !reviewid) {
        return res.status(404).json({ "message": "Not found, locationid and reviewid are both required" });
    }

    try {
        const location = await Loc.findById(locationid).select('reviews rating').exec();

        if (!location) {
            return res.status(404).json({ "message": "Location not found" });
        }

        if (!location.reviews || location.reviews.length === 0) {
            return res.status(404).json({ "message": "No reviews to delete" });
        }

        // 1. 리뷰 서브 문서 찾기
        const reviewToDelete = location.reviews.id(reviewid);

        if (!reviewToDelete) {
            return res.status(404).json({ "message": "Review not found" });
        }

        // 2. ⭐ Mongoose 6+ 버전의 deleteOne() 메서드를 사용하여 서브 문서 삭제
        reviewToDelete.deleteOne(); 

        await location.save();
        await updateAverageRating(locationid); // ⭐ 삭제 후 평균 평점 업데이트

        // 성공 시 204 No Content 반환 (삭제 성공 시 본문 없는 것이 일반적)
        return res.status(204).json(null); 
    } catch (err) {
        console.error("Error deleting review:", err);
        // 에러가 발생하면 400 Bad Request와 함께 에러 객체를 반환합니다.
        return res.status(400).json(err); 
    }
};


// ===============================================
// 나머지 함수들은 기존과 동일
// ===============================================

const reviewsList = async (req, res) => {
    try {
        const location = await Loc.findById(req.params.locationid)
            .select('name reviews') 
            .exec();

        if (!location) {
            return res.status(404).json({ "message": "location not found" });
        }

        if (!location.reviews || location.reviews.length === 0) {
            return res.status(200).json({ 
                location: {
                    name: location.name,
                    id: req.params.locationid
                },
                reviews: []
            });
        }

        const response = {
            location: {
                name: location.name,
                id: req.params.locationid
            },
            reviews: location.reviews 
        };

        return res.status(200).json(response);

    } catch (err) {
        console.error("Error in reviewsList:", err);
        return res.status(400).json({ "message": "Bad request or invalid ID format." });
    }
};


const reviewsReadOne = async (req, res) => {
    try {
        const location = await Loc.findById(req.params.locationid)
            .select('name reviews')
            .exec();

        if (!location) {
            return res.status(404).json({ "message": "location not found" });
        }
        
        const review = location.reviews.id(req.params.reviewid);
        
        if (!review) {
            return res.status(404).json({ "message": "review not found" });
        }
        
        const response = {
            location: {
                name: location.name,
                id: req.params.locationid
            },
            review 
        };

        return res.status(200).json(response);

    } catch (err) {
        console.error("Error in reviewsReadOne:", err);
        return res.status(400).json(err);
    }
};


const reviewsCreate = async (req, res) => {
    const locationId = req.params.locationid;
    if (!locationId) {
        return res.status(404).json({ "message": "Location not found" });
    }

    try {
        const location = await Loc.findById(locationId).select('reviews rating').exec();
        if (location) {
            await doAddReview(req, res, location);
        } else {
            return res.status(404).json({ "message": "Location not found" });
        }
    } catch (err) {
        return res.status(400).json(err);
    }
};


module.exports = {
    reviewsList, 
    reviewsCreate,
    reviewsReadOne,
    reviewsUpdateOne, 
    reviewsDeleteOne 
};
