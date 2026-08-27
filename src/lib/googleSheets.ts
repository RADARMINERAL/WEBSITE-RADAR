export interface GoogleSheetOrderPayload {
  orderCode: string;
  customerName: string;
  phone: string;
  district: string;
  address: string;
  itemsSummary: string;
  total: number;
  paymentMethod: 'qris' | 'transfer' | 'cod' | string;
  paymentStatus: string;
  notes?: string;
  createdAt?: string;
}

export interface SendOrderResult {
  success: boolean;
  configured: boolean;
  message?: string;
}

/**
 * Mengirim data pesanan langsung ke Google Sheets melalui Google Apps Script Web App Endpoint.
 */
export async function sendOrderToGoogleSheets(
  payload: GoogleSheetOrderPayload
): Promise<SendOrderResult> {
  const webhookUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL as string | undefined;

  if (!webhookUrl || !webhookUrl.startsWith('https://script.google.com/macros/s/')) {
    console.warn(
      'Google Sheets Webhook URL belum dikonfigurasi di VITE_GOOGLE_SHEETS_WEBHOOK_URL.'
    );
    return {
      success: false,
      configured: false,
      message: 'Google Sheets URL belum dikonfigurasi di .env',
    };
  }

  try {
    const postData = {
      orderCode: payload.orderCode,
      customerName: payload.customerName,
      phone: payload.phone,
      district: payload.district,
      address: payload.address,
      itemsSummary: payload.itemsSummary,
      total: payload.total,
      paymentMethod: payload.paymentMethod,
      paymentStatus: payload.paymentStatus,
      notes: payload.notes || '-',
      createdAt: payload.createdAt || new Date().toISOString(),
    };

    // Menggunakan mode 'no-cors' dan Content-Type text/plain agar Google Apps Script
    // dapat menerima payload tanpa memicu error CORS pre-flight di browser client
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(postData),
    });

    return {
      success: true,
      configured: true,
      message: 'Data pesanan berhasil dikirim ke Google Sheets',
    };
  } catch (error) {
    console.error('Error saat mengirim data pesanan ke Google Sheets:', error);
    return {
      success: false,
      configured: true,
      message: error instanceof Error ? error.message : 'Gagal mengirim ke Google Sheets',
    };
  }
}
