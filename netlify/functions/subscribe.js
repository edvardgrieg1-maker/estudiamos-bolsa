const https = require('https');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const ML_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiOTFjZTFkMmQwZGI3ZTk0YzZmYTFhNjAzMmNiN2U1ODcwNzBkODczMzYxZmRkNWYzMjkxYTAyYmZlMzFmNTBlOTM2NzZmNTU4Mjk4YzVlNGEiLCJpYXQiOjE3Nzg1NzQwNTguNzA5NDY5LCJuYmYiOjE3Nzg1NzQwNTguNzA5NDcyLCJleHAiOjQ5MzQyNDc2NTguNzA0MDEsInN1YiI6IjIzNTczNzYiLCJzY29wZXMiOltdfQ.QLnaEDTUor-D7N5tnIfvThdOqVMElq9YtderumetAIk3_wl8k4QeZMRyL0XTJlXuWOme8JigQxdcZbomostny8z0pOhMrtA0e2a2hCSBSCrOzNP1r-rdshnIiiemeIYNrRhBzyzi_J9J3G-SqqCyTxT664lPbrbTBxLGphvV_APZN-I7t6ltM1o-1QAOzrIkD4Vg76nl438MS2FsqYGVs3ji5c3onUA9KpJd0Eih_4mLpViHDQ_3tF5GHFl838PTczpcrxeOscujMO7UZKWjkT6KogYTfGl1VYunhldGMaiLdCzdlLOoiZqFpe__RCFqxeOr7AJrLeWWJYJCbuSaq5QMQMmPX2cqXXQGNBHjFnH-i9mmq9UfSAQ80-YmU75ZZpNnv_wFwBTWJ59GvvWYD4LgAEpMtjEzYkec3LAjoC55qBfi65EEGIPjkFer75A6f1xDcBTzHxrsbcjB8ZELzAByTPzEJY3RDPbFg2RwnMArE17hRvsYZwg1wgVZvVhhuwhQmlFzGyqOKCjhKtURRkPADC4qr4OlypaKAuA3KuT9WXoLiMp9gQ8DQukpQ8UxDRo_G5FxNRDfTfa8imeLZoxNx_jqHMXtt5Cxk8EEDdQtAtZfcb9ESJ6vYB1-qy8nYtgEkRFCg-bLsZAypetYJ0NO9gIzrp-WWLgNHKMM5QA';

  const GROUP_ID = '1871849983420437831';

  try {
    const { email, nombre, sugerencia } = JSON.parse(event.body);

    const payload = JSON.stringify({
      email,
      fields: { name: nombre, last_name: '', company: sugerencia || '' },
      groups: [1871849983420437831],
      status: 'active',
      resubscribe: true
    });

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'connect.mailerlite.com',
        path: '/api/subscribers',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + ML_API_KEY,
          'Content-Length': Buffer.byteLength(payload)
        }
      };
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    if (result.status !== 200 && result.status !== 201) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: result.body })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
