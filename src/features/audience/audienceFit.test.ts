import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { AudienceFitCheckDto, AudienceFitResultDto } from '@/api/types';
import {
  checkLabel,
  checkTone,
  eventTalkKey,
  hasPending,
  isCheckableFile,
  latestBy,
  levelShares,
  newestFirst,
  parseLevels,
  parseLines,
  profileToUpdate,
} from './audienceFit.ts';

function result(verdict: AudienceFitResultDto['verdict'], score: number): AudienceFitResultDto {
  return { verdict, score, summary: null, criteria: [], issues: [], strengths: [], profileConfidence: 'high', truncated: false };
}

function check(overrides: Partial<AudienceFitCheckDto> = {}): AudienceFitCheckDto {
  return {
    id: 'c1',
    eventId: 'e1',
    eventName: 'JPoint',
    speakerId: 1,
    talkId: 't1',
    talkName: 'Loom',
    mediaId: null,
    fileName: null,
    trigger: 'manual',
    status: 'ready',
    message: null,
    result: result('fits', 82),
    createdDate: '2026-11-08T10:00:00',
    updatedDate: '2026-11-08T10:01:00',
    ...overrides,
  };
}

describe('checkLabel and checkTone', () => {
  it('shows the verdict with the score for a ready check', () => {
    assert.equal(checkLabel(check()), 'Подходит · 82/100');
    assert.equal(checkTone(check()), 'brand');
    assert.equal(checkLabel(check({ result: result('partially', 55) })), 'Подходит частично · 55/100');
    assert.equal(checkTone(check({ result: result('partially', 55) })), 'warning');
    assert.equal(checkTone(check({ result: result('not_fits', 20) })), 'danger');
  });

  it('describes unfinished checks', () => {
    assert.equal(checkLabel(check({ status: 'pending', result: null })), 'Проверяется…');
    assert.equal(checkTone(check({ status: 'pending', result: null })), 'ai');
    assert.equal(checkLabel(check({ status: 'insufficient_data', result: null })), 'Мало материала');
    assert.equal(checkLabel(check({ status: 'failed', result: null })), 'Не удалось проверить');
    assert.equal(checkTone(check({ status: 'failed', result: null })), 'muted');
  });
});

describe('latestBy', () => {
  it('keeps the newest check per key and skips checks without a key', () => {
    const old = check({ id: 'old', createdDate: '2026-11-01T10:00:00' });
    const fresh = check({ id: 'fresh', createdDate: '2026-11-08T12:00:00' });
    const otherTalk = check({ id: 'other', talkId: 't2' });
    const noFile = check({ id: 'nofile' });

    const latest = latestBy([old, otherTalk, fresh], (item) => eventTalkKey(item.eventId, item.talkId));
    assert.equal(latest.get('e1:t1')?.id, 'fresh');
    assert.equal(latest.get('e1:t2')?.id, 'other');

    assert.equal(latestBy([noFile], (item) => item.mediaId).size, 0);
  });

  it('sorts newest first without changing the input', () => {
    const input = [check({ id: 'a', createdDate: '2026-01-01T00:00:00' }), check({ id: 'b', createdDate: '2026-02-01T00:00:00' })];
    assert.deepEqual(newestFirst(input).map((item) => item.id), ['b', 'a']);
    assert.equal(input[0].id, 'a');
  });
});

describe('hasPending', () => {
  it('is true while any check is running', () => {
    assert.equal(hasPending([check(), check({ status: 'pending' })]), true);
    assert.equal(hasPending([check()]), false);
    assert.equal(hasPending([]), false);
  });
});

describe('profile helpers', () => {
  it('lists non-zero levels in junior → lead order', () => {
    assert.deepEqual(levelShares({ senior: 60, junior: 10, lead: 0, middle: 30 }), [
      { level: 'junior', label: 'Junior', percent: 10 },
      { level: 'middle', label: 'Middle', percent: 30 },
      { level: 'senior', label: 'Senior', percent: 60 },
    ]);
    assert.deepEqual(levelShares({}), []);
  });

  it('parses multiline lists and level inputs', () => {
    assert.deepEqual(parseLines(' backend \n\n  QA\n'), ['backend', 'QA']);
    assert.deepEqual(parseLevels({ junior: '', middle: '40', senior: '55,5', lead: '-3' }), {
      junior: 0,
      middle: 40,
      senior: 55.5,
      lead: 0,
    });
  });

  it('turns a profile into an editable update', () => {
    const update = profileToUpdate({
      summary: 'Опытные',
      levels: { senior: 100 },
      roles: ['backend'],
      domains: [],
      expectations: [],
      assumedKnowledge: [],
      turnoffs: ['реклама'],
      confidence: 'high',
      evidence: [],
    });
    assert.deepEqual(update.levels, { junior: 0, middle: 0, senior: 100, lead: 0 });
    assert.deepEqual(update.turnoffs, ['реклама']);
    assert.equal(profileToUpdate(null).summary, '');
  });
});

describe('isCheckableFile', () => {
  it('accepts files the backend can read text from', () => {
    for (const name of ['talk.pdf', 'Slides.PPTX', 'speech.docx', 'notes.txt', 'readme.md']) assert.equal(isCheckableFile(name), true, name);
    for (const name of ['old.ppt', 'photo.png', 'demo.mp4', 'pdf']) assert.equal(isCheckableFile(name), false, name);
  });
});
