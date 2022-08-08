
const fetch = require('node-fetch');
const ObjectsToCsv = require('objects-to-csv')

async function f() {

async function paginated_fetch(
    url = is_required("url"), // Improvised required argument in JS
    page = 1,
    previousResponse = []
    // response
  ) {
    return fetch(`${url}&page=${page}`) // Append the page number to the base URL
      .then((response) => {
        if (!response.ok) {
          // create error object and reject if not a 2xx response code
          let err = new Error("HTTP status code: " + response.status);
          err.response = response;
          err.status = response.status;
          throw err;
        } else {
          // console.log(response.ok);
          return response.json();
        }
      })
      .then((newResponse) => {

        const response = [...previousResponse, ...newResponse]; // Combine the two arrays
        if (newResponse.length === 100) {
          page++;
  
          return paginated_fetch(url, page, response);
        }
 
        return response;
  
      });
  }
  const rawdataF = await paginated_fetch(
    `https://hakaimagazine.com/wp-json/wp/v2/features?_fields=title,acf.deck,acf.geolocation,date,acf.authors_group,link,acf.word_count_override&per_page=100`
  )
  // console.log(rawdataF)
  const rawdataNews =  await paginated_fetch(
    `https://hakaimagazine.com/wp-json/wp/v2/news?_fields=title,acf.deck,acf.geolocation,date,acf.authors_group,link,acf.word_count_override&per_page=100`
  )
  const rawdataVV = await paginated_fetch(
    `https://hakaimagazine.com/wp-json/wp/v2/videos-visuals?_fields=title,acf.deck,acf.geolocation,date,acf.authors_group,link,acf.word_count_override&per_page=100`
  )
  const rawdataAS = await paginated_fetch(
    `https://hakaimagazine.com/wp-json/wp/v2/article-short?_fields=title,acf.deck,acf.geolocation,date,acf.authors_group,link,acf.word_count_override&per_page=100`
  )

  const rawdata = [...rawdataF, ...rawdataNews, ...rawdataVV, ...rawdataAS]
  const out = [];
  const data =  rawdata.map((d) => {
    const country = d.acf.geolocation ? d.acf.geolocation.country : "";
    const state = d.acf.geolocation ? d.acf.geolocation.state : "";
    const wc = d.acf.word_count_override ? d.acf.word_count_override : "";
    return {
      deck: d.acf.deck,
      name: d.title.rendered,
      lat: d.acf.geolocation != null ? d.acf.geolocation.lat : null ,
      lng: d.acf.geolocation != null ? d.acf.geolocation.lng : null ,
      country: country,
      state: state,
      wordCount: wc,
      date: d.date,
      link: d.link
    };
  });

  const csv = new ObjectsToCsv(data)
  await csv.toDisk('./list.csv')

}

f();


  