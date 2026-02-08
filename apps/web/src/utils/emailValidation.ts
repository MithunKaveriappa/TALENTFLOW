export const PERSONAL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "me.com",
  "msn.com",
  "live.com",
  "aol.com",
  "zoho.com",
  "protonmail.com",
  "proton.me",
  "yandex.com",
  "mail.com",
  "gmx.com",
  "rediffmail.com",
  "rocketmail.com",
  "tutanota.com",
  "fastmail.com",
  "hushmail.com",
];

export const isPersonalEmail = (email: string): boolean => {
  const domain = email.split("@")[1]?.toLowerCase();
  return PERSONAL_DOMAINS.includes(domain);
};

export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const extractNameFromEmail = (email: string): string => {
  const prefix = email.split("@")[0];
  // Remove all non-letters (numbers, special chars)
  const lettersOnly = prefix.replace(/[^a-zA-Z._-]/g, "");

  return lettersOnly
    .split(/[._-]/)
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};
