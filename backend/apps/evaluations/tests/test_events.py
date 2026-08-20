from unittest.mock import AsyncMock, MagicMock, patch

from apps.evaluations.events import (
    GradingEvent,
    grading_group_name,
    publish_grading_event,
)


def test_grading_group_name_is_namespaced_per_match():
    assert grading_group_name("abc-123") == "grading_abc-123"


def test_grading_event_constants_match_the_spec():
    assert GradingEvent.JUDGE_START == "JUDGE_START"
    assert GradingEvent.LOGIC_EVALUATED == "LOGIC_EVALUATED"
    assert GradingEvent.FINAL_COMPILATION == "FINAL_COMPILATION"


@patch("apps.evaluations.events.get_channel_layer")
def test_publish_grading_event_sends_to_the_matchs_group(mock_get_channel_layer):
    mock_layer = MagicMock()
    mock_layer.group_send = AsyncMock()
    mock_get_channel_layer.return_value = mock_layer

    publish_grading_event("abc-123", GradingEvent.JUDGE_START)

    mock_layer.group_send.assert_awaited_once_with(
        "grading_abc-123",
        {"type": "grading.status", "event": "JUDGE_START"},
    )


@patch("apps.evaluations.events.get_channel_layer")
def test_publish_grading_event_is_a_no_op_without_a_configured_channel_layer(
    mock_get_channel_layer,
):
    mock_get_channel_layer.return_value = None

    publish_grading_event("abc-123", GradingEvent.JUDGE_START)
