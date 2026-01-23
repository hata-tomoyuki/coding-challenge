import { Participant, Expense } from '@/app/types';

export interface Transfer {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number; // 整数円
}

export interface SettlementResult {
  totalAmount: number;
  /** 1人あたりの基本負担額（floor）。余りは一部の参加者が+1円負担する */
  perPersonShareBase: number;
  /** 余りの円（0..participants.length-1）。+1円負担する人数と同じ */
  remainder: number;
  transfers: Transfer[];
}

/**
 * 精算計算（整数円ベース、端数は「floor＋余り配分」）
 *
 * @param participants - 参加者リスト
 * @param expenses - 支払いリスト
 * @returns 精算結果（総額、1人あたりの負担額、送金リスト）。参加者が0人の場合はnullを返す
 *
 * @remarks
 * - 1人あたりの基本負担額は `floor(total / n)`（整数円）で計算
 * - 余り `total % n` 円は、参加者の並び（id昇順）の先頭から順に「+1円負担」として配分する
 * - 送金リストは貪欲法で生成され、最小の送金回数で精算を完了
 * - すべての金額は整数円で表現される
 *
 * @example
 * ```typescript
 * const result = calculateSettlement(
 *   [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }],
 *   [{ id: 'e1', payerId: '1', amountYen: 1000, title: '食事', createdAt: Date.now() } as any]
 * );
 * // result.perPersonShareBase = 500円, result.remainder = 0
 * // result.transfers = [{ fromId: '2', toId: '1', amount: 500, ... }]
 * ```
 */
export function calculateSettlement(
  participants: Participant[],
  expenses: Expense[]
): SettlementResult | null {
  if (participants.length === 0) {
    return null;
  }

  if (expenses.length === 0) {
    return {
      totalAmount: 0,
      perPersonShareBase: 0,
      remainder: 0,
      transfers: [],
    };
  }

  // 総額計算
  const totalAmount = expenses.reduce((sum, e) => sum + e.amountYen, 0);

  // 1人あたりの基本負担額（floor）と余り
  const perPersonShareBase = Math.floor(totalAmount / participants.length);
  const remainder = totalAmount - perPersonShareBase * participants.length; // 0..n-1

  // 各人の支払い総額を計算
  const paidByPerson = new Map<string, number>();
  participants.forEach((p) => {
    paidByPerson.set(p.id, 0);
  });

  expenses.forEach((e) => {
    const current = paidByPerson.get(e.payerId) || 0;
    paidByPerson.set(e.payerId, current + e.amountYen);
  });

  // 余り配分: id昇順の先頭からremainder人に+1円負担を割り当てる
  const sortedParticipants = [...participants].sort((a, b) =>
    a.id.localeCompare(b.id)
  );
  const shareById = new Map<string, number>();
  sortedParticipants.forEach((p, index) => {
    const share = perPersonShareBase + (index < remainder ? 1 : 0);
    shareById.set(p.id, share);
  });

  // 各人の差額を計算（受け取る側: 正、支払う側: 負）
  const deltas: Array<{ id: string; name: string; delta: number }> = [];
  participants.forEach((p) => {
    const paid = paidByPerson.get(p.id) || 0;
    const share = shareById.get(p.id) ?? perPersonShareBase;
    const delta = paid - share;
    deltas.push({ id: p.id, name: p.name, delta });
  });

  // 受け取り側と支払い側に分ける
  const receivers = deltas.filter((d) => d.delta > 0);
  const payers = deltas.filter((d) => d.delta < 0);

  // 送金リストを生成（貪欲法）
  const transfers: Transfer[] = [];
  let receiverIndex = 0;
  let payerIndex = 0;

  while (receiverIndex < receivers.length && payerIndex < payers.length) {
    const receiver = receivers[receiverIndex];
    const payer = payers[payerIndex];

    const amount = Math.min(receiver.delta, Math.abs(payer.delta));

    transfers.push({
      fromId: payer.id,
      fromName: payer.name,
      toId: receiver.id,
      toName: receiver.name,
      amount,
    });

    receiver.delta -= amount;
    payer.delta += amount;

    if (receiver.delta === 0) {
      receiverIndex++;
    }
    if (payer.delta === 0) {
      payerIndex++;
    }
  }

  return {
    totalAmount,
    perPersonShareBase,
    remainder,
    transfers,
  };
}
