# Epic 3 will add a consumer here, reachable at /api/ws/matches/<uuid:match_id>/
# (matching the nginx /api/ws/ upstream prefix, since proxy_pass without a URI
# preserves the incoming path).
websocket_urlpatterns = []
