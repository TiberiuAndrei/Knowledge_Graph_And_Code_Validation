import fetch from 'node-fetch';

const filePath = process.env.FILE_PATH;
const token = process.env.BITBUCKET_TOKEN

fetch(filePath, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
})
  .then(response => {
    if (response.status == 200) {
      console.log(`Specified file path exists in the repo`);
    }
    else {
      console.log(`File path is missing from the repo`);
    }
    return response.text();
  })
  .then(text => console.log(text))
  .catch(err => console.error(err));