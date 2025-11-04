var request = require('request');

// [★★★★★ ★★★★★ 수정된 부분 ★★★★★ ★★★★★]
const apiOptions = {
  server: 'http://localhost:3000' // 개발 환경(로컬) 기본값
};

if (process.env.NODE_ENV === 'production') {
  // 프로덕션(배포) 환경일 경우, 라이브 API 서버 주소로 변경
  apiOptions.server = 'https://loc8r-api-x3n7.onrender.com'; 
}
// [★★★★★ 수정 끝 ★★★★★]

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
  const path = `/api/locations/${req.params.locationid}`;
  const requestOptions = {
    url: `${apiOptions.server}${path}`, // [수정됨] apiOptions.server 값을 동적으로 사용
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
    url: `${apiOptions.server}${path}`, // [수정됨] apiOptions.server 값을 동적으로 사용
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
          t }
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

  if (!postdata.author || !postdata.rating || !postdata.reviewText) {
    res.redirect(`/location/${locationid}/review/new?err=val`);
  } else {
    const requestOptions = {
      url: `${apiOptions.server}${path}`, // [수정됨] apiOptions.server 값을 동적으로 사용
      method: 'POST',
      json: postdata
    };

    request(
      requestOptions,
      (err, {statusCode}, body) => {
        if (statusCode === 201) {
          res.redirect(`/location/${locationid}`);
        } else if (statusCode === 400 && body.name && body.name === 'ValidationError') {
          res.redirect(`/location/${locationid}/review/new?err=val`);
  S     } else {
          showError(req, res, statusCode);
        }
      }
    );
  } 
};

// [★★★★★ 수정된 module.exports ★★★★★]
module.exports = {
  homelist,
  locationInfo,
  addReview,
  doAddReview
};