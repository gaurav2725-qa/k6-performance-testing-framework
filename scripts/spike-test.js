import http from 'k6/http';
import { check, sleep } from 'k6';

// Spike Test — sudden burst of traffic
// Purpose: Verify recovery after an unexpected traffic surge
export const options = {
    stages: [
        { duration: '10s', target: 10 },   // normal baseline
        { duration: '10s', target: 100 },  // sudden spike
        { duration: '30s', target: 100 },  // hold spike
        { duration: '10s', target: 10 },   // sudden drop
        { duration: '20s', target: 10 },   // verify recovery
    ],
    thresholds: {
        http_req_failed: ['rate<0.10'],
    },
};

const BASE_URL = 'https://reqres.in/api';
const API_KEY = 'free_user_3GJRz7IruA5c4eRCkkRTDO1DLrF';

export default function () {
    const params = {
        headers: { 'x-api-key': API_KEY },
    };

    const response = http.get(`${BASE_URL}/users/2`, params);

    check(response, {
        'status is 200 or 429': (r) =>
            r.status === 200 || r.status === 429,
    });

    sleep(0.5);
}