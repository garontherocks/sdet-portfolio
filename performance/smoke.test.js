import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10, // virtual users
  duration: '10s',
  thresholds: {
    http_req_failed: ['rate==0'], // no request should fail
    http_req_duration: ['p(95)<800'], // 95% under 800ms
  },
};

export default function () {
  const res = http.get('https://www.saucedemo.com/');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
