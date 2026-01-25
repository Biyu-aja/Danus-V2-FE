import API_BASE_URL from '../config/api.config';

export interface RequestSetorItem {
    detailSetorId: number;
    qty: number;
}

export interface CreateRequestParams {
    userId: number;
    adminId: number;
    items: RequestSetorItem[];
}

const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
        throw { response: { data } }; // Mimic axios error structure slightly or just throw data
    }
    return data;
};

export const requestSetorService = {
    createRequest: async (data: CreateRequestParams) => {
        const response = await fetch(`${API_BASE_URL}/requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    getMyRequests: async (userId: number) => {
        const response = await fetch(`${API_BASE_URL}/requests/my?userId=${userId}`);
        return handleResponse(response);
    },

    getAdminRequests: async (adminId: number) => {
        const response = await fetch(`${API_BASE_URL}/requests/admin?adminId=${adminId}`);
        return handleResponse(response);
    },

    approveRequest: async (requestId: number) => {
        const response = await fetch(`${API_BASE_URL}/requests/${requestId}/approve`, {
            method: 'PATCH'
        });
        return handleResponse(response);
    },

    rejectRequest: async (requestId: number) => {
        const response = await fetch(`${API_BASE_URL}/requests/${requestId}/reject`, {
            method: 'PATCH'
        });
        return handleResponse(response);
    }
};
