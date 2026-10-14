/**
 * Translations contributed by the private tree.
 *
 * Mount your private tree at src/private and add src/private/i18n/<locale>.js
 * exporting a plain object. It is merged into the built-in messages, so the
 * labels of your internal namespaces stay out of this repository.
 */

const modules = import.meta.glob('../private/i18n/*.js', {eager: true});

const isPlainObject = value => value && typeof value === 'object' && !Array.isArray(value);

const deepMerge = (target, source) => {
    Object.entries(source).forEach(([key, value]) => {
        if (isPlainObject(value) && isPlainObject(target[key])) {
            deepMerge(target[key], value);
        } else {
            target[key] = value;
        }
    });
    return target;
};

export const privateMessages = (locale) => {
    const entry = Object.entries(modules)
        .find(([path]) => path.endsWith(`/${locale}.js`));
    return entry ? (entry[1].default || entry[1]) : {};
};

export const mergeWithPrivate = (messages, locale) =>
    deepMerge(structuredClone(messages), privateMessages(locale));
