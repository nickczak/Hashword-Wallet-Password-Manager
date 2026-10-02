<div align="center">
<pre>
                                                         
   ▄▄▄  ▄▄▄                                             
  █▀██  ██               █▄                           █▄
    ██  ██               ██                   ▄       ██
    ██████   ▄▀▀█▄ ▄██▀█ ████▄▀█▄ █▄ ██▀▄███▄ ████▄▄████
    ██  ██   ▄█▀██ ▀███▄ ██ ██ ██▄██▄██ ██ ██ ██   ██ ██
  ▀██▀  ▀██▄▄▀█▄███▄▄██▀▄██ ██  ▀██▀██▀▄▀███▀▄█▀  ▄█▀███
</pre>
</div>

# Hashword Wallet

A terminal-based password vault prototype built with Python and Textual.

## Run from source

You’ll need Python 3.11 or newer. From the project root, create and activate a virtual environment, then install Hashword in editable mode:

```bash
python3 -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
python -m pip install -e .
```

Start the app:

```bash
hashword
```

If the `hashword` command isn’t available, run the source entry point directly:

```bash
python -m hashword.main
```

## Demo controls

- Demo master password: `password`
- `Enter`: attempt to unlock
- `Escape`: toggle focus mode
- `j` / `k`: move between the password field and Unlock button while in focus mode
- `Ctrl+Q`: quit

## Important: demo only

This version is a UI prototype. The master password is hard-coded, and the sample vault entries are temporary demo data that are not encrypted or saved. **Do not use real passwords or sensitive information in this version.**
