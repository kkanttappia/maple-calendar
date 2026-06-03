// netlify/functions/nexon-proxy.js
// 넥슨 Open API CORS 프록시 - 브라우저 대신 서버에서 호출

exports.handler = async (event) => {
  const apiKey = event.headers['x-nxopen-api-key'];

  if (!apiKey) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: { message: 'API Key가 없습니다.' } }),
    };
  }

  // 요청 경로에서 넥슨 API 경로 추출
  // /api/nexon/maplestory/v1/id → /maplestory/v1/id
  const nexonPath = event.path.replace('/.netlify/functions/nexon-proxy', '').replace('/api/nexon', '');
  const query = event.rawQuery ? `?${event.rawQuery}` : '';
  const nexonUrl = `https://open.api.nexon.com${nexonPath}${query}`;

  try {
    const response = await fetch(nexonUrl, {
      headers: {
        'x-nxopen-api-key': apiKey,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: '넥슨 API 호출 중 오류: ' + err.message } }),
    };
  }
};
