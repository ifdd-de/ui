import {fetchUtils} from 'react-admin';
import {createIfddDataProvider} from '../ifdd_backend_provider';

export const createDataProvider = apiUrl => auth => {
    const httpClient = (url, options = {}) => {
        const headers = new Headers({
            Accept: 'application/json',
            ...options.headers,
        });

        if (options.body) {
            headers.set('Content-Type', 'application/json');
        }

        if (auth.isAuthenticated && auth.user?.access_token) {
            headers.set('Authorization', `Bearer ${auth.user.access_token}`);
        }

        return fetchUtils.fetchJson(url, {...options, headers});
    };

    return createIfddDataProvider(apiUrl, httpClient);
};
