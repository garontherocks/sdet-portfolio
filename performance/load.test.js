import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    homepage_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 10 },
        { duration: '20s', target: 10 },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  const response = http.get('https://www.saucedemo.com/', {
    tags: { endpoint: 'homepage' },
  });
  check(response, {
    'homepage returns 200': (res) => res.status === 200,
  });
  sleep(1);
}
