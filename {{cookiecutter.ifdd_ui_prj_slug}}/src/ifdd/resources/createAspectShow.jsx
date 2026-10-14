import {useEffect} from 'react';
import {Navigate, Show, TabbedShowLayout, useNotify, useParams, useRecordContext} from 'react-admin';
import {NodeTitle} from '../../ifdd_tools';
import {baseTab} from '../tab/base';
import {contextTabs} from '../tab/contextTab';
import {cytoTab} from '../tab/cyto';
import {privateContextsFor, privateTabsFor} from '../privateTabs';
import {firstTab, showPath} from '../tabs';
import {ifddShowExplorer} from '../../Env';

/**
 * Opens the first tab instead of an empty view.
 *
 * Without a tab in the URL (`/show`) this is the normal way in and happens
 * silently. A tab the record does not have, or a domain context the user may
 * not read (ifdd-be-core leaves it out, so the UI cannot tell the two apart),
 * is reported: the view does not hide a broken link.
 */
const TabRedirect = ({to, unknown}) => {
    const notify = useNotify();
    useEffect(() => {
        if (unknown) notify('ifdd.ui.tabNotFound', {type: 'warning', messageArgs: {tab: unknown}});
    }, [notify, unknown]);
    return <Navigate to={to} replace/>;
};

/**
 * True for the single document of ifdd-be-core: its @context maps the
 * context names to their namespaces.
 *
 * Lists and references put a short form of each record into react-admin's
 * cache (optimistic rendering), and the show view renders it until the single
 * document arrives. Its @context is a context URL, so it shows none of the
 * tabs; deciding on a redirect then would leave the tab the URL asks for.
 */
const isSingleDocument = (record) => {
    const contexts = record?.['@context'];
    return Boolean(contexts) && typeof contexts === 'object' && !Array.isArray(contexts);
};

/**
 * Build the show view for one aspect.
 *
 * Tabs are assembled below <Show>, so the record is already in context when
 * each tab decides whether it applies: one generic tab per context of the
 * record (aspect first, then the domain contexts the user may read), the
 * private tabs, the explorer and the base tab. Private tabs are discovered
 * from the mounted private tree and need no registration here.
 */
export const createAspectShow = ({resource, aspect, icon: Icon}) => {
    const privateTabs = privateTabsFor(aspect);
    const replaced = privateContextsFor(aspect);

    const AspectTabs = () => {
        const record = useRecordContext();
        const tab = useParams()['*'] ?? '';
        if (!isSingleDocument(record)) return null;

        const contexts = contextTabs(record, {aspect, icon: Icon ? <Icon/> : undefined, skip: replaced});
        const privates = privateTabs.map(build => build(record));
        const explorer = ifddShowExplorer ? cytoTab(record) : null;
        const base = baseTab(record);
        const paths = [...contexts, ...privates, explorer, base]
            .filter(Boolean)
            .map(element => element.props.path);

        if (!paths.includes(tab)) {
            return <TabRedirect to={showPath(resource, record.id, firstTab(paths, aspect))} unknown={tab || null}/>;
        }
        return (
            <TabbedShowLayout>
                {contexts}
                {privates}
                {explorer}
                {base}
            </TabbedShowLayout>
        );
    };

    const AspectShow = () => (
        <Show title={<NodeTitle/>}>
            <AspectTabs/>
        </Show>
    );

    AspectShow.displayName = `${resource}Show`;
    return AspectShow;
};
