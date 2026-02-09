def is_personal_email(email: str) -> bool:
    personal_domains = [
        "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com",
        "me.com", "msn.com", "live.com", "aol.com", "zoho.com",
        "protonmail.com", "proton.me", "yandex.com", "mail.com", "gmx.com",
        "rediffmail.com", "rocketmail.com", "tutanota.com", "fastmail.com", "hushmail.com"
    ]
    domain = email.split("@")[-1].lower()
    return domain in personal_domains
