import {useState} from 'react';
import {ArrayField, Button, Datagrid, TextField, useRecordContext, useTranslate} from 'react-admin';
import {KeyboardArrowDown, KeyboardArrowUp} from '@mui/icons-material';
import {validityColor} from '../../tools_validity_color';

const propertyRowSx = (record) => ({backgroundColor: validityColor(record._prop_validity)});

/** Collapsible table of the free-form properties of a record. */
export const PropertiesField = ({source, label}) => {
    const record = useRecordContext();
    const translate = useTranslate();
    const [isVisible, setIsVisible] = useState(false);

    if (!record?.[source] || record[source].length === 0) return null;

    const prefix = source.split(':')[0];

    return (
        <div>
            <Button
                label={isVisible ? translate('ifdd.ui.hideAllProperties') : translate('ifdd.ui.showAllProperties')}
                onClick={() => setIsVisible(!isVisible)}
                startIcon={isVisible ? <KeyboardArrowUp/> : <KeyboardArrowDown/>}
            />
            {isVisible && (
                <ArrayField label={label} source={source}>
                    <Datagrid rowSx={propertyRowSx} bulkActionButtons={false}>
                        <TextField source={`${prefix}:prop_id`}/>
                        <TextField source={`${prefix}:prop_val`}/>
                    </Datagrid>
                </ArrayField>
            )}
        </div>
    );
};
