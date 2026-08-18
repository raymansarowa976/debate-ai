"use client";

import { useEffect, useState } from "react";
import { buildGradingSocketUrl, parseGradingEvent, type GradingEventName } from "./gradingEvents";

export function useGradingEvents(matchId: string, enabled: boolean): GradingEventName[] {
  const [events, setEvents] = useState<GradingEventName[]>([]);
  const [trackedMatchId, setTrackedMatchId] = useState(matchId);

  // Reset accumulated events when the match changes, following React's
  // "adjusting state during rendering" pattern instead of a setState-in-effect.
  if (matchId !== trackedMatchId) {
    setTrackedMatchId(matchId);
    setEvents([]);
  }

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const socket = new WebSocket(buildGradingSocketUrl(matchId));

    socket.onmessage = (message) => {
      const parsed = parseGradingEvent(message.data);
      if (!parsed) {
        return;
      }
      setEvents((previous) =>
        previous.includes(parsed.event) ? previous : [...previous, parsed.event]
      );
    };

    return () => {
      socket.close();
    };
  }, [matchId, enabled]);

  return events;
}
