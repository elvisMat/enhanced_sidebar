const original_Sidebar_class = frappe.ui.Sidebar;
let sidebar_build_in_progress = false;

const is_enhanced_sidebar_debug_enabled = () => {
	try {
		return (
			window.ENHANCED_SIDEBAR_DEBUG === true ||
			localStorage.getItem("enhanced_sidebar_debug") === "1"
		);
	} catch (error) {
		return window.ENHANCED_SIDEBAR_DEBUG === true;
	}
};

const debug_enhanced_sidebar = (...args) => {
	if (!is_enhanced_sidebar_debug_enabled()) return;
	console.log("[Enhanced Sidebar Debug]", ...args);
};

frappe.ui.Sidebar = class Sidebar extends original_Sidebar_class {
	async make_sidebar() {
		if (sidebar_build_in_progress) {
			return;
		}
		try {
			sidebar_build_in_progress = true;
			const menu_items = await this.get_menu_items();
			debug_enhanced_sidebar("Fetched menu items", menu_items);

			const has_custom_items =
				menu_items &&
				typeof menu_items === "object" &&
				Object.values(menu_items).some(
					(items) => Array.isArray(items) && items.length > 0
				);

			if (menu_items && typeof menu_items === "object") {
				const category_counts = Object.fromEntries(
					Object.entries(menu_items).map(([category, items]) => [
						category,
						Array.isArray(items) ? items.length : 0,
					])
				);
				debug_enhanced_sidebar("Category item counts", category_counts);
			}

			if (!has_custom_items) {
				debug_enhanced_sidebar(
					"No custom sidebar items found. Falling back to core sidebar rendering."
				);
				super.make_sidebar();
				return;
			}

			this.wrapper.find(".sidebar-items").empty();

			const page_groups = menu_items;

			const categories = Object.keys(page_groups).sort((a, b) => {
				if (a === __("General")) return -1;
				if (b === __("General")) return 1;
				return 0; //return a and b as is
			});

			categories.forEach((category) => {
				// Sort items within the category by idx before building the section
				const sorted_items = Array.isArray(page_groups[category])
					? [...page_groups[category]].sort((a, b) => (a.idx ?? 0) - (b.idx ?? 0))
					: page_groups[category];

				this.build_sidebar_section(category, sorted_items);
			});
			

			this.setup_collapsible_sections();

			// Scroll sidebar to selected page if it is not in viewport.
			this.wrapper.find(".selected").length &&
				!frappe.dom.is_element_in_viewport(this.wrapper.find(".selected")) &&
				this.wrapper.find(".selected")[0].scrollIntoView();

			if (typeof this.setup_sorting === "function") {
				this.setup_sorting();
			}
			this.set_active_workspace_item();
			if (typeof this.set_hover === "function") {
				this.set_hover();
			}
		} catch (error) {
			console.warn("Enhanced sidebar failed; falling back to core sidebar:", error);
			debug_enhanced_sidebar("Fallback reason: exception during custom rendering", error);
			super.make_sidebar();
		} finally {
			sidebar_build_in_progress = false;
		}
	}

	async get_menu_items() {
		return await frappe
			.call({
				method: "enhanced_sidebar.api.get_sidebar_menu_items",
				type: "GET",
			})
			.then((res) => res.message)
			.catch((error) => {
				debug_enhanced_sidebar("Sidebar API call failed", error);
				throw error;
			});
	}

	setup_collapsible_sections() {
		// Load saved states first
		this.load_sidebar_states();

		this.wrapper
			.find(".standard-sidebar-section > summary")
			.off("click")
			.on("click", (e) => {
				e.preventDefault();
				const details = e.currentTarget.parentElement;
				const sectionTitle = details.getAttribute("data-title");

				if (details.hasAttribute("open")) {
					// Closing animation
					details.classList.add("closing");
					this.save_sidebar_state(sectionTitle, false);

					// Wait for animation to complete before removing open attribute
					setTimeout(() => {
						details.removeAttribute("open");
						details.classList.remove("closing");
					}, 340); // Match the transition duration
				} else {
					// Opening animation
					details.setAttribute("open", "");
					this.save_sidebar_state(sectionTitle, true);
				}
			});
	}

	save_sidebar_state(sectionTitle, isOpen) {
		try {
			let savedStates = JSON.parse(localStorage.getItem("sidebar_section_states") || "{}");
			savedStates[sectionTitle] = isOpen;
			localStorage.setItem("sidebar_section_states", JSON.stringify(savedStates));
		} catch (error) {
			console.warn("Failed to save sidebar state:", error);
		}
	}

	load_sidebar_states() {
		try {
			const savedStates = JSON.parse(localStorage.getItem("sidebar_section_states") || "{}");

			this.wrapper.find(".standard-sidebar-section").each((index, section) => {
				const sectionTitle = section.getAttribute("data-title");
				if (Object.prototype.hasOwnProperty.call(savedStates, sectionTitle)) {
					if (savedStates[sectionTitle]) {
						section.setAttribute("open", "");
					} else {
						section.removeAttribute("open");
					}
				}
			});
		} catch (error) {
			console.warn("Failed to load sidebar states:", error);
		}
	}

	build_sidebar_section(title, root_pages) {
		let sidebar_section;
		let items_container;

		if (title !== "All") {
			sidebar_section = $(
				`<details class="standard-sidebar-section" data-title="${title}" open>
					<summary class="sidebar-section-title">
						<span>${__(title)}</span>
						<span class="sidebar-arrow">
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
						</span>
					</summary>
				</details>`
			);
			items_container = $('<div class="items-container_d2asc"></div>').appendTo(
				sidebar_section
			);
		} else {
			sidebar_section = $(
				`<div class="standard-sidebar-section nested-container" data-title="${title}"></div>`
			);
			items_container = sidebar_section;
		}

		this.prepare_sidebar(root_pages, items_container);

		if (Object.keys(root_pages).length === 0) {
			sidebar_section.addClass("hidden");
		}
		sidebar_section.appendTo(this.wrapper.find(".sidebar-items"));

		$(".item-anchor").on("click", () => {
			$(".list-sidebar.hidden-xs.hidden-sm").removeClass("opened");
			// $(".close-sidebar").css("display", "none");
			$("body").css("overflow", "auto");
			if (frappe.is_mobile()) {
				this.close();
			}
		});

		if (sidebar_section.find(".sidebar-item-container").length) {
			let visible_items;
			if (title !== "All") {
				visible_items = items_container.find("> [item-is-hidden='0']");
			} else {
				visible_items = sidebar_section.find("> [item-is-hidden='0']");
			}

			if (visible_items.length == 0) {
				sidebar_section.addClass("hidden show-in-edit-mode");
			}
		}
	}

	prepare_sidebar(items, container) {
		let last_item = null;
		for (let item of items) {
			if (item.public && last_item && !last_item.public) {
				$(`<div class="divider"></div>`).appendTo(container);
			}

			// visibility not explicitly set to 0
			if (item.visibility !== 0) {
				this.append_item(item, container);
			}
			last_item = item;
		}
	}

	sidebar_item_container(item) {
		const is_workspace = item.link_to === "Workspace";

		const link_html = `<a
			class="item-anchor ${item.selected ? "selected" : ""}"
			href="${item.link_to === "URL" ? item.url : item.route}"
			title="${item.name1}"
			style="
				width: 100%;
				text-decoration: none;
				font-weight: 800;
				color: ${item.selected ? "var(--text-on-color)" : "var(--text-color)"};
				font-size: 13px !important;
			"
		>
			<span class="sidebar-item-label">${item.name1}</span>
		</a>`;

		const icon_html = item.use_custom_icon
			? `<img src="${item.custom_icon}" class="sidebar-item-icon" style="width: 22px; height: 22px; object-fit: contain;">`
			: `<span class="sidebar-item-icon">${frappe.utils.icon(
					item.icon || "list",
					"lg"
			  )}</span>`;

		return $(`
			<li class="sidebar-item-container ${is_workspace ? "workspace-item" : ""}"
				data-item-name="${item.name1}"
				data-is-public="${item.public || 1}"
				item-is-hidden="0"
			>
				<div class="sidebar-item-control">
					<div
						style="
							display: flex;
							align-items: center;
							gap: var(--margin-sm);
							padding: var(--padding-xs) var(--padding-sm);
							border-radius: var(--border-radius-md);
							transition: background-color 0.1s ease-in-out;
							background-color: ${item.selected ? "var(--control-bg)" : "transparent"};
						"
						onmouseover="this.style.backgroundColor='${
							item.selected ? "var(--control-bg)" : "var(--subtle-fg)"
						}'"
        				onmouseout="this.style.backgroundColor='${
							item.selected ? "var(--control-bg)" : "transparent"
						}'"
					>
						${icon_html}
						${link_html}
					</div>
				</div>
			</li>
		`);
	}

	append_item(item, container) {
		let is_current_page = window.location.pathname.includes(item.route);

		item.selected = is_current_page;

		if (is_current_page) {
			this.current_page = { name: item.name, public: item.public };
		}

		let $item_container = this.sidebar_item_container(item);
		$item_container.appendTo(container);
	}

	toggle_sidebar() {
		if (!this.sidebar_expanded) {
			$(".body-sidebar-container").find(".sidebar-section-title").show();
			this.open();
		} else {
			$(".body-sidebar-container").find(".sidebar-section-title").hide();
			this.close();
		}
	}
};
