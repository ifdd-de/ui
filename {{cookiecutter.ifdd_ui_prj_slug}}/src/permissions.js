export const ROLES = {
    ifdd_nodes_priv: 'ifdd_nodes_priv',
    ifdd_nodes_ro: 'ifdd_nodes_ro',
    ifdd_nodes_rw: 'ifdd_nodes_rw',
};

export const READ_ROLES = [ROLES.ifdd_nodes_priv, ROLES.ifdd_nodes_ro, ROLES.ifdd_nodes_rw];

export const hasRole = (permissions, roleOrRoles) => {
    if (!Array.isArray(permissions)) return false;
    const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
    return permissions.some(permission => roles.includes(permission));
};
