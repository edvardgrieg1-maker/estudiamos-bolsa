const https = require('https');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const ML_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiOTFjZTFkMmQwZGI3ZTk0YzZmYTFhNjAzMmNiN2U1ODcwNzBkODczMzYxZmRkNWYzMjkxYTAyYmZlMzFmNTBlOTM2NzZmNTU4Mjk4YzVlNGEiLCJpYXQiOjE3Nzg1NzQwNTguNzA5NDY5LCJuYmYiOjE3Nzg1NzQwNTguNzA5NDcyLCJleHAiOjQ5MzQyNDc2NTguNzA0MDEsInN1YiI6IjIzNTczNzYiLCJzY29wZXMiOltdfQ.QLnaEDTUor-D7N5tnIfvThdOqVMElq9YtderumetAIk3_wl8k4QeZMRyL0XTJlXuWOme8JigQxdcZbomostny8z0pOhMrtA0e2a2hCSBSCrOzNP1r-rdshnIiiemeIYNrRhBzyzi_J9J3G-SqqCyTxT664lPbrbTBxLGphvV_APZN-I7t6ltM1o-1QAOzrIkD4Vg76nl438MS2FsqYGVs3ji5c3onUA9KpJd0Eih_4mLpViHDQ_3tF5GHFl838PTczpcrxeOscujMO7UZKWjkT6KogYTfGl1VYunhldGMaiLdCzdlLOoiZqFpe__RCFqxeOr7AJrLeWWJYJCbuSaq5QMQMmPX2cqXXQGNBHjFnH-i9mmq9UfSAQ80-YmU75ZZpNnv_wFwBTWJ59GvvWYD4LgAEpMtjEzYkec3LAjoC55qBfi65EEGIPjkFer75A6f1xDcBTzHxrsbcjB8ZELzAByTPzEJY3RDPbFg2RwnMArE17hRvsYZwg1wgVZvVhhuwhQmlFzGyqOKCjhKtURRkPADC4qr4OlypaKAuA3KuT9WXoLiMp9gQ8DQukpQ8UxDRo_G5FxNRDfTfa8imeLZoxNx_jqHMXtt5Cxk8EEDdQtAtZfcb9ESJ6vYB1-qy8nYtgEkRFCg-bLsZAypetYJ0NO9gIzrp-WWLgNHKMM5QA';
  const RESEND_API_KEY = 're_JFVjETRb_8ufhv2JgnL1yD5nDTWzBSRf7';
  const GROUP_ID = '1871849983420437831';

  const makeRequest = (options, body) => new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });

  try {
    const { email, nombre, sugerencia } = JSON.parse(event.body);

    const subPayload = JSON.stringify({
      email,
      fields: { name: nombre, last_name: '', company: sugerencia || '' }
    });

    const subResult = await makeRequest({
      hostname: 'connect.mailerlite.com',
      path: '/api/subscribers',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + ML_API_KEY,
        'Content-Length': Buffer.byteLength(subPayload)
      }
    }, subPayload);

    if (subResult.status !== 200 && subResult.status !== 201) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: subResult.body }) };
    }

    const subscriber = JSON.parse(subResult.body);
    const subscriberId = subscriber.data.id;

    const groupPayload = JSON.stringify({});
    await makeRequest({
      hostname: 'connect.mailerlite.com',
      path: `/api/subscribers/${subscriberId}/groups/${GROUP_ID}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + ML_API_KEY,
        'Content-Length': Buffer.byteLength(groupPayload)
      }
    }, groupPayload);

    const emailHtml = `<div style="background:#0D0C0A;font-family:Georgia,serif;max-width:600px;margin:0 auto;border-radius:12px;overflow:hidden;border:1px solid rgba(242,239,232,0.1);">
  <div style="background:#1C1A17;padding:40px;text-align:center;border-bottom:1px solid rgba(242,239,232,0.08);">
    <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:24px;">
      <div style="width:8px;height:8px;border-radius:50%;background:#E85D2F;"></div>
      <span style="color:#F2EFE8;font-size:17px;">Estudiamos Bolsa</span>
    </div>
    <h1 style="color:#F2EFE8;font-size:24px;font-weight:normal;margin:0 0 6px;font-style:italic;">Bienvenido a Estudiamos Bolsa</h1>
    <p style="color:#A09D96;font-size:11px;margin:0;font-family:Arial,sans-serif;letter-spacing:0.08em;text-transform:uppercase;">Análisis fundamental · Inversión a largo plazo</p>
  </div>
  <div style="padding:30px 40px 24px;">
    <p style="color:#A09D96;font-size:14px;line-height:1.8;margin:0 0 24px;font-family:Arial,sans-serif;">Hola ${nombre} — me da mucho gusto tenerte aquí. Esto es lo que viene:</p>
    <div style="border-left:3px solid #E85D2F;padding-left:16px;margin-bottom:20px;">
      <p style="color:#F5A623;font-size:10px;font-family:Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 4px;">01 — Llamadas gratuitas</p>
      <p style="color:#F2EFE8;font-size:14px;margin:0 0 4px;">Exposiciones de tesis de inversión en vivo</p>
      <p style="color:#A09D96;font-size:12px;line-height:1.6;margin:0;font-family:Arial,sans-serif;">Recibirás tu invitación por correo antes de cada sesión.</p>
    </div>
    <div style="border-left:3px solid #E85D2F;padding-left:16px;margin-bottom:20px;">
      <p style="color:#F5A623;font-size:10px;font-family:Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 4px;">02 — Comunidad de estudio</p>
      <p style="color:#F2EFE8;font-size:14px;margin:0 0 4px;">Únete a nuestra comunidad en Skool</p>
      <p style="color:#A09D96;font-size:12px;line-height:1.6;margin:0 0 10px;font-family:Arial,sans-serif;">Grabaciones, material educativo y comunidad seria.</p>
      <a href="https://estudiamosbolsa.com" style="display:inline-block;background:#E85D2F;color:white;text-decoration:none;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;padding:8px 18px;border-radius:4px;">Entrar a la comunidad →</a>
    </div>
    <div style="border-left:3px solid #E85D2F;padding-left:16px;margin-bottom:24px;">
      <p style="color:#F5A623;font-size:10px;font-family:Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 4px;">03 — Documentos de tesis</p>
      <p style="color:#F2EFE8;font-size:14px;margin:0 0 4px;">Adquiere las tesis en formato descargable</p>
      <p style="color:#A09D96;font-size:12px;line-height:1.6;margin:0 0 10px;font-family:Arial,sans-serif;">Apoya el proyecto con el documento completo.</p>
      <a href="https://adrianeduardo1.gumroad.com/l/uuhqu" style="display:inline-block;background:transparent;color:#E85D2F;text-decoration:none;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;padding:8px 18px;border-radius:4px;border:1px solid rgba(232,93,47,0.5);">Ver tesis disponibles →</a>
    </div>
    <div style="background:#141310;border-radius:8px;padding:18px;border:1px solid rgba(242,239,232,0.08);">
      <p style="color:#A09D96;font-size:13px;line-height:1.7;margin:0;font-family:Arial,sans-serif;font-style:italic;">"Ex jugador profesional de póquer reconvertido en inversor. Pensar bien es la ventaja más grande — en el póquer y en los mercados. Gracias por estar aquí."</p>
      <p style="color:#F2EFE8;font-size:12px;margin:8px 0 0;font-family:Arial,sans-serif;">— Adrián Eduardo · <span style="color:#A09D96;">@adrianeduardo1</span></p>
    </div>
  </div>
  <div style="border-top:1px solid rgba(242,239,232,0.08);padding:16px 40px;text-align:center;">
    <p style="color:#5C5A55;font-size:11px;margin:0;font-family:Arial,sans-serif;">© 2025 Estudiamos Bolsa · registro.estudiamosbolsa.com</p>
  </div>
</div>`;

    const resendPayload = JSON.stringify({
      from: 'Estudiamos Bolsa <onboarding@resend.dev>',
      to: [email],
      subject: 'Bienvenido a Estudiamos Bolsa 🎯',
      html: emailHtml
    });

    await makeRequest({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Length': Buffer.byteLength(resendPayload)
      }
    }, resendPayload);

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }) };

  } catch (err) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: err.message }) };
  }
};
