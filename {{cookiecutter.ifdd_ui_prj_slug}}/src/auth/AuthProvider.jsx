import {useEffect, useState} from 'react';
import {AuthProvider as OidcAuthProvider, useAuth} from 'react-oidc-context';
import getAuthConfig from './authConfig';

const LoadingScreen = ({message, subMessage}) => (
    <div style={{textAlign: 'center', padding: '50px'}}>
        <h2>{message}</h2>
        <p>{subMessage}</p>
    </div>
);

const ErrorScreen = ({error}) => (
    <div style={{textAlign: 'center', padding: '50px', color: 'red'}}>
        <h2>Authentifizierungsfehler</h2>
        <p>{error?.message || 'Unbekannter Fehler bei der Anmeldung'}</p>
        <button onClick={() => window.location.href = '/'}>Erneut versuchen</button>
    </div>
);


const AuthCallback = () => {
    const auth = useAuth();
    useEffect(() => {
        // Nur weiterleiten, wenn Authentifizierung bestätigt ist
        if (auth.isAuthenticated) {
            window.location.href = '/';
        }
    }, [auth.isAuthenticated]);

    return <LoadingScreen
        message="Authentication successful"
        subMessage="You are being redirected..."
    />;};

const AuthContent = ({children}) => {
    const auth = useAuth();
    const [redirectAttempted, setRedirectAttempted] = useState(false);
    const isCallbackPath = window.location.pathname === '/authentication/callback';

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated && !isCallbackPath && !auth.activeNavigator && !auth.error && !redirectAttempted) {
            setRedirectAttempted(true);
            auth.signinRedirect().catch(error => {
                console.error("Error during automatic login:", error);
            });
        }
    }, [auth.isLoading, auth.isAuthenticated, auth, isCallbackPath, auth.activeNavigator]);
    if (auth.isLoading) {
        return <LoadingScreen
            message="Initializing authentication..."
            subMessage="Please wait while the connection is being established."
        />;    }

    if (auth.error) {
        return <ErrorScreen error={auth.error}/>;
    }

    if (isCallbackPath) {
        return <AuthCallback/>;
    }

    if (auth.isAuthenticated) {
        return <>{children}</>;
    }

    return <LoadingScreen
        message="Redirecting to login..."
        subMessage="You are being automatically redirected to the login server."
    />;};

const AuthProvider = ({children}) => {
    const oidcConfig = getAuthConfig();

    return (
        <OidcAuthProvider {...oidcConfig}>
            <AuthContent>
                {children}
            </AuthContent>
        </OidcAuthProvider>
    );
};

export default AuthProvider;
