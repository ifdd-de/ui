import {ifddAuthProvider, ifddOidcClientId} from '../Env';

// Keycloak: the client roles of this client, which the realm puts into the
// ID token and the userinfo response (both end up in user.profile).
const rolesFromUser = (user) => {
    if (ifddAuthProvider === 'keycloak') {
        return user?.profile?.resource_access?.[ifddOidcClientId]?.roles || [];
    }
    if (ifddAuthProvider === 'azure') {
        return user?.profile?.roles || [];
    }
    return [];
};

export const createRaAuthProvider = () => auth => ({
    login: () => {
        if (!auth.isAuthenticated) {
            auth.signinRedirect();
        }
        return Promise.resolve();
    },

    logout: () => {
        auth.removeUser();
        auth.signoutRedirect();
        return Promise.resolve();
    },

    // 401: the sign-in is no longer valid, so sign out. 403: signed in, but
    // without the role for this request; keep the session and let react-admin
    // show the error instead of signing the user out.
    checkError: error => {
        const status = error?.status;
        return status === 401
            ? Promise.reject(auth.removeUser())
            : Promise.resolve();
    },

    checkAuth: () => (auth.isAuthenticated
        ? Promise.resolve()
        : Promise.reject({message: 'Not authenticated'})),

    // Roles only: OAuth scopes describe what this client may do on the user's
    // behalf and are the same for every user, so they are no permissions.
    getPermissions: () => {
        if (!auth.isAuthenticated) {
            return Promise.reject({message: 'Not authenticated'});
        }
        return Promise.resolve([...new Set(rolesFromUser(auth.user))]);
    },

    getIdentity: () => {
        if (!auth.isAuthenticated || !auth.user) {
            return Promise.reject({message: 'Not authenticated'});
        }
        return Promise.resolve({
            id: auth.user.profile.sub,
            fullName: auth.user.profile.name || auth.user.profile.preferred_username,
            avatar: auth.user.profile.picture,
        });
    },
});
