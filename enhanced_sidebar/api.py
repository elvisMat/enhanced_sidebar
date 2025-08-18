# Copyright (c) 2025, Ibrahim Aboelsoud and contributors
# For license information, please see license.txt

import frappe

@frappe.whitelist()
def get_sidebar_menu_items():
    """
    Retrieves sidebar menu items categorized by their respective sidebar categories.

    :return: A dictionary containing sidebar categories as keys and a list of their corresponding menu items as values.
    """
    # Fetch all sidebar categories
    sidebar_categories = frappe.get_all("Sidebar Category", fields=["name", "category_name"])

    # Initialize a dictionary to store the categorized menu items
    categorized_menu_items = {}

    # Iterate through each sidebar category
    for category in sidebar_categories:
        # Fetch all sidebar menu items linked to the current category
        sidebar_menu_items = frappe.get_all(
            "Sidebar Menu Item",
            filters={"category": category.name},
            fields=["name", "name1", "route", "url", "icon", "custom_icon", "use_custom_icon", "link_to"]
        )
        # Store the menu items under their category's name
        categorized_menu_items[category.category_name] = sidebar_menu_items

    # Return the categorized menu items
    return categorized_menu_items 