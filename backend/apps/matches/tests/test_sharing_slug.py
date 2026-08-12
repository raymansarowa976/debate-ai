import re

from apps.matches.sharing import SLUG_PATTERN, generate_share_slug

FULL_MATCH_PATTERN = re.compile(rf"^{SLUG_PATTERN}$")


def test_generate_share_slug_matches_dash_grouped_hash_format():
    slug = generate_share_slug()

    assert FULL_MATCH_PATTERN.match(slug), f"{slug!r} does not match expected format"


def test_generate_share_slug_excludes_ambiguous_characters():
    # 0/1/l/o/i are excluded so shared slugs aren't confusable when read aloud.
    slug = generate_share_slug()

    assert not any(char in slug for char in "01loi")


def test_generate_share_slug_is_not_sequential_or_predictable():
    slugs = [generate_share_slug() for _ in range(50)]

    # Non-enumerable: every generated slug is unique across a reasonably sized sample.
    assert len(set(slugs)) == len(slugs)
