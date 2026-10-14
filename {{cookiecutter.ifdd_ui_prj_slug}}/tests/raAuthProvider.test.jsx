import {describe, expect, it, vi} from 'vitest';

vi.mock('../src/Env', () => ({ifddAuthProvider: 'keycloak', ifddOidcClientId: 'ifddtest'}));

const {createRaAuthProvider} = await import('../src/auth/raAuthProvider');

const authWith = (profile, scope = 'openid profile email ifdd_nodes_ro') => ({
    isAuthenticated: true,
    user: {profile, scope},
    removeUser: vi.fn().mockResolvedValue(undefined),
});

describe('raAuthProvider permissions', () => {
    it('takes the client roles from the user profile', async () => {
        const auth = authWith({resource_access: {ifddtest: {roles: ['ifdd_public', 'ifdd_nodes_ro']}}});
        await expect(createRaAuthProvider()(auth).getPermissions())
            .resolves.toEqual(['ifdd_public', 'ifdd_nodes_ro']);
    });

    it('does not turn scope names into roles', async () => {
        // the audience scope is named like the read role and is in every token
        const auth = authWith({resource_access: {ifddtest: {roles: ['ifdd_public']}}});
        await expect(createRaAuthProvider()(auth).getPermissions()).resolves.toEqual(['ifdd_public']);
    });

    it('ignores roles of other clients', async () => {
        const auth = authWith({resource_access: {other: {roles: ['ifdd_nodes_ro']}}});
        await expect(createRaAuthProvider()(auth).getPermissions()).resolves.toEqual([]);
    });
});

describe('raAuthProvider checkError', () => {
    it('signs out on 401', async () => {
        const auth = authWith({});
        let signedOut = false;
        await createRaAuthProvider()(auth).checkError({status: 401}).catch(() => {
            signedOut = true;
        });
        expect(signedOut).toBe(true);           // react-admin then logs out
        expect(auth.removeUser).toHaveBeenCalled();
    });

    it('keeps the session on 403', async () => {
        const auth = authWith({});
        await expect(createRaAuthProvider()(auth).checkError({status: 403})).resolves.toBeUndefined();
        expect(auth.removeUser).not.toHaveBeenCalled();
    });
});
