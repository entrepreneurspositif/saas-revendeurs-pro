import { prisma } from '@/lib/prisma';

export async function findOrderByCodeOrId(input: string, includeProduct: boolean = false) {
  if (!input || !input.trim()) return null;

  const raw = input.trim();
  const upper = raw.toUpperCase();
  // Extract numeric digits if present (e.g. "323631" from "TK-323631" or "tk 323631")
  const digitsOnly = upper.replace(/\D/g, '');
  const formattedTK = digitsOnly ? `TK-${digitsOnly}` : upper;
  const cleanNoPrefix = upper.replace(/^TK[-_\s]*/i, '');

  const candidates = Array.from(
    new Set([raw, upper, formattedTK, cleanNoPrefix, digitsOnly].filter(Boolean))
  );

  const includeClause = includeProduct
    ? {
        product: {
          include: {
            activeSupplierProduct: {
              include: { supplier: true },
            },
          },
        },
      }
    : undefined;

  return await prisma.order.findFirst({
    where: {
      OR: [
        ...candidates.map((c) => ({ ticketCode: c })),
        ...candidates.map((c) => ({ id: c })),
      ],
    },
    include: includeClause,
  });
}
