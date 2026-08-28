from apps.matches.models import Match, Stance


def test_ai_stance_is_against_when_user_stance_is_for():
    match = Match(user_stance=Stance.FOR)

    assert match.ai_stance == Stance.AGAINST


def test_ai_stance_is_for_when_user_stance_is_against():
    match = Match(user_stance=Stance.AGAINST)

    assert match.ai_stance == Stance.FOR
