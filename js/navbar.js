// The navbar is shared by pages at different depths (index.html at the site
// root, page/*.html one level down), so its URLs cannot be written relative to
// the document. Resolve them against the site root instead, derived from this
// script's own URL. That keeps the site working at a project Pages path
// (/WEB-Portfolio/) as well as at a domain root.
const SITE_ROOT = new URL("../", document.currentScript.src).href;

function normalize(pathname) {
    return pathname.endsWith("/") ? pathname + "index.html" : pathname;
}

document.addEventListener("DOMContentLoaded", () => {

    fetch(new URL("menu/navbar.html", SITE_ROOT))
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        })
        .then(data => {
            const container = document.getElementById("navbar");
            container.innerHTML = data;

            // Rewrite the fragment's root-relative URLs against the site root.
            // Absolute URLs are returned unchanged by the URL constructor.
            container.querySelectorAll("[href], [src]").forEach(el => {
                const attr = el.hasAttribute("href") ? "href" : "src";
                const value = el.getAttribute(attr);
                if (!value || value.startsWith("#")) return;
                el.setAttribute(attr, new URL(value, SITE_ROOT).href);
            });

            // Highlight whichever link points at the current page.
            const here = normalize(location.pathname);
            container.querySelectorAll(".nav-link").forEach(link => {
                const active = normalize(new URL(link.href).pathname) === here;
                link.classList.toggle("active", active);
                if (active) {
                    link.setAttribute("aria-current", "page");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        })
        .catch(error => {
            console.error("ไม่สามารถโหลด Navbar ได้:", error);
        });

});
