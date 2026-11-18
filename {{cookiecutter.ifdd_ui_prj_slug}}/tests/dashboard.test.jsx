import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {AdminContext} from 'react-admin';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import english from '../src/i18n/en';
import {Dashboard} from '../src/Dashboard';

vi.mock('react-oidc-context', () => ({useAuth: () => ({isAuthenticated: false})}));

// Waits for the version line, so that the failed version request settles inside the test.
const renderDashboard = async props => {
    render(
        <AdminContext i18nProvider={polyglotI18nProvider(() => english, 'en')}>
            <Dashboard {...props}/>
        </AdminContext>,
    );
    await screen.findByText(/no backend version/);
};

describe('dashboard', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))));
    });
    afterEach(() => vi.unstubAllGlobals());

    it('tells a user without a read role why nothing is shown', async () => {
        await renderDashboard({permissions: ['ifdd_public'], permissionsLoaded: true});
        expect(screen.getByRole('status')).toHaveTextContent('without the right to read');
        expect(screen.queryByRole('link')).toBeNull();
    });

    it('shows the aspects and no hint with a read role', async () => {
        await renderDashboard({permissions: ['ifdd_nodes_ro'], permissionsLoaded: true});
        expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
        expect(screen.queryByRole('status')).toBeNull();
    });

    it('shows no hint while the permissions are loading', async () => {
        await renderDashboard({permissions: [], permissionsLoaded: false});
        expect(screen.queryByRole('status')).toBeNull();
    });
});
