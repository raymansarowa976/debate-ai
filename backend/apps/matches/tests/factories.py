import factory
from django.contrib.auth import get_user_model

from apps.matches.models import Match, MatchStatus, Message, Round, SenderType, Stance


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = get_user_model()

    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.Sequence(lambda n: f"user{n}@example.com")


class MatchFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Match

    user = factory.SubFactory(UserFactory)
    topic = factory.Sequence(lambda n: f"Topic {n}")
    status = MatchStatus.INITIALIZED
    user_stance = Stance.FOR


class RoundFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Round

    match = factory.SubFactory(MatchFactory)
    round_number = 1


class MessageFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Message

    round = factory.SubFactory(RoundFactory)
    match = factory.SelfAttribute("round.match")
    sender = SenderType.USER
    content = factory.LazyFunction(lambda: " ".join(["word"] * 60))
