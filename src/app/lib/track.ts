// Funnel tracking: anonymous events sent to /api/event in small batches.
//
// What is recorded: a random id that lasts for one visit (kept in
// sessionStorage), the page, the event name, the look or item involved, and the
// traffic source and campaign from the link's utm_ tags. What is NEVER
// recorded: names, emails, or anything typed into a form. Visitors who have
// Do Not Track switched on are not tracked, and nothing is sent from local
// development or preview URLs. A failure here can never affect the page.

type EventName =
  | 'page'
  | 'cta'
  | 'look_pick'
  | 'look_open'
  | 'pack_click'
  | 'freelook_view'
  | 'freelook_submit'
  | 'buy_click'
  | 'checkout_view'
  | 'pay_start'
  | 'pay_success'
  | 'brand_click'
  | 'social_click';

type Pending = { t: number; name: EventName; path: string; item: string; detail: string; source: string; campaign: string };

const queue: Pending[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let sid = '';
let campaign = { source: '', campaign: '' };

const enabled = () =>
  typeof window !== 'undefined' &&
  /(^|\.)keemverse\.com$/.test(window.location.hostname) &&
  navigator.doNotTrack !== '1';

function visitId(): string {
  if (sid) return sid;
  try {
    sid = sessionStorage.getItem('kv_sid') || '';
    if (!sid) {
      sid = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
      sessionStorage.setItem('kv_sid', sid);
    }
  } catch {
    sid = Math.random().toString(36).slice(2, 12);
  }
  return sid;
}

/** The first utm_ tags seen in a visit stay with every later event of that visit. */
function readCampaign() {
  try {
    const stored = sessionStorage.getItem('kv_utm');
    if (stored) {
      campaign = JSON.parse(stored);
      return;
    }
    const q = new URLSearchParams(window.location.search);
    const found = { source: q.get('utm_source') || '', campaign: q.get('utm_campaign') || '' };
    if (found.source || found.campaign) {
      campaign = found;
      sessionStorage.setItem('kv_utm', JSON.stringify(found));
    }
  } catch {
    /* private window: events just carry no campaign */
  }
}

function flush() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (queue.length === 0) return;
  const events = queue.splice(0, 25);
  let region = 'ROW';
  try {
    region = sessionStorage.getItem('kv_region') === 'NG' ? 'NG' : 'ROW';
  } catch {
    /* default */
  }
  const body = JSON.stringify({ sid: visitId(), region, events });
  try {
    if (navigator.sendBeacon && navigator.sendBeacon('/api/event', new Blob([body], { type: 'text/plain' }))) return;
    void fetch('/api/event', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body, keepalive: true });
  } catch {
    /* tracking must never bother a visitor */
  }
}

/** The utm source and campaign this visit arrived with (empty when none). */
export function getCampaign() {
  readCampaign();
  return { ...campaign };
}

export function track(name: EventName, info: { item?: string; detail?: string } = {}) {
  if (!enabled()) return;
  readCampaign();
  queue.push({
    t: Date.now(),
    name,
    path: window.location.pathname,
    item: info.item ?? '',
    detail: info.detail ?? '',
    source: campaign.source,
    campaign: campaign.campaign,
  });
  if (queue.length >= 10) flush();
  else if (!timer) timer = setTimeout(flush, 6000);
}

// Send whatever is waiting when the visitor leaves or switches away.
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}
