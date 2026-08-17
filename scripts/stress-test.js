import http from 'k6/http';
import { check, sleep } from 'k6';

// Stress Test — pushes beyond normal capacity
// Purpose: Find the breaking point and observe degradation behavior
export const options = {
    stages: [
        { duration: '30s', target: 20 },   // normal load
        { duration: '30s', target: 50 },   // above normal
        { duration: '30s', target: 100 },  // stress zone
        { duration: '30s', target: 150 },  // breaking point territory
        { duration: '1m',  target: 0 },    // recovery — ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'],
        http_req_failed: ['rate<0.05'],
    },
};

const BASE_URL = 'https://reqres.in/api';
const API_KEY = 'free_user_3GJRz7IruA5c4eRCkkRTDO1DLrF';

export default function () {
    const params = {
        headers: {
            'x-api-key': API_KEY,
        },
    };

    const response = http.get(`${BASE_URL}/users/2`, params);

   check(response, {
           'status is 200': (r) => r.status === 200,
           'status is not 5xx': (r) => r.status < 500,
           'rate limited gracefully (429)': (r) =>
               r.status === 429 || r.status === 200,
       });

    sleep(0.5);
}