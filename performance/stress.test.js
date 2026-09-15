import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    homepage_stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '30s', target: 40 },
        { duration: '30s', target: 60 },
        { duration: '20s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.03'],
    http_req_duration: ['p(95)<1500'],
  },
};

export default function () {
  const response = http.get('https://www.saucedemo.com/', {
    tags: { endpoint: 'homepage' },
  });
  check(response, {
    'homepage remains available': (res) => res.status === 200,
  });
  sleep(1);
}
