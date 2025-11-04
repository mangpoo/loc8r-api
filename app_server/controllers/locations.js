var request = require('request');

const apiOptions = {
  server: 'http://localhost:3000'
};

if (process.env.NODE_ENV === 'production') {
  apiOptions.server = 'http://localhost:3000'; // (나중에 실제 서버 주소로 변경)
}

// [★★★★★ ★★★★★ 수정된 함수 ★★★★★ ★★★★★]
/* Details 페이지 렌더링 헬퍼 함수 */
// .env에서 Google API 키를 읽어 뷰로 전달합니다.
const renderDetailPage = (req, res, location) => {
  res.render('location-info', {
    title: location.name,
    pageHeader: {
      title: location.name
    },
    sidebar: {
      context: 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
      callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
    },
    location: location,
    googleApiKey: process.env.GOOGLE_API_KEY // [추가] Google API 키 전달
  });
};

// [★★★★★ 기존 헬퍼 함수 ★★★★★]
/* 리뷰 폼 렌더링 헬퍼 함수 */
const renderReviewForm = (req, res, {name}) => {
  res.render('location-review-form', {
    title: `Review ${name} on Loc8r`,
    pageHeader: { title: `Review ${name}` },
    error: req.query.err
  });
};

// [★★★★★ 기존 헬퍼 함수 ★★★★★]
/* API에서 locationid로 상세 정보 가져오기 */
const getLocationInfo = (req, res, callback) => {
// ... (기존 코드와 동일)
  const path = `/api/locations/${req.params.locationid}`;
  const requestOptions = {
    url: `${apiOptions.server}${path}`,
    method: 'GET',
    json: {}
  };

  request(
    requestOptions,
    (err, {statusCode}, body) => {
      if (statusCode === 200) {
        const data = body;
        data.coords = {
          lng: body.coords[0],
          lat: body.coords[1]
        };
        callback(req, res, data);
      } else {
        showError(req, res, statusCode);
      }
    }
  );
};


// [★★★★★ 기존 헬퍼 함수 ★★★★★]
/* 에러 페이지 렌더링 함수 */
const showError = (req, res, status) => {
// ... (기존 코드와 동일)
  let title = '';
  let content = '';
  if (status === 404) {
    title = '404, page not found';
    content = 'Oh dear. Looks like you can\'t find this page. Sorry.';
  } else {
    title = `${status}, something's gone wrong`;
    content = 'Something, somewhere, has just a little bit wrong.';
  }
  res.status(status);
  res.render('generic-text', {
    title,
    content
  });
};

// ... (formatDistanceToKm, renderHomepage, homelist, locationInfo, addReview 함수는 기존과 동일)
// [헬퍼 함수] (변경 없음)
const formatDistanceToKm = (distanceInMeters) => {
  if (typeof distanceInMeters !== 'number') { return '?'; }
  const distanceInKm = distanceInMeters / 1000;
  return `${distanceInKm.toFixed(1)}km`;
};
// [기존 함수] (변경 없음)
const renderHomepage = (req, res, responseBody) => {
  let message = null;
  if (!(responseBody instanceof Array)) {
    message = "API lookup error";
    responseBody = [];
  } else {
    if (!responseBody.length) { message = "No places found nearby"; }
  }
  res.render('locations-list', {
    title: 'Loc8r - find a place to work with wifi',
    pageHeader: {
      title: 'Loc8r',
      strapline: 'Find places to work with wifi near you!'
    },
    sidebar: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for.",
    locations: responseBody,
    message: message
  });
};
// [기존 함수] (변경 없음)
const homelist = (req, res) => {
  const path = '/api/locations';
  const maxDistanceKm = 15.5;
  const maxDistanceMeters = maxDistanceKm * 1000;
  const requestOptions = {
    url: `${apiOptions.server}${path}`,
    method: 'GET',
    json: true,
    qs: {
      lng: 126.964062,
      lat: 37.468769,
      maxDistance: maxDistanceMeters
    }
  };
  request(
    requestOptions,
    (err, response, body) => {
      let locations = body;
      if (response.statusCode === 200 && locations && locations.length) {
        locations = locations.map(location => {
          if (location.hasOwnProperty('distance')) {
            const distanceAsNumber = parseFloat(location.distance);
            if (!isNaN(distanceAsNumber)) {
              location.distance = formatDistanceToKm(distanceAsNumber);
            } else {
              location.distance = '?';
            }
          }
          return location;
        });
      }
      renderHomepage(req, res, locations);
    }
  );
};
// [기존 함수] (변경 없음)
const locationInfo = (req, res) => {
  getLocationInfo(req, res,
    (req, res, responseData) => renderDetailPage(req, res, responseData)
  );
};
// [기존 함수] (변경 없음)
const addReview = (req, res) => {
  getLocationInfo(req, res,
    (req, res, responseData) => renderReviewForm(req, res, responseData)
  );
};


// [★★★★★ ★★★★★ 수정된 컨트롤러 ★★★★★ ★★★★★]
/* POST 'Add review' */
const doAddReview = (req, res) => {
  const locationid = req.params.locationid;
  const path = `/api/locations/${locationid}/reviews`;

  const postdata = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review
  };

  // [추가] 애플리케이션 레벨 유효성 검사
  // 폼 데이터가 비어있는지 확인
  if (!postdata.author || !postdata.rating || !postdata.reviewText) {
    // 비어있다면 API 호출 없이 폼으로 리다이렉트
    res.redirect(`/location/${locationid}/review/new?err=val`);
  } else {
    // [수정] 유효성 검사를 통과한 경우에만 API 호출
    const requestOptions = {
      url: `${apiOptions.server}${path}`,
      method: 'POST',
      json: postdata
    };

    request(
      requestOptions,
      (err, {statusCode}, body) => {
        if (statusCode === 201) {
          res.redirect(`/location/${locationid}`);
        // [수정] body.name 대신 body.name을 확인합니다. (이미지 참고)
        } else if (statusCode === 400 && body.name && body.name === 'ValidationError') {
          // API(Mongoose) 레벨 유효성 검사 실패 시
          res.redirect(`/location/${locationid}/review/new?err=val`);
        } else {
          showError(req, res, statusCode);
        }
      }
    );
  } // else 블록 종료
};

// [★★★★★ 수정된 module.exports ★★★★★]
module.exports = {
  homelist,
  locationInfo,
  addReview,
  doAddReview
};