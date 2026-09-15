import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  iterations: 3,
  thresholds: {
    checks: ['rate==1'],
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

export default function () {
  const response = http.get('https://www.saucedemo.com/', {
    tags: { endpoint: 'homepage' },
  });
  check(response, {
    'homepage returns 200': (res) => res.status === 200,
    'homepage response body is non-empty': (res) => res.body.length > 0,
  });
  sleep(1);
}
