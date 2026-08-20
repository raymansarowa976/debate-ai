from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


class GradingEvent:
    JUDGE_START = "JUDGE_START"
    LOGIC_EVALUATED = "LOGIC_EVALUATED"
    FINAL_COMPILATION = "FINAL_COMPILATION"


def grading_group_name(match_id) -> str:
    return f"grading_{match_id}"


def publish_grading_event(match_id, event: str) -> None:
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return

    async_to_sync(channel_layer.group_send)(
        grading_group_name(match_id),
        {"type": "grading.status", "event": event},
    )
