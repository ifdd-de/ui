import {Log, WebStorageStateStore} from 'oidc-client-ts';
import {ifddAuthProvider, ifddOidcClientId, ifddOidcRealm} from '../Env';

const getAuthConfig = () => {
    Log.setLogger(console);
    Log.setLevel(Log.WARN);

    const redirectRoot = window.location.origin;

    const baseConfig = {
        silent_redirect_uri: `${redirectRoot}/authentication/silent-callback`,
        authority: '',
        client_id: '',
        redirect_uri: `${redirectRoot}/authentication/callback`,
        post_logout_redirect_uri: redirectRoot,
        response_type: 'code',
        scope: 'openid profile email',
        automaticSilentRenew: true,
        silentRequestTimeout: 10000,
        accessTokenExpiringNotificationTime: 600,
        monitorSession: false,
        silentRequestUsingForm: true,
        loadUserInfo: true,
        filterProtocolClaims: true,
        revokeAccessTokenOnSignout: true,
        userStore: new WebStorageStateStore({store: window.localStorage}),
        onAccessTokenExpired: () => window.location.reload(),
        onSilentRenewError: error => console.error('Silent token renewal error', error),
    };

    const providerConfigs = {
        keycloak: {
            authority: ifddOidcRealm,
            client_id: ifddOidcClientId,
            metadata: {
                issuer: ifddOidcRealm,
                authorization_endpoint: `${ifddOidcRealm}/protocol/openid-connect/auth`,
                token_endpoint: `${ifddOidcRealm}/protocol/openid-connect/token`,
                userinfo_endpoint: `${ifddOidcRealm}/protocol/openid-connect/userinfo`,
                end_session_endpoint: `${ifddOidcRealm}/protocol/openid-connect/logout`,
                jwks_uri: `${ifddOidcRealm}/protocol/openid-connect/certs`,
            },
            usePkce: true,
        },
    };

    return {...baseConfig, ...providerConfigs[ifddAuthProvider]};
};

export default getAuthConfig;
