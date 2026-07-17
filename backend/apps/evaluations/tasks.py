from celery import shared_task


@shared_task
def evaluate_match_task(match_id):
    # Scoring logic lands in a follow-up issue; this task is the dispatch target for now.
    pass
