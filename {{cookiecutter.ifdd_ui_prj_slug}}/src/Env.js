// Single source of configuration for this instance.
// Rendered by cookiecutter at generation time; edit the values here, not in
// scattered environment variables.

export const ifddUrlRest = "{{cookiecutter.ifdd_be_url}}";
export const ifddUrlSchema = "{{cookiecutter.ifdd_schema_url}}";
export const ifddUrlType = "{{cookiecutter.ifdd_type_url}}";
export const ifddUrlUnit = "{{cookiecutter.ifdd_unit_url}}";

export const ifddBackgroundImage = "/Main_IFDD.jpg";
export const ifddDashboardImage = "/Main_IFDD_white.jpg";
export const ifddTitle = "{{cookiecutter.ifdd_ui_title}}";
export const ifddVersion = "{{cookiecutter.ifdd_ui_version}}";

// Aspects this instance exposes. Each entry must be present in the aspect
// registry (src/ifdd/registry.jsx).
export const ifddAspects = {{cookiecutter.ifdd_ui_aspects}};

export const ifddShowExplorer = {% if cookiecutter.ifdd_ui_show_explorer == "y" %}true{% else %}false{% endif %};

// OIDC
export const ifddAuthProvider = "{{cookiecutter.ifdd_oidc_provider}}";
export const ifddOidcRealm = "{{cookiecutter.ifdd_oidc_realm}}";
export const ifddOidcClientId = "{{cookiecutter.ifdd_oidc_client_id}}";
