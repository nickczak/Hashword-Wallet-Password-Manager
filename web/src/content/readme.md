A terminal-style wallet and password manager, built with React and Ink, with a browser companion built in Next.js.

Navigate passwords, wallets, and account details using the keyboard. The interface uses green block lettering, masked fields, and familiar terminal controls.

![Animated demonstration of the Hashword terminal interface](/showcase-desktop.gif)

## Current status

Hashword is **in development**. Both apps start without preloaded vault records. No hardcoded master key is accepted. Vault unlocking remains unavailable until authentication and encryption are connected.

Encrypted vault storage, account authentication, and SSH access are planned. The GIF above shows an earlier interface preview with illustrative records, not current vault contents.

## Connect over SSH

SSH access will let you open Hashword from your own terminal without installing the app.

**The public SSH service is not live yet.** No connection hostname has been published. Once it is available, replace `SSH_HOST` below with the announced hostname:

```sh
ssh -t SSH_HOST
```

This is a command template, not a working address. The `-t` option requests an interactive terminal.

The intended connection flow is:

1. Open a terminal with an SSH client installed.
2. Connect using the published SSH command.
3. Verify the server's host-key fingerprint against the published fingerprint before trusting a first connection.
4. Hashword opens automatically; follow its account and master-key prompts.
5. Use `Ctrl+Q` to exit Hashword. The hosted service is intended to close the connection when you exit.

Account setup and host-key details will be documented when the service launches.

### Where the app runs

Over SSH, Hashword runs on the remote server. SSH protects the connection in transit, but the remote application can access the master key you enter and any secrets it decrypts. This differs from an installed client that performs vault encryption and decryption on your own machine.

## Run the terminal preview locally

Install Node.js 22 or newer and download or clone the [Hashword repository](https://github.com/nickczak/Hashword-Wallet-Password-Manager).

From the repository root:

```sh
cd hashword
npm ci
npm run dev
```

The app opens to the master-key prompt. Unlocking will become available when the authentication and encryption services are connected.

To build and install the local command:

```sh
npm run build
npm link
hashword
```

## Keyboard controls

- `Enter`: submit the master key, open an entry, or confirm a prompt.
- `j` / `k` or arrow keys: move through vault entries.
- `p`: open passwords.
- `w`: open wallets.
- `a`: open account details.
- `i`: edit a selected field.
- `Esc`: cancel an edit or return to the entry list.
- `Ctrl+L`: lock the vault.
- `Ctrl+Q`: quit.

Vault navigation shortcuts are intended for unlocked sessions; unlocking is currently unavailable.

## Browser companion

The **terminal** selection previews the unlock experience. The **api** selection documents the proposed vault API. This README describes the app and connection options.

The browser terminal is currently a simulation, not an SSH connection. The planned API will connect clients to encrypted vault storage in Neon, with encryption and decryption performed in the local client. An SSH-hosted client would perform those operations on the SSH server instead.
