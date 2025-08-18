frappe.provide("frappe.enhanced_sidebar.events_utils");

/**
 * Builds an event handler object for Frappe UI forms.
 *
 * This function takes an array of handler definitions. It composes a single
 * function for each event, which calls all the associated handlers.
 *
 * @param {Array<{handler: Function, events: string[]}>} handler_definitions - An array of
 *   objects, each containing a handler function and an array of event names (events)
 *   that trigger it.
 * @returns {Object.<string, Function>} An object that can be passed to `frappe.ui.form.on`.
 *   Keys are event names, and values are the composed event handler functions.
 */
frappe.enhanced_sidebar.events_utils.build_event_handlers = function (handler_definitions) {
	const all_events = {}; // maps field to list of handlers

	for (const { handler, events } of handler_definitions) {
		events.forEach((event) => {
			if (!all_events[event]) {
				all_events[event] = [];
			}
			all_events[event].push(handler);
		});
	}

	const final_events = {}; // maps field to a single function
	for (const event in all_events) {
		const handlers = all_events[event];
		final_events[event] = async (frm) => {
			// Using Set to ensure a handler is not called twice for the same event
			const unique_handlers = [...new Set(handlers)];

			for (const h of unique_handlers) {
				await h(frm);
			}
		};
	}

	return final_events;
};
