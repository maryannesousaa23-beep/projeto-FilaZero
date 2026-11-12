/** Regras puras da fila: fáceis de auditar e testar sem um banco externo. */
export type QueueState = 'WAITING' | 'CALLED' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED';
export type QueueOperation = 'call' | 'start' | 'complete' | 'cancel';

export function canTransition(from: QueueState, operation: QueueOperation): boolean {
  const expected: Record<QueueOperation, QueueState> = {
    call: 'WAITING', start: 'CALLED', complete: 'IN_SERVICE', cancel: 'WAITING',
  };
  return from === expected[operation];
}

export function dayRangeUTC(now: Date): { start: Date; end: Date } {
  if (Number.isNaN(now.getTime())) throw new Error('Data inválida');
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export function ticketNumber(sequence: number, prefix: string): string {
  if (!Number.isSafeInteger(sequence) || sequence < 1) throw new Error('Sequência inválida');
  if (!/^[A-Z]{2,5}$/.test(prefix)) throw new Error('Prefixo inválido');
  return `${prefix}-${String(sequence).padStart(3, '0')}`;
}

export function estimateWait(ahead: number, averageMinutes: number): number {
  if (!Number.isInteger(ahead) || ahead < 0 || !Number.isInteger(averageMinutes) || averageMinutes < 1) {
    throw new Error('Parâmetros de estimativa inválidos');
  }
  return ahead * averageMinutes;
}
