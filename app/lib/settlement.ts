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
  perPersonShare: number;
  transfers: Transfer[];
}

/**
 * 精算計算（整数円ベース、端数は四捨五入）
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
      perPersonShare: 0,
      transfers: [],
    };
  }

  // 総額計算
  const totalAmount = expenses.reduce((sum, e) => sum + e.amountYen, 0);

  // 1人あたりの負担額（四捨五入）
  const perPersonShare = Math.round(totalAmount / participants.length);

  // 各人の支払い総額を計算
  const paidByPerson = new Map<string, number>();
  participants.forEach((p) => {
    paidByPerson.set(p.id, 0);
  });

  expenses.forEach((e) => {
    const current = paidByPerson.get(e.payerId) || 0;
    paidByPerson.set(e.payerId, current + e.amountYen);
  });

  // 各人の差額を計算（受け取る側: 正、支払う側: 負）
  const deltas: Array<{ id: string; name: string; delta: number }> = [];
  participants.forEach((p) => {
    const paid = paidByPerson.get(p.id) || 0;
    const delta = paid - perPersonShare;
    deltas.push({ id: p.id, name: p.name, delta });
  });

  // 端数調整: 四捨五入で端数が出る場合、合計が一致するように調整
  const totalDelta = deltas.reduce((sum, d) => sum + d.delta, 0);
  if (totalDelta !== 0) {
    // 端数分を上位数名に配分（絶対値が大きい順に調整）
    const sorted = [...deltas].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    const remainder = totalDelta;
    const adjustment = remainder > 0 ? -1 : 1;
    const absRemainder = Math.abs(remainder);
    for (let i = 0; i < absRemainder && i < sorted.length; i++) {
      const index = deltas.findIndex((d) => d.id === sorted[i].id);
      if (index !== -1) {
        deltas[index].delta += adjustment;
      }
    }
  }

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
    perPersonShare,
    transfers,
  };
}
