---
name: Simulated async lifecycles must not be cleared on modal close
description: Demo "request -> owner confirms -> chat" style flows use setTimeout; don't tie the timer to dialog visibility
---

Demo flows that simulate an async backend response (e.g. Quick Book "you dropped a request" -> after a delay "owner confirmed your request" -> reveal chat) use a `setTimeout` to fake the confirmation.

**Rule:** Do NOT clear that pending timer in the dialog/modal `onOpenChange` close handler. A user closing the modal while waiting must still receive the confirmation (notification + toast + stage change).

**Why:** A reset-on-close that clears the timer silently drops the confirmation for the common "close and wait" path, breaking the requested lifecycle. Caught in code review.

**How to apply:** Only reset form state + clear the timer when no request is in flight (stage === "form"/"confirmed"); keep the timer alive while stage === "dropped"/pending. Fire the confirmation regardless of modal visibility.
