import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import {Title, useTranslate} from 'react-admin';
import {ifddDashboardImage} from './Env';

const NotFound = () => {
    const translate = useTranslate();
    return (
        <Card>
            <Title title={translate('ra.page.not_found')}/>
            <CardContent>
                <h1>404: {translate('ra.page.not_found')}</h1>
                <img width="100%" src={ifddDashboardImage} alt=""/>
            </CardContent>
        </Card>
    );
};

export default NotFound;
