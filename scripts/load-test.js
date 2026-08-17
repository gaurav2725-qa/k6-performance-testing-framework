import http from 'k6/http';
import { check, sleep } from 'k6';

// Load Test — simulates normal expected traffic
// Purpose: Verify the API handles realistic concurrent usage
export const options = {
    stages: [
        { duration: '30s', target: 20 },  // ramp up to 20 users
        { duration: '1m',  target: 20 },  // stay at 20 users
        { duration: '30s', target: 0 },   // ramp down to 0
    ],
    thresholds: {
        http_req_duration: ['p(95)<800'],
        http_req_failed: ['rate<0.02'],
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

    // Simulate a realistic user flow: list users, then view one
    const listResponse = http.get(`${BASE_URL}/users?page=1`, params);
    check(listResponse, {
        'list status is 200': (r) => r.status === 200,
        'list has users': (r) =>
            JSON.parse(r.body).data.length > 0,
    });

    sleep(1);

    const detailResponse = http.get(`${BASE_URL}/users/2`, params);
    check(detailResponse, {
        'detail status is 200': (r) => r.status === 200,
        'detail response < 800ms': (r) => r.timings.duration < 800,
    });

    sleep(2);
}