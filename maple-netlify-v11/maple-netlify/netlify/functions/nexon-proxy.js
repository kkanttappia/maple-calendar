// netlify/functions/nexon-proxy.js
// 넥슨 Open API CORS 프록시 - 서버 환경변수 Key 사용

exports.handler = async (event) => {
  // 서버에 저장된 API Key 사용 (유저가 입력 불필요)
  const apiKey = process.env.NEXON_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: '서버 API Key가 설정되지 않았습니다. Netlify 환경변수를 확인해주세요.' } }),
    };
  }

  // /api/nexon/maplestory/v1/... → https://open.api.nexon.com/maplestory/v1/...
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
