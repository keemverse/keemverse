// Digital Craft launch gate.
//
// null  = launch date not chosen yet. The page shows a calm "opening soon"
//         message with no countdown, and the designs grid stays hidden.
// ISO   = e.g. '2026-12-01T10:00:00+01:00'. The page shows a live countdown,
//         and when the time passes the designs grid appears by itself.
//
// Set this one value when the system is ready to operate. Nothing else
// needs to change.
export const DIGITAL_CRAFT_LAUNCH_AT: string | null = null;
