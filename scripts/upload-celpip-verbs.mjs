import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { makeGapQuestion } from '../lib/test-helpers.ts';

// Dry-run by default. Use --write to create this reviewed dataset; never replaces a published plan.
const args = process.argv.slice(2);
assert(args.every(arg => arg === '--write'), 'Only --write is supported.');
const input = await readFile(new URL('../output/celpip/celpip-verbs-prepositions.json', import.meta.url), 'utf8');
const { entries, ...metadata } = JSON.parse(input);
assert.equal(metadata.id, 'celpip-core-verbs-prepositions');
assert.equal(metadata.entryCount, entries.length);
assert.equal(new Set(entries.map(e => e.id)).size, entries.length);
assert.equal(new Set(entries.map(e => e.lemma)).size, entries.length);
assert.equal(metadata.source.pageCount, 249);
assert.deepEqual(metadata.verification.missingExplicitVerbUnitHeadwords, []);
for (const entry of entries) {
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id), entry.id);
  assert(entry.term && entry.englishDefinition && entry.chineseMeanings.length);
  assert.equal(entry.examples.length, 2);
  assert(entry.examples.every(e => e.english && e.chinese));
  assert(entry.examples.some(e => makeGapQuestion(e.english, entry.term).sentence !== e.english), `Unusable gap exercise: ${entry.term}`);
  assert(entry.sourcePages.length && entry.sourcePages.every(p => Number.isInteger(p) && p >= 1 && p <= 249));
  assert(entry.patterns.length && entry.patterns.every(p => p.pattern && Array.isArray(p.prepositions) && Array.isArray(p.particles)));
  assert(entry.prepositions.every(p => entry.patterns.some(pattern => pattern.prepositions.includes(p))));
  assert(entry.lemma !== 'instead');
}
const contentSha256 = createHash('sha256').update(input).digest('hex');
console.log(JSON.stringify({ validatedEntries: entries.length, contentSha256, mode: args.includes('--write') ? 'upload' : 'dry-run' }));
if (!args.includes('--write')) process.exit(0);
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
assert.equal(projectId, 'english-learning-ac047', 'Unexpected destination project.');
const db = getFirestore(initializeApp({ credential: applicationDefault(), projectId }));
const ref = db.collection('learningPlans').doc(metadata.id);
const plan = { ...metadata, contentSha256 };
const previous = await ref.get();
if (previous.exists) {
  assert.equal(previous.data().contentSha256, contentSha256, 'A different dataset already exists; refusing to overwrite it.');
} else {
  await ref.create({ ...plan, published: false });
}
if (!previous.exists || !previous.data().published) {
  for (let start = 0; start < entries.length; start += 400) {
    const batch = db.batch();
    for (const entry of entries.slice(start, start + 400)) batch.set(ref.collection('entries').doc(entry.id), entry);
    await batch.commit();
  }
}
const uploaded = await ref.collection('entries').get();
assert.equal(uploaded.size, entries.length);
const actual = new Map(uploaded.docs.map(d => [d.id, d.data()]));
for (const entry of entries) assert.deepEqual(actual.get(entry.id), entry, `Read-back mismatch: ${entry.id}`);
if (!previous.exists || !previous.data().published) await ref.set(plan);
assert.deepEqual((await ref.get()).data(), plan);
console.log(JSON.stringify({ projectId, path: ref.path, published: true, verifiedEntries: uploaded.size, contentSha256 }));
