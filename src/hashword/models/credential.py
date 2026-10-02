from dataclasses import dataclass

@dataclass
class Credential:
    organization: str
    username: str
    password: str
    url: str = ""
    notes: str = ""
