import {useEffect, useRef, useCallback} from 'react';
import {useAuth} from 'react-oidc-context';

const TokenRenewal = () => {
    const auth = useAuth();
    const timerRef = useRef(null);

    const setupRenewalTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (!auth.isAuthenticated || !auth.user) return;

        const tokenExpiresAt = auth.user.expires_at;
        if (!tokenExpiresAt) {
            console.warn("No token expiration time found");
            return;
        }

        const getRemainingTime = () =>
            Math.max(0, tokenExpiresAt - Math.floor(Date.now() / 1000));

        const getTimeUntilRenewal = () => {
            const totalValidity = auth.user.expires_in || 300;
            return Math.max(600, Math.floor(totalValidity * 0.7));
        };

        const remainingTime = getRemainingTime();
        const renewalTime = remainingTime - getTimeUntilRenewal();

        const handleRenewalError = async () => {
            if (getRemainingTime() < 60) {
                try {
                    await auth.signinRedirect();
                } catch (error) {
                    console.error("Redirect failed", error);
                }
            } else {
                setTimeout(setupRenewalTimer, 10000);
            }
        };

        if (remainingTime <= getTimeUntilRenewal()) {
            auth.signinSilent().catch(error => {
                console.error("Immediate token renewal failed", error);
                if (remainingTime < 30) {
                    auth.signinRedirect().catch(e => console.error("Redirect failed", e));
                }
            });
            return;
        }

        timerRef.current = setTimeout(async () => {
            try {
                await auth.signinSilent();
                setupRenewalTimer();
            } catch (error) {
                console.error("Token renewal failed", error);
                await handleRenewalError();
            }
        }, renewalTime * 1000);
    }, [auth]);

    useEffect(() => {
        setupRenewalTimer();
        const handleUserLoaded = () => {
            // console.log("User loaded, setting up renewal timer");
            setupRenewalTimer();
        };

        auth.events.addUserLoaded(handleUserLoaded);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            auth.events.removeUserLoaded(handleUserLoaded);
        };
    }, [auth, setupRenewalTimer]);

    return null;
};

export default TokenRenewal;
