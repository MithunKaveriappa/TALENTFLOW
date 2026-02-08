def is_personal_email(email: str) -> bool:
    personal_domains = [
        "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", 
        "icloud.com", "me.com", "live.com", "aol.com"
    ]
    domain = email.split("@")[-1].lower()
    return domain in personal_domains
