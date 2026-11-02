# Vault architecture

The local `vaultCrypto.ts` module and its Argon2 dependency have been removed.
The CLI authenticates through the website API with the user's account password.
There is no separate vault master password or CLI encryption format.

Vault storage is not implemented. Authentication opens a placeholder vault
screen; it does not load or save entries. Before implementing storage, choose
how the backend will protect saved secrets using a maintained service or library.
The backend must verify the session and scope every vault request to its owner.
