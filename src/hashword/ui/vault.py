from textual.app import ComposeResult
from textual.binding import Binding
from textual.containers import Horizontal, Vertical
from textual.screen import Screen
from textual.widgets import Button, Footer, Input, Label, ListItem, ListView, Static

GREEN = "#00FF00"
BLACK = "#000000"

ENTRIES = [
    {"site": "GitHub", "username": "dev@example.com", "password": "gh-demo-8472"},
    {"site": "Email", "username": "hello@example.com", "password": "mail-demo-3915"},
    {"site": "Banking", "username": "user_2048", "password": "bank-demo-6251"},
    {"site": "Cloud Storage", "username": "dev@example.com", "password": "cloud-demo-1083"},
]


class VaultScreen(Screen):
    TITLE = "Hashword Vault"

    BINDINGS = [
        Binding("ctrl+l", "lock", "Lock vault", show=True),
    ]

    CSS = f"""
    Screen {{
        layout: vertical;
        color: {GREEN};
        background: {BLACK};
    }}

    #topbar {{
        height: 3;
        padding: 0 2;
        border-bottom: solid {GREEN};
        align: left middle;
        background: {BLACK};
    }}

    #brand {{
        width: 1fr;
        color: {GREEN};
        text-style: bold;
        content-align: left middle;
    }}

    #demo-tag {{
        width: auto;
        margin-right: 2;
        color: {GREEN};
        text-style: bold;
    }}

    #lock-button {{
        width: 16;
        height: 1;
        min-width: 0;
        padding: 0;
        border: none;
        color: {GREEN};
        background: {BLACK};
        text-style: bold;
    }}

    #lock-button:hover, #lock-button:focus {{
        color: {BLACK};
        background: {GREEN};
    }}

    #main {{
        height: 1fr;
        padding: 1 2;
    }}

    #sidebar {{
        width: 34;
        height: 1fr;
        padding: 1;
        border: round {GREEN};
        background: {BLACK};
    }}

    #list-heading, #detail-heading {{
        height: 1;
        margin-bottom: 1;
        color: {GREEN};
        text-style: bold;
    }}

    #search {{
        height: 3;
        margin-bottom: 1;
        color: {GREEN};
        background: {BLACK};
        border: round {GREEN};
    }}

    #search:focus {{
        border: double {GREEN};
    }}

    #entries {{
        height: 1fr;
        border: none;
        background: {BLACK};
        scrollbar-color: {GREEN};
        scrollbar-color-hover: {GREEN};
        scrollbar-color-active: {GREEN};
    }}

    #entries > ListItem {{
        height: 3;
        padding: 0 1;
        color: {GREEN};
        background: {BLACK};
        border-bottom: solid {GREEN};
    }}

    #entries > ListItem.-highlight {{
        color: {BLACK};
        background: {GREEN};
        text-style: bold;
    }}

    #detail {{
        width: 1fr;
        height: 1fr;
        margin-left: 1;
        padding: 1 2;
        border: round {GREEN};
        background: {BLACK};
    }}

    .field-label {{
        height: 1;
        margin-top: 1;
        color: {GREEN};
        text-style: bold;
    }}

    .field-value {{
        height: 1;
        color: {GREEN};
    }}

    #detail-actions {{
        height: 3;
        margin-top: 2;
    }}

    #detail-actions Button {{
        width: 20;
        min-width: 0;
        height: 3;
        margin-right: 1;
        color: {GREEN};
        background: {BLACK};
        border: round {GREEN};
        text-style: bold;
    }}

    #detail-actions Button:hover, #detail-actions Button:focus {{
        color: {BLACK};
        background: {GREEN};
    }}

    #notice {{
        height: 1;
        margin-top: 2;
        color: {GREEN};
    }}

    Footer, FooterKey,
    FooterKey .footer-key--key,
    FooterKey .footer-key--description {{
        color: {GREEN};
        background: {BLACK};
    }}
    """

    def __init__(self) -> None:
        super().__init__()
        self.visible_entries = ENTRIES.copy()
        self.selected_entry = ENTRIES[0]
        self.password_visible = False

    def compose(self) -> ComposeResult:
        with Horizontal(id="topbar"):
            yield Label("HASHWORD  /  VAULT", id="brand")
            yield Label("DEMO DATA  •  NOT SAVED", id="demo-tag")
            yield Button("[ LOCK ]", id="lock-button")

        with Horizontal(id="main"):
            with Vertical(id="sidebar"):
                yield Label("YOUR ENTRIES", id="list-heading")
                yield Input(placeholder="Search vault...", id="search")
                yield ListView(*self._list_items(self.visible_entries), id="entries")

            with Vertical(id="detail"):
                yield Label("ENTRY DETAILS", id="detail-heading")
                yield Label("WEBSITE", classes="field-label")
                yield Static(self.selected_entry["site"], id="site-value", classes="field-value")
                yield Label("USERNAME", classes="field-label")
                yield Static(self.selected_entry["username"], id="username-value", classes="field-value")
                yield Label("PASSWORD", classes="field-label")
                yield Static("••••••••••", id="password-value", classes="field-value")
                with Horizontal(id="detail-actions"):
                    yield Button("[ REVEAL ]", id="reveal-button")
                    yield Button("[ COPY ]", id="copy-button")
                yield Label("Select an entry to view its details.", id="notice")

        yield Footer()

    @staticmethod
    def _list_items(entries: list[dict[str, str]]) -> list[ListItem]:
        return [
            ListItem(Static(f"{entry['site']}  /  {entry['username']}"))
            for entry in entries
        ]

    def on_mount(self) -> None:
        self.query_one("#search", Input).focus()

    async def on_input_changed(self, event: Input.Changed) -> None:
        if event.input.id != "search":
            return

        query = event.value.casefold().strip()
        self.visible_entries = [
            entry
            for entry in ENTRIES
            if query in entry["site"].casefold()
            or query in entry["username"].casefold()
        ]
        entries = self.query_one("#entries", ListView)
        await entries.clear()
        await entries.extend(self._list_items(self.visible_entries))

        if self.visible_entries:
            self.selected_entry = self.visible_entries[0]
            entries.index = 0
            self._show_entry(self.selected_entry)
        else:
            self.query_one("#site-value", Static).update("No matching entries")
            self.query_one("#username-value", Static).update("—")
            self.query_one("#password-value", Static).update("—")

    def on_list_view_selected(self, event: ListView.Selected) -> None:
        if event.list_view.id == "entries" and event.index < len(self.visible_entries):
            self.selected_entry = self.visible_entries[event.index]
            self._show_entry(self.selected_entry)

    def _show_entry(self, entry: dict[str, str]) -> None:
        self.password_visible = False
        self.query_one("#site-value", Static).update(entry["site"])
        self.query_one("#username-value", Static).update(entry["username"])
        self.query_one("#password-value", Static).update("••••••••••")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "lock-button":
            self.action_lock()
        elif event.button.id == "reveal-button":
            self.password_visible = not self.password_visible
            value = self.selected_entry["password"] if self.password_visible else "••••••••••"
            self.query_one("#password-value", Static).update(value)
            event.button.label = "[ HIDE ]" if self.password_visible else "[ REVEAL ]"
        elif event.button.id == "copy-button":
            self.app.copy_to_clipboard(self.selected_entry["password"])
            self.query_one("#notice", Label).update("Demo password copied to clipboard.")

    def action_lock(self) -> None:
        self.app.pop_screen()
