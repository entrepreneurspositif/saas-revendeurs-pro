import { prisma } from '@/lib/prisma';

export const DEFAULT_PAYMENT_INSTRUCTIONS = `=== INSTRUCTIONS DE PAIEMENT ===
1. Effectuez votre règlement du montant exact indiqué sur votre ticket.
2. Modes de paiement acceptés :
   - Mobile Money (Wave / Orange / Moov / MTN) : +225 07 00 00 00 00
   - Virement Bancaire : IBAN CI83 0000 1111 2222 3333 44
   - Crypto USDT (TRC20) : TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
3. Indiquez impérativement votre CODE DE TICKET comme motif ou référence du paiement.
4. Une fois votre paiement effectué, l'administrateur validera votre ticket et votre commande (abonnement ou numéro virtuel) sera livrée immédiatement.`;

export async function getPaymentInstructions(): Promise<string> {
  try {
    const setting = await prisma.setting.findFirst({
      where: {
        OR: [
          { key: 'payment_instructions' },
          { key: 'PAYMENT_INSTRUCTIONS' },
        ],
      },
    });

    if (setting && setting.value && setting.value.trim()) {
      return setting.value;
    }
  } catch (error) {
    console.error('Error fetching payment instructions:', error);
  }

  return DEFAULT_PAYMENT_INSTRUCTIONS;
}
