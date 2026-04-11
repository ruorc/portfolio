/**
 * Security Module
 * Handles HTML sanitization, SVG support, and link protection.
 */
export const Security = {
    BLACKLIST_TAGS: [
        'script', 'iframe', 'object', 'style'
    ],

    ALLOWED_TAGS: [
        'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 
        'a', 'img', 'b', 'i', 'strong', 'em', 'br', 'hr', 'section', 'article', 
        'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'g', 'defs', 'symbol',
        'button', 'form', 'input', 'label', 'textarea'
    ],

    ALLOWED_ATTRIBUTES: [
        'class', 'id', 'href', 'src', 'alt', 'title', 'target', 'rel', 'loading',
        'viewBox', 'fill', 'stroke', 'stroke-width', 'd', 'points', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'xmlns',
        'type', 'value', 'name', 'placeholder', 'disabled', 'required', 'checked'
    ],

    sanitize(htmlString) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const currentHost = window.location.hostname;

        doc.querySelectorAll('*').forEach(el => {
            const tagName = el.tagName.toLowerCase();
            
            // 1. Tag Filtering
            if (!this.ALLOWED_TAGS.includes(tagName)) {
                if (this.BLACKLIST_TAGS.includes(tagName)) {
                    el.remove();
                } else {
                    el.replaceWith(...el.childNodes);
                }

                return;
            }

            // 2. Link & External Domain Logic
            if (tagName === 'a') {
                const href = el.getAttribute('href');
                if (href?.startsWith('http')) {
                    try {
                        const url = new URL(href);
                        if (url.hostname !== currentHost) {
                            el.classList.add('external');
                            el.setAttribute('target', '_blank');
                            el.setAttribute('rel', 'noopener noreferrer');
                        }
                    } catch (e) {}
                }
            }

            // 3. Asset Optimization (Lazy Loading)
            if (tagName === 'img' && !el.hasAttribute('loading')) {
                el.setAttribute('loading', 'lazy');
            }

            // 4. Attribute Filtering (Whitelist + data-*)
            const attrs = el.attributes;
            for (let i = attrs.length - 1; i >= 0; i--) {
                const attrName = attrs[i].name;
                const attrValue = attrs[i].value;
                const isDataAttr = attrName.startsWith('data-');
                const isAllowed = this.ALLOWED_ATTRIBUTES.includes(attrName);
                const isSafeValue = !attrValue.trim().toLowerCase().startsWith('javascript:');

                if (!(isAllowed || isDataAttr) || !isSafeValue) {
                    el.removeAttribute(attrName);
                }
            }
        });

        return doc.body.innerHTML;
    }
};
