import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import {useEffect, useState} from 'react';
import {useTranslate} from 'react-admin';
import {useAuth} from 'react-oidc-context';

import {ifddDashboardImage, ifddTitle, ifddUrlRest, ifddVersion} from './Env';
import {aspects} from './ifdd/registry';
import {READ_ROLES, hasRole} from './permissions';

const styles = {
    media: {paddingTop: '5%', margin: 0, top: 0, width: '100%', height: '100%'},
    text: {padding: '0 16px 16px 16px'},
    version: {opacity: 0.3, padding: '0 16px'},
};

const useBackendVersion = () => {
    const auth = useAuth();
    const [version, setVersion] = useState('loading...');

    useEffect(() => {
        let cancelled = false;
        const headers = new Headers({Accept: 'application/json'});
        if (auth.isAuthenticated && auth.user?.access_token) {
            headers.set('Authorization', `Bearer ${auth.user.access_token}`);
        }
        fetch(`${ifddUrlRest}/prot_version`, {method: 'GET', headers})
            .then(response => response.json())
            .then(data => {
                if (!cancelled) setVersion(data.version);
            })
            .catch(() => {
                if (!cancelled) setVersion('no backend version');
            });
        return () => {
            cancelled = true;
        };
    }, [auth.isAuthenticated, auth.user?.access_token]);

    return version;
};

/**
 * Entry page.
 *
 * The aspect links are generated from the registry; the previous version
 * repeated the same block once per aspect.
 */
export const Dashboard = ({permissions = [], permissionsLoaded = false}) => {
    const translate = useTranslate();
    const backendVersion = useBackendVersion();
    const canRead = permissionsLoaded && hasRole(permissions, READ_ROLES);

    return (
        <Card>
            <CardMedia image={ifddDashboardImage} title="" style={styles.media}>
                <CardHeader title={ifddTitle}/>
                <List component="nav" aria-label={translate('navigation.label')}>
                    {canRead && aspects.map(({resource, icon: Icon}) => (
                        <ListItemButton key={resource} component="a" href={resource}>
                            <ListItemIcon>
                                <Icon/>
                                <Typography variant="body1" style={styles.text}>
                                    {translate(`resources.${resource}.name`)}
                                </Typography>
                            </ListItemIcon>
                            <ListItemText>
                                <Typography variant="body1" style={styles.text}>
                                    {translate(`resources.${resource}.description`)}
                                </Typography>
                            </ListItemText>
                        </ListItemButton>
                    ))}
                </List>
                <CardContent>
                    <Typography variant="caption" style={styles.version}>
                        Frontend {ifddVersion} | Backend {backendVersion}
                    </Typography>
                </CardContent>
            </CardMedia>
        </Card>
    );
};

export default Dashboard;
