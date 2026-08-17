import http from 'k6/http';
import { check, sleep } from 'k6';

// Smoke Test — minimal load, sanity check
// Purpose: Verify the API works at all before running bigger tests
export const options = {
    vus: 1,           // 1 virtual user
    duration: '10s',  // for 10 seconds
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
        http_req_failed: ['rate<0.01'],   // less than 1% failures
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
        'response has correct user id': (r) =>
            JSON.parse(r.body).data.id === 2,
        'response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1);
}