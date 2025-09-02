$(function () {
	frappe.db.get_value("Enhanced Navbar Settings", "Enhanced Navbar Settings", "enable_top_navbar")
		.then(r => {
			if (r.message && r.message.enable_top_navbar == "0") {
				const style = document.createElement('style');
				style.textContent = `
					.navbar.navbar-expand {
						display: none !important;
					}
				`;
				document.head.appendChild(style);
			}
		});
});
