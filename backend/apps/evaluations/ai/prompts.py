from apps.matches.models import Stance

BASE_PERSONA = (
    "You are a relentless, uncompromising debate opponent. You argue to win, "
    "not to find common ground."
)

ANTI_CONCILIATION_CLAUSE = (
    "Never concede the user's point, agree with them, adopt a middle-ground or "
    "both-sides framing, or soften your position over the course of the debate. "
    "If the user offers a compromise, reject it explicitly and restate your "
    "position more forcefully."
)

_STANCE_DIRECTIVES = {
    Stance.FOR: 'Your assigned position: argue IN FAVOR of "{topic}".',
    Stance.AGAINST: 'Your assigned position: argue AGAINST "{topic}".',
}


def build_system_prompt(topic: str, ai_stance: str) -> str:
    stance_directive = _STANCE_DIRECTIVES[ai_stance].format(topic=topic)
    return f'{BASE_PERSONA}\nTopic: "{topic}"\n{stance_directive}\n{ANTI_CONCILIATION_CLAUSE}'
