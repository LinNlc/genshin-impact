import { API_HOST } from '$lib/env';

const resolveApiUrl = (path) => {
	const trimmed = path.startsWith('/') ? path : `/${path}`;
	if (!API_HOST) return trimmed;
	return `${API_HOST}${trimmed}`;
};

const requestJson = async (path, { method = 'GET', token, body } = {}) => {
	const response = await fetch(resolveApiUrl(path), {
		method,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {})
		},
		body: body ? JSON.stringify(body) : undefined
	});

	const payload = await response.json().catch(() => ({}));
	if (!response.ok) {
		const message = payload?.message || 'Request failed';
		throw new Error(message);
	}
	return payload;
};

export const loginWithEmployeeId = async ({ userId, password }) => {
	return requestJson('/api/auth/login', {
		method: 'POST',
		body: { userId, password }
	});
};

export const fetchPools = async (token) => {
	return requestJson('/api/pools', { token });
};

export const drawPrize = async ({ token, poolId, count }) => {
	return requestJson('/api/draw', {
		method: 'POST',
		token,
		body: { poolId, count }
	});
};
