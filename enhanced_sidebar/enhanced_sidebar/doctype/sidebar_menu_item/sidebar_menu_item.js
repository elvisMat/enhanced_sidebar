// Copyright (c) 2025, Ibrahim Aboelsoud and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Sidebar Menu Item", {
// 	refresh(frm) {

// 	},
// });
frappe.provide("frappe.enhanced_sidebar.sidebar_menu_item_utils");

frappe.enhanced_sidebar.sidebar_menu_item_utils.auto_set_route_based_on_workspace = async function (frm) {
	const doc = frm.doc;
	const selected_workspace = doc.workspace;

	if (selected_workspace) {
		const response = await frappe.db.get_value("Workspace", selected_workspace, "name");
		const workspace_name = response.message.name.replace(/\s+/g, "-").toLowerCase();
		frm.set_value("route", `/app/${workspace_name}`);
	}
};

const sidebar_menu_item_handler_definitions = [
	{
		handler: frappe.enhanced_sidebar.sidebar_menu_item_utils.auto_set_route_based_on_workspace,
		events: ["workspace"],
	},
];

const sidebar_menu_item_events = frappe.enhanced_sidebar.events_utils.build_event_handlers(sidebar_menu_item_handler_definitions);

frappe.ui.form.on("Sidebar Menu Item", sidebar_menu_item_events);
