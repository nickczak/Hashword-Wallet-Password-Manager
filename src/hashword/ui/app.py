from textual.app import App, ComposeResult
from textual.binding import Binding
from textual.containers import Vertical
from textual.widgets import Button, Footer, Input, Label, Static
from textual.reactive import reactive

GREEN = "#00FF00"
BLACK = "#000000"

BANNER = """\
   ▄▄▄  ▄▄▄                                             
  █▀██  ██               █▄                           █▄
    ██  ██               ██                   ▄       ██
    ██████   ▄▀▀█▄ ▄██▀█ ████▄▀█▄ █▄ ██▀▄███▄ ████▄▄████
    ██  ██   ▄█▀██ ▀███▄ ██ ██ ██▄██▄██ ██ ██ ██   ██ ██
  ▀██▀  ▀██▄▄▀█▄███▄▄██▀▄██ ██  ▀██▀██▀▄▀███▀▄█▀  ▄█▀███"""


class HashwordApp(App):
    TITLE = "Hashword"

    focus_mode: reactive[bool] = reactive(False)

    BINDINGS = [
        Binding("enter", "unlock", "Unlock", priority=True),
        Binding("ctrl+q", "quit", "Quit", show=True),
        Binding("escape", "toggle_focus_mode", "Toggle Focus Mode", priority=True, show=True),
        Binding("j", "focus_next_field", "Next", priority=True, show=True),
        Binding("k", "focus_previous_field", "Previous", priority=True, show=True),
    ]

    CSS = f"""
    Screen {{
        align: center middle;
        color: {GREEN};
        background: {BLACK};
    }}

    Screen.-focus-mode #unlock {{
        border: double {GREEN};
    }}

    #unlock {{
        width: 66;
        height: auto;
        padding: 1 2;
        border: round {GREEN};
        color: {GREEN};
        background: {BLACK};
    }}

    #title, #subtitle, #status {{
        width: 100%;
        text-align: center;
        color: {GREEN};
        background: {BLACK};
    }}

    #title {{
        height: 8;
        content-align: center middle;
        text-wrap: nowrap;
        text-style: bold;
    }}

    #subtitle {{
        margin: 1 0;
    }}

    Input, Button {{
        width: 100%;
        margin: 1 0;
        color: {GREEN};
        background: {BLACK};
        border: round {GREEN};
    }}

    Input:focus {{
        border: round {GREEN};
    }}

    Input > .input--placeholder, Input > .input--suggestion {{
        color: {GREEN};
        background: {BLACK};
    }}

    Input > .input--cursor {{
        color: {BLACK};
        background: {GREEN};
    }}

    Button {{
        text-style: bold;
    }}

    Button:hover, Button:focus {{
        color: {BLACK};
        background: {GREEN};
    }}

    #status {{
        margin: 1 0;
    }}

    Footer {{
        color: {GREEN};
        background: {BLACK};
    }}

    FooterKey {{
        color: {GREEN};
        background: {BLACK};
    }}

    FooterKey .footer-key--key,
    FooterKey .footer-key--description {{
        color: {GREEN};
        background: {BLACK};
    }}
    """

    def compose(self) -> ComposeResult:
        with Vertical(id="unlock"):
            yield Static(BANNER, id="title")
            yield Label("Unlock your password vault", id="subtitle")
            yield Input(placeholder="Master password", password=True, id="password")
            yield Button("Unlock", id="unlock-button")
            yield Label("", id="status")
        yield Footer()

    def on_mount(self) -> None:
        self.query_one("#password", Input).focus()

    def action_unlock(self) -> None:
        self.query_one("#password", Input).value = ""
        self.query_one("#status", Label).update("Vault is not wired up yet.")

    def action_toggle_focus_mode(self) -> None:
        self.focus_mode = not self.focus_mode
        self.screen.set_class(self.focus_mode, "-focus-mode")
        status = self.query_one("#status", Label)
        status.update("[ FOCUS MODE ]" if self.focus_mode else "")

    def action_focus_next_field(self) -> None:
        if self.focus_mode:
            self.query_one("#unlock-button", Button).focus()

    def action_focus_previous_field(self) -> None:
        if self.focus_mode:
            self.query_one("#password", Input).focus()

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "unlock-button":
            self.action_unlock()

