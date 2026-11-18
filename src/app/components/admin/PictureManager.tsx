import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpRight, Eye, EyeOff, ImageUp, Lock, Trash2, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { AdminShell } from '../AdminShell';
import { useAdminAuth } from '../../lib/useAdminAuth';
import {
  GALLERY_KINDS,
  createGalleryItem,
  deleteGalleryItem,
  fetchGallery,
  preparePhoto,
  reorderGallery,
  replaceGalleryPicture,
  updateGalleryItem,
  type GalleryItem,
  type PictureSet,
} from '../../lib/galleryApi';

// One manager, three separate places. Each set is its own list on the server, so
// changing a picture in one can never change another:
//   gallery  the Gallery page
//   home     the story pictures on the main page (and the For brands page)
//   packs    the rate cards on the For brands page (one fixed picture per package)
// Every page says at the top which one you are editing and where it shows.

export type SetConfig = {
  set: PictureSet;
  /** Short name used in the switcher and the page heading. */
  name: string;
  /** Where it shows on the live site, in plain words. */
  where: string;
  /** Link to look at the live place. */
  viewHref: string;
  /** The list is fixed (rate cards): replace and crop only. */
  fixed?: boolean;
  /** Width / height of the picture frame on the live site, so the crop preview matches. */
  previewRatio: string;
  /** Plain explanation shown under the heading. */
  help: string;
};

export const SETS: Record<PictureSet, SetConfig> = {
  gallery: {
    set: 'gallery',
    name: 'Gallery',
    where: 'the Gallery page (keemverse.com/gallery)',
    viewHref: '/gallery',
    previewRatio: '3 / 4',
    help: 'Add, hide, reorder or delete the photos on the Gallery page. This does not change the main page or the rate cards.',
  },
  home: {
    set: 'home',
    name: 'Main page',
    where: 'the main page and the top of For brands: the first 4 visible pictures, in this order',
    viewHref: '/',
    previewRatio: '4 / 5',
    help: 'These four story pictures are the ones people see first. The first 4 visible ones, in this order, are shown. This does not change the Gallery or the rate cards.',
  },
  packs: {
    set: 'packs',
    name: 'Rate cards',
    where: 'the package cards on the For brands page (keemverse.com/brands)',
    viewHref: '/brands',
    fixed: true,
    previewRatio: '5 / 4',
    help: 'One picture for each package. Replace a picture or change how it is cropped. Package names and prices are not edited here, and this does not change the Gallery or the main page.',
  },
};

const ORDER: PictureSet[] = ['gallery', 'home', 'packs'];

const FOCUS = ['0% 0%', '50% 0%', '100% 0%', '0% 50%', '50% 50%', '100% 50%', '0% 100%', '50% 100%', '100% 100%'];
const FOCUS_NAMES = ['top left', 'top', 'top right', 'left', 'centre', 'right', 'bottom left', 'bottom', 'bottom right'];

const field =
  'w-full rounded-md border border-input bg-input-background px-3 py-2 text-base outline-none transition-[box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm';

function niceTitle(filename: string) {
  const base = filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : 'Untitled';
}

type Saving = 'idle' | 'saving' | 'saved' | 'error';

export default function PictureManager({ config }: { config: SetConfig }) {
  const { set, fixed } = config;
  const { secret, unlocked, checking, error, role, checkSecret } = useAdminAuth({ allowEditor: true });
  const [secretInput, setSecretInput] = useState('');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [status, setStatus] = useState<Saving>('idle');
  const [message, setMessage] = useState('');

  const [rights, setRights] = useState(false);
  const [uploadKind, setUploadKind] = useState(GALLERY_KINDS[0]);
  const [uploading, setUploading] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const all = await fetchGallery(secret, set);
      setItems([...all].sort((a, b) => a.order - b.order));
    } catch (e: any) {
      setLoadError(e.message || 'Could not load the pictures');
    } finally {
      setLoading(false);
    }
  }, [secret, set]);

  useEffect(() => {
    if (unlocked) load();
  }, [unlocked, load]);

  const flash = (s: Saving, text = '') => {
    setStatus(s);
    setMessage(text);
    if (s === 'saved') window.setTimeout(() => setStatus((cur) => (cur === 'saved' ? 'idle' : cur)), 1800);
  };

  const patch = async (id: string, change: Partial<GalleryItem>) => {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, ...change } : i)));
    flash('saving');
    try {
      const updated = await updateGalleryItem(secret, id, change, set);
      setItems((list) => list.map((i) => (i.id === id ? { ...i, ...updated } : i)));
      flash('saved');
    } catch (e: any) {
      flash('error', e.message);
      load();
    }
  };

  const replacePicture = async (id: string, file: File | undefined) => {
    if (!file) return;
    flash('saving', 'Replacing the picture…');
    try {
      const prepared = await preparePhoto(file);
      const updated = await replaceGalleryPicture(secret, id, prepared, set);
      setItems((list) => list.map((i) => (i.id === id ? { ...i, ...updated } : i)));
      flash('saved');
    } catch (e: any) {
      flash('error', e.message);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const to = index + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[index], next[to]] = [next[to], next[index]];
    const numbered = next.map((i, n) => ({ ...i, order: n + 1 }));
    setItems(numbered);
    flash('saving');
    try {
      await reorderGallery(secret, numbered.map((i) => i.id), set);
      flash('saved');
    } catch (e: any) {
      flash('error', e.message);
      load();
    }
  };

  const remove = async (id: string) => {
    setItems((list) => list.filter((i) => i.id !== id));
    flash('saving');
    try {
      await deleteGalleryItem(secret, id, set);
      flash('saved');
    } catch (e: any) {
      flash('error', e.message);
      load();
    }
  };

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    let done = 0;
    for (const file of list) {
      setUploading(`Adding ${done + 1} of ${list.length}…`);
      try {
        const prepared = await preparePhoto(file);
        const created = await createGalleryItem(
          secret,
          { title: niceTitle(file.name), kind: uploadKind, visible: true, featured: false, position: '50% 50%', ...prepared },
          set
        );
        setItems((cur) => [...cur, created]);
        done++;
      } catch (e: any) {
        flash('error', `${file.name}: ${e.message}`);
        break;
      }
    }
    setUploading('');
    if (done === list.length) flash('saved');
    if (fileRef.current) fileRef.current.value = '';
  };

  if (!unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
        <div className="glass w-full max-w-sm space-y-4 rounded-3xl p-8">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-foreground text-background">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <p className="eyebrow text-amber-ink">KEEMVERSE</p>
            <h1 className="mt-1 text-display-md">{config.name}</h1>
          </div>
          <Input
            type="password"
            placeholder="Admin or editor secret"
            value={secretInput}
            onChange={(e) => setSecretInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkSecret(secretInput)}
          />
          <Button className="w-full" onClick={() => checkSecret(secretInput)} disabled={checking}>
            {checking ? 'Checking…' : 'Unlock'}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <AdminShell
      role={role}
      eyebrow="Pictures"
      title={config.name}
      description={config.help}
      actions={
        <span
          role="status"
          aria-live="polite"
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
            status === 'error' ? 'border-destructive text-destructive' : 'border-border text-muted-foreground'
          }`}
        >
          {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : status === 'error' ? 'Not saved' : 'Auto-saves'}
        </span>
      }
    >
      <nav aria-label="Which pictures" className="mb-4 flex flex-wrap gap-2">
        {ORDER.map((key) => {
          const on = key === set;
          return (
            <Link
              key={key}
              to={key === 'gallery' ? '/admin/gallery' : key === 'home' ? '/admin/home-pictures' : '/admin/rate-cards'}
              aria-current={on ? 'page' : undefined}
              className={`press inline-flex h-11 items-center rounded-full border px-5 text-sm font-semibold ${
                on ? 'border-transparent bg-foreground text-background' : 'border-border text-foreground/80 hover:text-foreground'
              }`}
            >
              {SETS[key].name}
            </Link>
          );
        })}
      </nav>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-ink/40 bg-card px-4 py-3 text-sm">
        <p>
          <span className="font-semibold">You are editing: {config.name}.</span>{' '}
          <span className="text-muted-foreground">It shows on {config.where}.</span>
        </p>
        <a
          href={config.viewHref}
          target="_blank"
          rel="noopener noreferrer"
          className="press inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 font-medium"
        >
          See it live <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>

      {status === 'error' && message && <p className="mb-4 text-sm text-destructive">{message}</p>}

      {!fixed && (
        <section aria-label="Add photos" className="glass rounded-3xl p-5 md:p-6">
          <h2 className="text-lg font-medium">Add photos to {config.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick one or many. Any photo format works: it is turned into a web-sized picture and a small thumbnail for you.
          </p>

          <label className="mt-4 flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={rights}
              onChange={(e) => setRights(e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-[var(--foreground)]"
            />
            <span>I have the right to use these photos, and the people in them agreed to be shown.</span>
          </label>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Type
              <select
                value={uploadKind}
                onChange={(e) => setUploadKind(e.target.value)}
                className="h-10 rounded-md border border-input bg-input-background px-3 text-base text-foreground md:text-sm"
              >
                {GALLERY_KINDS.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              id="picture-upload"
              onChange={(e) => upload(e.target.files)}
              disabled={!rights || !!uploading}
            />
            <label
              htmlFor="picture-upload"
              aria-disabled={!rights || !!uploading}
              className={`press inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background ${
                !rights || uploading ? 'pointer-events-none opacity-40' : 'cursor-pointer'
              }`}
            >
              <Upload className="h-4 w-4" /> {uploading || 'Choose photos'}
            </label>
            {!rights && <span className="text-xs text-muted-foreground">Tick the box first.</span>}
          </div>
        </section>
      )}

      <section aria-label={`${config.name} pictures`} className={fixed ? '' : 'mt-8'}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-medium">
            {items.length} picture{items.length === 1 ? '' : 's'} in {config.name}
          </h2>
          {set === 'home' && (
            <p className="text-sm text-muted-foreground">Only the first 4 visible ones show on the live site.</p>
          )}
        </div>

        {loading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
        {loadError && <p className="mt-6 text-sm text-destructive">{loadError}</p>}

        <ul className="mt-4 grid gap-4">
          {items.map((item, index) => (
            <PhotoCard
              key={item.id}
              config={config}
              item={item}
              index={index}
              last={index === items.length - 1}
              live={set !== 'home' || items.filter((i) => i.visible).findIndex((i) => i.id === item.id) < 4}
              onPatch={(change) => patch(item.id, change)}
              onReplace={(file) => replacePicture(item.id, file)}
              onMove={(dir) => move(index, dir)}
              onDelete={() => remove(item.id)}
            />
          ))}
        </ul>
      </section>
    </AdminShell>
  );
}

function PhotoCard({
  config,
  item,
  index,
  last,
  live,
  onPatch,
  onReplace,
  onMove,
  onDelete,
}: {
  config: SetConfig;
  item: GalleryItem;
  index: number;
  last: boolean;
  live: boolean;
  onPatch: (change: Partial<GalleryItem>) => void;
  onReplace: (file: File | undefined) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  const fixed = !!config.fixed;
  const [title, setTitle] = useState(item.title);
  const [note, setNote] = useState(item.note);
  const [credit, setCredit] = useState(item.credit);
  const [href, setHref] = useState(item.href);
  const [confirm, setConfirm] = useState(false);
  const [linkError, setLinkError] = useState('');
  const replaceId = `replace-${config.set}-${item.id}`;

  useEffect(() => {
    if (!confirm) return;
    const t = window.setTimeout(() => setConfirm(false), 4000);
    return () => window.clearTimeout(t);
  }, [confirm]);

  const commit = (key: 'title' | 'note' | 'credit', value: string) => {
    const clean = value.trim();
    if (clean === item[key]) return;
    if (key === 'title' && !clean) {
      setTitle(item.title);
      return;
    }
    onPatch({ [key]: clean } as Partial<GalleryItem>);
  };

  const commitLink = () => {
    const v = href.trim();
    if (v === item.href) return;
    if (v && !(v.startsWith('/') || v.startsWith('https://'))) {
      setLinkError('Start with / (a page on this site) or https://');
      return;
    }
    setLinkError('');
    onPatch({ href: v });
  };

  return (
    <li className={`glass rounded-3xl p-4 md:p-5 ${item.visible ? '' : 'opacity-70'}`}>
      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <div>
          <div className="relative overflow-hidden rounded-2xl bg-muted" style={{ aspectRatio: config.previewRatio }}>
            <img
              src={item.thumbUrl}
              alt={item.title}
              className="h-full w-full object-cover"
              style={{ objectPosition: item.position }}
              loading="lazy"
              draggable={false}
            />
            {!item.visible && (
              <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                Hidden
              </span>
            )}
            {item.visible && config.set === 'home' && (
              <span
                className={`absolute right-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                  live ? 'bg-[#D98E2B] text-[#0F0F11]' : 'bg-black/70 text-white'
                }`}
              >
                {live ? 'On main page' : 'Not shown (past 4)'}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Preview is cropped the way it shows on the live site.
          </p>

          <input
            id={replaceId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              onReplace(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <label
            htmlFor={replaceId}
            className="press mt-3 inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-border px-4 text-sm font-medium"
          >
            <ImageUp className="h-4 w-4" /> Replace picture
          </label>

          <p className="mt-4 text-xs text-muted-foreground">Crop focus: the part that stays in view.</p>
          <div role="radiogroup" aria-label="Crop focus" className="mt-2 grid w-28 grid-cols-3 gap-1">
            {FOCUS.map((pos, n) => {
              const on = item.position === pos;
              return (
                <button
                  key={pos}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={FOCUS_NAMES[n]}
                  onClick={() => onPatch({ position: pos })}
                  className={`h-9 rounded-md border transition-colors ${
                    on ? 'border-transparent bg-foreground' : 'border-border bg-muted hover:bg-accent'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="grid content-start gap-3">
          {fixed ? (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Package</p>
              <p className="mt-1 text-lg font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.kind === 'Posted' ? 'Posted on my pages' : 'Content for the brand'}. The name and price are set in the site code.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
                <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                  Title
                  <input
                    className={field}
                    value={title}
                    maxLength={80}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => commit('title', title)}
                  />
                </label>
                <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                  Type
                  <select
                    className={`${field} h-[42px] py-0`}
                    value={item.kind}
                    onChange={(e) => onPatch({ kind: e.target.value })}
                  >
                    {[...new Set([...GALLERY_KINDS, item.kind])].map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                What is in the photo (one honest line)
                <textarea
                  className={`${field} min-h-[64px] resize-y`}
                  value={note}
                  maxLength={240}
                  onChange={(e) => setNote(e.target.value)}
                  onBlur={() => commit('note', note)}
                />
              </label>

              {config.set === 'gallery' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                    Photo credit (optional)
                    <input
                      className={field}
                      value={credit}
                      maxLength={120}
                      placeholder="Photo: Name"
                      onChange={(e) => setCredit(e.target.value)}
                      onBlur={() => commit('credit', credit)}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                    Link (optional)
                    <input
                      className={field}
                      value={href}
                      maxLength={300}
                      placeholder="/brands or https://…"
                      onChange={(e) => setHref(e.target.value)}
                      onBlur={commitLink}
                      aria-invalid={!!linkError}
                    />
                    {linkError && <span className="text-destructive">{linkError}</span>}
                  </label>
                </div>
              )}

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPatch({ visible: !item.visible })}
                  aria-pressed={!item.visible}
                  className="press inline-flex h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium"
                >
                  {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {item.visible ? 'Visible' : 'Hidden'}
                </button>

                <span className="ml-auto inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onMove(-1)}
                    disabled={index === 0}
                    aria-label={`Move ${item.title} earlier`}
                    className="press grid h-11 w-11 place-items-center rounded-full border border-border disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(1)}
                    disabled={last}
                    aria-label={`Move ${item.title} later`}
                    className="press grid h-11 w-11 place-items-center rounded-full border border-border disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => (confirm ? onDelete() : setConfirm(true))}
                    aria-label={confirm ? `Confirm delete ${item.title}` : `Delete ${item.title}`}
                    className={`press inline-flex h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium ${
                      confirm ? 'border-transparent bg-destructive text-white' : 'border-border text-destructive'
                    }`}
                  >
                    <Trash2 className="h-4 w-4" /> {confirm ? 'Tap again to delete' : 'Delete'}
                  </button>
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </li>
  );
}
