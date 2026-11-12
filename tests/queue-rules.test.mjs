import test from 'node:test';
import assert from 'node:assert/strict';
import { canTransition, dayRangeUTC, ticketNumber, estimateWait } from '../lib/queue-rules.ts';

test('somente estados válidos podem avançar', () => {
  assert.equal(canTransition('WAITING', 'call'), true);
  assert.equal(canTransition('CALLED', 'start'), true);
  assert.equal(canTransition('IN_SERVICE', 'complete'), true);
  assert.equal(canTransition('WAITING', 'cancel'), true);
  assert.equal(canTransition('COMPLETED', 'call'), false);
  assert.equal(canTransition('IN_SERVICE', 'cancel'), false);
  assert.equal(canTransition('WAITING', 'complete'), false);
});
test('senhas sequenciais são formatadas corretamente', () => {
  assert.equal(ticketNumber(1, 'ATD'), 'ATD-001');
  assert.equal(ticketNumber(14, 'LAB'), 'LAB-014');
  assert.equal(ticketNumber(1001, 'ATD'), 'ATD-1001');
  assert.throws(() => ticketNumber(0, 'ATD'));
  assert.throws(() => ticketNumber(1, 'a'));
});
test('a estimativa usa as pessoas aguardando à frente', () => {
  assert.equal(estimateWait(3, 10), 30);
  assert.equal(estimateWait(0, 10), 0);
  assert.throws(() => estimateWait(-1, 10));
});
test('a sequência diária usa limites UTC consistentes', () => {
  const { start, end } = dayRangeUTC(new Date('2026-11-12T23:59:59Z'));
  assert.equal(start.toISOString(), '2026-11-12T00:00:00.000Z');
  assert.equal(end.toISOString(), '2026-11-13T00:00:00.000Z');
});
