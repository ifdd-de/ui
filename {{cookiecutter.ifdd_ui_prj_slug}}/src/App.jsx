import {useEffect, useMemo, useState} from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {Admin, Login, Resource} from 'react-admin';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import {useAuth} from 'react-oidc-context';

import './App.css';
import {ifddBackgroundImage, ifddTitle, ifddUrlRest} from './Env';
import {ifddTheme} from './ifdd_theme';
import {Dashboard} from './Dashboard';
import NotFound from './NotFound';
import german from './i18n/de';
import {mergeWithPrivate} from './i18n/private';
import english from './i18n/en';
import {READ_ROLES, hasRole} from './permissions';
import {aspects} from './ifdd/registry';

import AuthProvider from './auth/AuthProvider';
import TokenRenewal from './auth/TokenRenewal';
import {createRaAuthProvider} from './auth/raAuthProvider';
import {createDataProvider} from './auth/dataProvider';

const getBrowserLocale = () => (navigator.language || 'en').startsWith('de') ? 'de' : 'en';

// Messages from the mounted private tree are merged on top of the built-in
// ones, so internal field labels stay out of this repository.
const loadMessages = locale => mergeWithPrivate(locale === 'de' ? german : english, locale);

const i18nProvider = polyglotI18nProvider(loadMessages, getBrowserLocale(), [
    {locale: 'en', name: 'English'},
    {locale: 'de', name: 'Deutsch'},
]);

const LoginPage = () => <Login backgroundImage={ifddBackgroundImage}/>;

const usePermissions = (authProvider) => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authProvider) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        authProvider.getPermissions()
            .then(perms => {
                if (!cancelled) {
                    setPermissions(perms);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [authProvider]);

    return {permissions, loading};
};

const AdminApp = () => {
    const auth = useAuth();
    const authProvider = useMemo(() => createRaAuthProvider()(auth), [auth]);
    const dataProvider = useMemo(() => createDataProvider(ifddUrlRest)(auth), [auth]);
    const {permissions, loading} = usePermissions(authProvider);
    const canRead = hasRole(permissions, READ_ROLES);

    return (
        <>
            <TokenRenewal/>
            <Admin
                i18nProvider={i18nProvider}
                disableTelemetry
                catchAll={NotFound}
                title={ifddTitle}
                theme={ifddTheme}
                authProvider={authProvider}
                loginPage={LoginPage}
                dashboard={() => <Dashboard permissions={permissions} permissionsLoaded={!loading}/>}
                dataProvider={dataProvider}
            >
                {!loading && canRead && aspects.map(({resource, list, show, icon}) => (
                    <Resource
                        key={resource}
                        name={resource}
                        list={list}
                        show={show}
                        icon={icon}
                        options={{label: `resources.${resource}.name`}}
                    />
                ))}
                <Resource name="types" options={{label: 'resources.types.name'}}/>
                <Resource name="scopes" options={{label: 'resources.scopes.name'}}/>
                <Resource name="aspects" options={{label: 'resources.aspects.name'}}/>
                <Resource name="tags" options={{label: 'resources.tags.name'}}/>
            </Admin>
        </>
    );
};

const App = () => (
    <BrowserRouter>
        <AuthProvider>
            <Routes>
                <Route path="/*" element={<AdminApp/>}/>
            </Routes>
        </AuthProvider>
    </BrowserRouter>
);

export default App;
