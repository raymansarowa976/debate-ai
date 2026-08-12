import secrets

# Crockford-ish alphabet with ambiguous characters (0/1/l/o/i) removed so
# shared slugs are easy to read aloud/type and hard to confuse with each other.
SLUG_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz"
SLUG_GROUP_LENGTH = 3
SLUG_GROUP_COUNT = 3
SLUG_PATTERN = r"[a-z0-9]{3}-[a-z0-9]{3}-[a-z0-9]{3}"


def generate_share_slug() -> str:
    """Generate a random, non-enumerable slug like 'mj8-q2p-x9k'."""
    groups = (
        "".join(secrets.choice(SLUG_ALPHABET) for _ in range(SLUG_GROUP_LENGTH))
        for _ in range(SLUG_GROUP_COUNT)
    )
    return "-".join(groups)


class HashSlugConverter:
    """URL path converter restricting matches to the share-slug format."""

    regex = SLUG_PATTERN

    def to_python(self, value: str) -> str:
        return value

    def to_url(self, value: str) -> str:
        return value
