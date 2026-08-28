import pytest
from pydantic import ValidationError

from apps.evaluations.ai.schemas import ScorecardSchema


def _valid_payload():
    return {
        "logic": 80,
        "evidence": 75,
        "rhetoric": 60,
        "adherence": 90,
        "fallacies_detected": [
            {"type": "strawman", "explanation": "Misrepresented the opponent's claim."}
        ],
    }


def test_parses_a_valid_payload():
    scorecard = ScorecardSchema.model_validate(_valid_payload())

    assert scorecard.logic == 80
    assert scorecard.evidence == 75
    assert scorecard.rhetoric == 60
    assert scorecard.adherence == 90
    assert scorecard.fallacies_detected[0].type == "strawman"
    assert (
        scorecard.fallacies_detected[0].explanation
        == "Misrepresented the opponent's claim."
    )


def test_accepts_an_empty_fallacies_list():
    payload = _valid_payload()
    payload["fallacies_detected"] = []

    scorecard = ScorecardSchema.model_validate(payload)

    assert scorecard.fallacies_detected == []


def test_parses_a_valid_json_string():
    import json

    scorecard = ScorecardSchema.model_validate_json(json.dumps(_valid_payload()))

    assert scorecard.logic == 80


def test_rejects_malformed_json_text():
    with pytest.raises(ValidationError):
        ScorecardSchema.model_validate_json("{not valid json")


@pytest.mark.parametrize("field", ["logic", "evidence", "rhetoric", "adherence"])
def test_rejects_a_string_instead_of_an_integer_score(field):
    payload = _valid_payload()
    payload[field] = "eighty"

    with pytest.raises(ValidationError):
        ScorecardSchema.model_validate(payload)


@pytest.mark.parametrize("field", ["logic", "evidence", "rhetoric", "adherence"])
def test_rejects_a_float_instead_of_a_strict_integer_score(field):
    payload = _valid_payload()
    payload[field] = 85.5

    with pytest.raises(ValidationError):
        ScorecardSchema.model_validate(payload)


@pytest.mark.parametrize("field", ["logic", "evidence", "rhetoric", "adherence"])
def test_rejects_a_score_below_zero(field):
    payload = _valid_payload()
    payload[field] = -1

    with pytest.raises(ValidationError):
        ScorecardSchema.model_validate(payload)


@pytest.mark.parametrize("field", ["logic", "evidence", "rhetoric", "adherence"])
def test_rejects_a_score_above_one_hundred(field):
    payload = _valid_payload()
    payload[field] = 101

    with pytest.raises(ValidationError):
        ScorecardSchema.model_validate(payload)


@pytest.mark.parametrize(
    "field", ["logic", "evidence", "rhetoric", "adherence", "fallacies_detected"]
)
def test_rejects_a_missing_required_field(field):
    payload = _valid_payload()
    del payload[field]

    with pytest.raises(ValidationError):
        ScorecardSchema.model_validate(payload)


def test_rejects_a_fallacy_entry_missing_its_explanation():
    payload = _valid_payload()
    payload["fallacies_detected"] = [{"type": "strawman"}]

    with pytest.raises(ValidationError):
        ScorecardSchema.model_validate(payload)


def test_rejects_fallacies_detected_that_is_not_a_list():
    payload = _valid_payload()
    payload["fallacies_detected"] = {"type": "strawman", "explanation": "..."}

    with pytest.raises(ValidationError):
        ScorecardSchema.model_validate(payload)
