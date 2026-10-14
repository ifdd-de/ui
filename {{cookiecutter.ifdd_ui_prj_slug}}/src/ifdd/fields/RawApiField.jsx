import {useRecordContext, useTranslate} from 'react-admin';
import LaunchIcon from '@mui/icons-material/Launch';

/** Link to the raw backend representation of the current record. */
export const RawApiField = ({source = 'id', label}) => {
    const record = useRecordContext();
    const translate = useTranslate();
    const url = record?.[source];
    if (!url) return null;

    return (
        <span>
            <a href={url} target="_blank" rel="noreferrer" aria-label={translate('ifdd.ui.rawApiData')}>
                <LaunchIcon/>
            </a>
            <span className="MuiTypography-root MuiTypography-body1 RaLabeled-label"> {url} </span>
        </span>
    );
};
