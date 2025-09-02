$(function () {
	// Wait until the Frappe app is fully initialized to ensure UI elements are present.
	// Define all the fields you need from the settings DocType.
	const fields_to_fetch = [
		"hide_app_switcher",
		"custom_logo",
		"custom_logo_href",
		"custom_title"
	];

	frappe.db.get_value("Enhanced Navbar Settings", "Enhanced Navbar Settings", fields_to_fetch)
		.then(r => {
			// Ensure we have a valid response and the message object.
			if (!r || !r.message) return;

			const settings = r.message;

			// Proceed only if the feature is enabled (checkbox is 1).
			if (settings.hide_app_switcher == "1") {
				addCustomStyles();
				addCustomLogo(settings);
			}
		});
});

/**
 * Injects CSS to hide the default app switcher and style the new logo.
 */
function addCustomStyles() {
	// Check if styles have already been added to prevent duplication.
	if (document.getElementById("enhanced-navbar-styles")) {
		return;
	}
	const style = document.createElement('style');
	style.id = "enhanced-navbar-styles";
	style.textContent = `
        .app-switcher-dropdown { cursor: default; }
        a.app-switcher-dropdown:hover, a.app-switcher-dropdown.active-sidebar {
            background: none !important;
            box-shadow: none !important;
        }
        .sidebar-item-control button.btn-reset.drop-icon { display: none !important; }
        .app-switcher-menu { display: none !important; }
        .standard-sidebar-item > .d-flex:not(.custom-logo-block) { display: none !important; }
        .custom-logo-block { align-items: center; }
    `;
	document.head.appendChild(style);
}

/**
 * Creates and prepends the custom logo element to the sidebar.
 * @param {object} settings - The settings object containing logo, href, and title.
 */
function addCustomLogo(settings) {
	// Check if the custom logo has already been added.
	if (document.getElementById("custom-enhanced-logo")) {
		return;
	}

	// Find the container where the logo should be added.
	const logoContainer = document.querySelector("a.app-switcher-dropdown");
	if (!logoContainer) return;

	// Use default values if any setting is missing.
	const href = settings.custom_logo_href || "/";
	const logo_src = settings.custom_logo || "";
	const title = settings.custom_title || "";

	const newLogoBlock = document.createElement("div");
	// Corrected the typo in the ID from "enhacned" to "enhanced".
	newLogoBlock.id = "custom-enhanced-logo";
	newLogoBlock.className = "standard-sidebar-item";

	newLogoBlock.innerHTML = `
        <a class="d-flex custom-logo-block" href="${href}">
            <div class="enhanced-logo-container">
                <img class="enhanced-logo" src="${logo_src}" alt="Logo" style="width: 34px; height: 34px; border-radius: 4px;">
            </div>
            <div class="enhanced-app-title" style="margin-left: 10px; font-weight: bold;">${title}</div>
        </a>
    `;

	// Prepend the new logo block to the container.
	logoContainer.prepend(newLogoBlock);
}
