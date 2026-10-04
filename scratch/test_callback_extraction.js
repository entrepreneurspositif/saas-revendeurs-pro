function extractTicketCode(data) {
  const direct = data.custom_id || data.customId || data.custom_info || data.customInfo || 
                 data.ticketCode || data.ticket_code || data.order_id || data.orderId || 
                 data.reference || data.ref || '';
  
  if (direct && String(direct).trim()) {
    const cleanDirect = String(direct).trim();
    if (/^TK-[\w-]+$/i.test(cleanDirect)) {
      return cleanDirect;
    }
  }

  const jsonStr = JSON.stringify(data || {});
  const match = jsonStr.match(/TK-[A-Z0-9]+/i);
  if (match) {
    return match[0].toUpperCase();
  }

  return String(direct).trim();
}

const samples = [
  { custom_id: 'TK-392537', status: 'SUCCESSFUL' },
  { custom_info: 'TK-779565', status: 'SUCCESS' },
  { order_id: 'TK-123456', status: 'APPROVED' },
  { description: 'Achat Netflix TK-998877', ref: 'AKXrnX00' },
  { reference: 'TK-554433', status: 'PAID' }
];

samples.forEach((s, i) => {
  console.log(`Sample #${i+1}:`, s, '-> Extracted Ticket Code:', extractTicketCode(s));
});
