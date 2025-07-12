
export function search(input, template) {
    try {
        return new URL(input).toString();
    } catch (err) { }

    try {
        const url = new URL(`http://${input}`);
        if (url.hostname.includes(".")) return url.toString();
    } catch (err) { }

    return template.replace("%s", encodeURIComponent(input));
}

export function getFavicon(url) {
    return 'https://s2.googleusercontent.com/s2/favicons?sz=64&domain_url=' + encodeURIComponent(url)
}