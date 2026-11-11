import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { AudioReportDto } from '@/api/types';
import { analysisError, audioTime, candidateCounts, candidateTime, isAnalysing, isAudioFile } from './audioAnalysis.ts';

const report: AudioReportDto = {
  durationMs: 75000, wordCount: 100, wordsPerMinute: 80,
  transcript: [{ id: 1, startMs: 12000, endMs: 16000, text: 'Ну, начнём' }],
  pauses: [], candidates: [{ type: 'filler', text: 'ну', segmentId: 1 }],
};

describe('audio files and states', () => {
  it('offers speech analysis only for supported audio extensions', () => {
    for (const name of ['talk.MP3', 'take.wav', 'seminar.ogg', 'rehearsal.M4A']) assert.equal(isAudioFile(name), true);
    for (const name of ['slides.pdf', 'video.mp4', 'file.mp3.exe', 'mp3']) assert.equal(isAudioFile(name), false);
  });
  it('keeps polling only while a job can still produce a result', () => {
    assert.equal(isAnalysing('QUEUED'), true);
    assert.equal(isAnalysing('RUNNING'), true);
    assert.equal(isAnalysing('SUCCEEDED'), false);
    assert.equal(isAnalysing('FAILED'), false);
  });
  it('gives a useful action for an expired job and a fallback for a future code', () => {
    assert.match(analysisError('LEASE_EXPIRED'), /ещё раз/);
    assert.match(analysisError('FUTURE_CODE'), /Попробуйте/);
  });
});

describe('saved report compatibility', () => {
  it('seeks to the word timestamp, including zero', () => {
    assert.equal(candidateTime({ ...report.candidates[0], startMs: 0 }, report), 0);
    assert.equal(candidateTime({ ...report.candidates[0], startMs: 14320 }, report), 14320);
  });
  it('falls back to the segment for a legacy or invalid word timestamp', () => {
    assert.equal(candidateTime(report.candidates[0], report), 12000);
    assert.equal(candidateTime({ ...report.candidates[0], startMs: NaN }, report), 12000);
    assert.equal(candidateTime({ ...report.candidates[0], startMs: -1 }, report), 12000);
  });
  it('does not invent a seek position when a segment is missing', () => {
    assert.equal(candidateTime({ ...report.candidates[0], segmentId: 99 }, report), undefined);
  });
  it('counts findings without requiring version 2 summaries', () => {
    assert.deepEqual(candidateCounts(report), { filler: 1, repeat: 0, hesitation: 0 });
    assert.deepEqual(candidateCounts({ ...report, candidates: [] }), { filler: 0, repeat: 0, hesitation: 0 });
  });
  it('formats recording offsets independently of time zone', () => {
    assert.equal(audioTime(0), '0:00');
    assert.equal(audioTime(65432), '1:05');
    assert.equal(audioTime(3600000), '60:00');
    assert.equal(audioTime(-1000), '0:00');
    assert.equal(audioTime(NaN), '0:00');
  });
});
