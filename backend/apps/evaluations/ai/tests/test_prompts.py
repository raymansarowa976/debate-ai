from apps.evaluations.ai.prompts import ANTI_CONCILIATION_CLAUSE, build_system_prompt
from apps.matches.models import Stance


def test_prompt_includes_the_topic():
    prompt = build_system_prompt("Should AI write laws?", Stance.FOR)

    assert "Should AI write laws?" in prompt


def test_prompt_includes_the_anti_conciliation_clause():
    prompt = build_system_prompt("Should AI write laws?", Stance.FOR)

    assert ANTI_CONCILIATION_CLAUSE in prompt


def test_for_and_against_prompts_differ():
    for_prompt = build_system_prompt("Should AI write laws?", Stance.FOR)
    against_prompt = build_system_prompt("Should AI write laws?", Stance.AGAINST)

    assert for_prompt != against_prompt


def test_for_prompt_directs_the_model_to_argue_in_favor():
    prompt = build_system_prompt("Should AI write laws?", Stance.FOR)

    assert "IN FAVOR of" in prompt


def test_against_prompt_directs_the_model_to_argue_against():
    prompt = build_system_prompt("Should AI write laws?", Stance.AGAINST)

    assert "AGAINST" in prompt
    assert "IN FAVOR of" not in prompt
