extends Control

const SAVE_PATH := "user://real_estate_empire_save.json"
const PROTOTYPE_STARTING_CAPITAL := 100000000

var player_name := ""
var country := "Uganda"
var cash_balance := PROTOTYPE_STARTING_CAPITAL
var month_number := 1
var year_number := 2026
var property_count := 0

var page: VBoxContainer
var status_label: Label

func _ready() -> void:
	_build_shell()
	_show_main_menu()

func _build_shell() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var background := ColorRect.new()
	background.color = Color("#101923")
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)
	var margin := MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 36)
	margin.add_theme_constant_override("margin_right", 36)
	margin.add_theme_constant_override("margin_top", 28)
	margin.add_theme_constant_override("margin_bottom", 28)
	add_child(margin)
	var layout := VBoxContainer.new()
	layout.add_theme_constant_override("separation", 18)
	margin.add_child(layout)
	var heading := Label.new()
	heading.text = "REAL ESTATE EMPIRE  |  AFRICA"
	heading.add_theme_font_size_override("font_size", 28)
	heading.add_theme_color_override("font_color", Color("#F2B84B"))
	layout.add_child(heading)
	var rule := HSeparator.new()
	layout.add_child(rule)
	page = VBoxContainer.new()
	page.size_flags_vertical = Control.SIZE_EXPAND_FILL
	page.add_theme_constant_override("separation", 14)
	layout.add_child(page)
	status_label = Label.new()
	status_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	status_label.add_theme_color_override("font_color", Color("#AAB8C5"))
	layout.add_child(status_label)

func _clear_page() -> void:
	for child in page.get_children():
		child.queue_free()
	status_label.text = ""

func _add_title(text_value: String) -> void:
	var label := Label.new()
	label.text = text_value
	label.add_theme_font_size_override("font_size", 24)
	label.add_theme_color_override("font_color", Color("#FFFFFF"))
	page.add_child(label)

func _add_body(text_value: String) -> void:
	var label := Label.new()
	label.text = text_value
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	label.add_theme_font_size_override("font_size", 16)
	label.add_theme_color_override("font_color", Color("#D5DEE7"))
	page.add_child(label)

func _add_button(label_text: String, callback: Callable) -> void:
	var button := Button.new()
	button.text = label_text
	button.custom_minimum_size = Vector2(240, 46)
	button.pressed.connect(callback)
	page.add_child(button)

func _show_main_menu() -> void:
	_clear_page()
	_add_title("Build wealth. Develop cities. Shape Africa.")
	_add_body("A real-estate investment and development simulation. This is an early technical prototype; figures and mechanics are placeholders.")
	_add_button("NEW GAME", _show_new_game)
	_add_button("LOAD GAME", _load_game)
	_add_button("ABOUT THIS PROTOTYPE", _show_about)

func _show_about() -> void:
	_clear_page()
	_add_title("Prototype scope")
	_add_body("Phase 1 tests the Godot project structure, responsive Control-based interface, basic player setup, monthly time progression, and local save/load. It does not yet model real property prices, taxes, construction costs, or rental markets.")
	_add_button("BACK", _show_main_menu)

func _show_new_game() -> void:
	_clear_page()
	_add_title("Start your real estate journey")
	_add_body("Create a local test profile. Starting capital is a temporary gameplay placeholder, not a statement about real-world investment requirements.")
	var name_input := LineEdit.new()
	name_input.placeholder_text = "Player name"
	name_input.custom_minimum_size = Vector2(320, 44)
	page.add_child(name_input)
	var country_select := OptionButton.new()
	country_select.add_item("Uganda")
	country_select.add_item("Kenya")
	country_select.add_item("Tanzania")
	country_select.add_item("Rwanda")
	country_select.custom_minimum_size = Vector2(320, 44)
	page.add_child(country_select)
	var capital_note := Label.new()
	capital_note.text = "Prototype starting capital: UGX 100,000,000"
	page.add_child(capital_note)
	var start_button := Button.new()
	start_button.text = "CREATE GAME"
	start_button.custom_minimum_size = Vector2(240, 46)
	start_button.pressed.connect(func():
		player_name = name_input.text.strip_edges()
		if player_name.is_empty():
			status_label.text = "Enter a player name to continue."
			return
		country = country_select.get_item_text(country_select.selected)
		cash_balance = PROTOTYPE_STARTING_CAPITAL
		month_number = 1
		year_number = 2026
		property_count = 0
		_show_dashboard()
	)
	page.add_child(start_button)
	_add_button("CANCEL", _show_main_menu)

func _show_dashboard() -> void:
	_clear_page()
	_add_title("PLAYER DASHBOARD")
	_add_body("Investor: %s     Market: %s" % [player_name, country])
	_add_body("Date: %s %d" % [_month_name(month_number), year_number])
	_add_body("Available capital: UGX %s" % _format_money(cash_balance))
	_add_body("Property assets owned: %d" % property_count)
	_add_body("No property transactions are enabled in this prototype yet.")
	_add_button("ADVANCE ONE MONTH", _advance_month)
	_add_button("SAVE GAME", _save_game)
	_add_button("MAIN MENU", _show_main_menu)

func _advance_month() -> void:
	month_number += 1
	if month_number > 12:
		month_number = 1
		year_number += 1
	_show_dashboard()

func _save_game() -> void:
	var save_data := {
		"version": 1,
		"player_name": player_name,
		"country": country,
		"cash_balance": cash_balance,
		"month_number": month_number,
		"year_number": year_number,
		"property_count": property_count
	}
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		status_label.text = "Save failed. Error code: %d" % FileAccess.get_open_error()
		return
	file.store_string(JSON.stringify(save_data, "\t"))
	file.close()
	status_label.text = "Game saved on this device."

func _load_game() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		status_label.text = "No saved game was found on this device."
		return
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		status_label.text = "Could not open the saved game."
		return
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	file.close()
	if typeof(parsed) != TYPE_DICTIONARY or int(parsed.get("version", 0)) != 1:
		status_label.text = "Save file is invalid or uses an unsupported version."
		return
	player_name = str(parsed.get("player_name", "Player"))
	country = str(parsed.get("country", "Uganda"))
	cash_balance = int(parsed.get("cash_balance", PROTOTYPE_STARTING_CAPITAL))
	month_number = clampi(int(parsed.get("month_number", 1)), 1, 12)
	year_number = int(parsed.get("year_number", 2026))
	property_count = maxi(0, int(parsed.get("property_count", 0)))
	_show_dashboard()
	status_label.text = "Saved game loaded."

func _month_name(value: int) -> String:
	var names := ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
	return names[clampi(value - 1, 0, 11)]

func _format_money(value: int) -> String:
	var raw := str(value)
	var formatted := ""
	for index in range(raw.length()):
		if index > 0 and (raw.length() - index) % 3 == 0:
			formatted += ","
		formatted += raw[index]
	return formatted
