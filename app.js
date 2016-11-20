/* globals google, fetchJsonp */
function getLocation () {
  return new Promise((resolve, reject) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        let lat = position.coords.latitude
        let long = position.coords.longitude
        resolve([lat, long])
      })
    } else {
      reject('Unable to get location')
    }
  })
}

function getWeather (lat, long) {
  return new Promise((resolve, reject) => {
    let baseUrl = 'https://api.wunderground.com/api'
    let apiKey = '06b04f2180c628f8'
    window.fetch(`${baseUrl}/${apiKey}/conditions/q/${lat},${long}.json`)
      .then((data) => data.json())
      .then((data) => {
        resolve(data)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

function getPlaceImage (lat, long) {
  return new Promise((resolve, reject) => {
    let loc = new google.maps.LatLng(lat, long)
    let map = new google.maps.Map(document.createElement('div'), {
      center: loc,
      zoom: 15
    })
    let request = {
      location: loc,
      radius: '2500'
    }
    let service = new google.maps.places.PlacesService(map)
    service.nearbySearch(request, (results, status) => {
      try {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          let photoUrl = results[0].photos[0].getUrl({'maxWidth': 2000, 'maxHeight': 2000})
          resolve(photoUrl)
        } else {
          resolve('https://source.unsplash.com/random')
        }
      } catch (e) {
        console.error(e)
        resolve('https://source.unsplash.com/random')
      }
    })
  })
}

getLocation()
  .then((data) => {
    return Promise.all([getWeather(data[0], data[1]), getPlaceImage(data[0], data[1])])
      .then((data) => {
        let conditions = data[0].current_observation
        let image = data[1]
        fetchJsonp('https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=1&prop=extracts&exintro&explaintext&exsentences=5&exlimit=max&redirects=1&gsrsearch=' + conditions.display_location.full)
          .then((locationInfo) => locationInfo.json())
          .then((locationInfo) => {
            let resp = ''
            for (let page in locationInfo.query.pages) {
              resp = locationInfo.query.pages[page].extract
            }
            return resp
          })
          .then((locationInfo) => {
            updateView(
              conditions.weather,
              conditions.display_location.city,
              conditions.display_location.state_name,
              conditions.temp_c,
              locationInfo + '\n\nPowered by Weather Underground, Wikipedia, Google, and Tachyons. Loading cubes by Tobias Ahlin.',
              image
            )
          })
          .catch((err) => {
            handleError(err)
          })
      })
      .catch((err) => {
        handleError(err)
      })
  })
  .catch((err) => {
    handleError(err)
  })

function updateView (weather, city, country, temperature, extract, image) {
  document.getElementById('background').style.backgroundImage = 'url(\'' + image + '\')'
  document.getElementById('city').innerText = weather + ' in ' + city + ' (' + temperature + '°C)'
  document.getElementById('country-or-state').innerText = country
  document.getElementById('location-info').innerText = extract
  document.getElementById('loading').style.display = 'none'
}

function handleError (err) {
  document.getElementById('error-message').innerText = 'Technical details: ' + err
  document.getElementById('loading').style.display = 'none'
  document.getElementById('error').style.display = 'block'
}
