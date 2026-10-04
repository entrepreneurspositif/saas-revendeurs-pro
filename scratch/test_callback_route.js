function isBrowserRequest(req) {
  const accept = req.headers.get('accept') || '';
  const secFetchDest = req.headers.get('sec-fetch-dest') || '';
  const userAgent = req.headers.get('user-agent') || '';

  return (
    req.method === 'GET' ||
    accept.includes('text/html') ||
    secFetchDest === 'document' ||
    /mozilla|chrome|safari|iphone|android/i.test(userAgent)
  );
}

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

console.log('Testing callback helper functions...');
console.log('Ticket code extracted:', extractTicketCode({ description: 'Order TK-998877 on FeexPay' }));
