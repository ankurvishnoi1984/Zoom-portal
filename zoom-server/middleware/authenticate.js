const querystring = require('querystring');
const axios = require('axios');

const generateZoomAccessToken = async(req, res, next) => {
      
    console.log("inside genrate token",req.body)
    let clientId;
    let clientSecret;
    let account_id;
    //L1HoE6RiSZG0jjezAtIGbg
    if(req.body.hostId=='L1HoE6RiSZG0jjezAtIGbg'){
      clientId = 'YvOqF3GxQiq2eNOb4UKbYA';
      clientSecret = '0U4sezR7180TOQDA1URIX6AamPhGJwrg';
      account_id = 'V5rYDXf3SqepkJ_4gj1P6g'
    }
    else if(req.body.hostId=='JisF5lPDS-KmvRZyjZJpsg'){
      clientId = 'QOl4K_fVQjmiMRFM7GZVmA';
      clientSecret = 'FgnJKucg3hKRe2qBRbp6AelGLu0PQYV4';
      account_id = 'JoDFYK7KTnqqFAoeTnVtog'
    }
    else if(req.body.hostId =="HsfQ5vNsSoSgNbDhjHkWCg"){

        clientId = 'F7SjQUPuQ_GQVSZt8APJZA';
        clientSecret = 'GS6647LvZ2qOY3vCia6gYepTks9f2ivo';
        account_id = 'ZylnKw9ARbiwIs8V8mLtrA'
    }
    else{
        clientId = 'QOl4K_fVQjmiMRFM7GZVmA';
        clientSecret = 'FgnJKucg3hKRe2qBRbp6AelGLu0PQYV4';
        account_id = 'JoDFYK7KTnqqFAoeTnVtog' 
    }
    //const clientId = 'QOl4K_fVQjmiMRFM7GZVmA'; // Replace with your Zoom app's Client ID
    //const clientSecret = 'FgnJKucg3hKRe2qBRbp6AelGLu0PQYV4'; // Replace with your Zoom app's Client Secret
    
    // Define the Zoom OAuth token endpoint
    const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${account_id}`;
    
    // Create a Base64-encoded string for HTTP Basic Authentication
    const authHeader = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
    
    // Define the data to be sent in the request body
    const requestData = querystring.stringify({
      // Include any additional parameters as needed
      // ...
    });
    
    // Define the headers for the POST request
    const headers = {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    
  
      try {
        // Send a POST request to the Zoom OAuth token endpoint
        const response = await axios.post(tokenUrl, requestData, { headers });
    
        // Extract the access token from the response
        //console.log(response.data)
        const accessToken = response.data.access_token;
        req.zoomAccessToken = accessToken;
        //console.log('Access Token:', accessToken);
    
        // Handle the access token and use it for API requests
        // ...
      } catch (error) {
        console.error('Error getting access token:', error);
      }

    next();
  };

  module.exports = generateZoomAccessToken;