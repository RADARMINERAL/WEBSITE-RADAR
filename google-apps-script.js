/**
 * ==============================================================================
 * RADAR MINERAL - GOOGLE APPS SCRIPT WEB APP ENDPOINT
 * ==============================================================================
 * Petunjuk Pemasangan:
 * 1. Buat Google Spreadsheet baru (misal: "Database Pesanan - Radar Mineral")
 * 2. Pada baris ke-1 (Header), isi kolom A1 sampai K1 sebagai berikut:
 *    A1: Tanggal & Waktu
 *    B1: Kode Pesanan
 *    C1: Nama Pelanggan
 *    D1: No. WhatsApp
 *    E1: Kecamatan
 *    F1: Alamat Pengiriman
 *    G1: Rincian Produk
 *    H1: Total (Rp)
 *    I1: Metode Bayar
 *    J1: Status Pembayaran
 *    K1: Catatan
 * 
 * 3. Buka menu "Ekstensi" (Extensions) -> "Apps Script"
 * 4. Hapus seluruh isi default, lalu salin dan tempel (paste) kode di bawah ini.
 * 5. Klik "Deploy" (Terapkan) -> "New deployment" (Penerapan baru).
 * 6. Pilih jenis: "Web app" (Aplikasi Web).
 *    - Description: Radar Mineral Order API
 *    - Execute as: Me (Email Google Anda)
 *    - Who has access: Anyone (Siapa saja)  <--- PENTING!
 * 7. Klik "Deploy", beri izin akses jika diminta (Authorize Access), lalu salin "Web app URL".
 * 8. Tempelkan URL tersebut ke file `.env` di project website:
 *    VITE_GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/AKfycbx.../exec"
 * ==============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Tunggu maksimal 10 detik jika ada pesanan bersamaan untuk mencegah bentrok baris
  lock.waitLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getActiveSheet();

    // Parse data JSON yang dikirimkan oleh website
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // Format tanggal & waktu lokal Makassar (WITA / GMT+8)
    var timestamp = Utilities.formatDate(new Date(), "Asia/Makassar", "yyyy-MM-dd HH:mm:ss");

    var orderCode = data.orderCode || "-";
    var customerName = data.customerName || "-";
    var phone = "'" + (data.phone || "-"); // Diberi tanda kutip satu agar 08xx tidak menjadi 8xx
    var district = data.district || "-";
    var address = data.address || "-";
    var itemsSummary = data.itemsSummary || "-";
    var total = data.total || 0;
    var paymentMethod = data.paymentMethod ? String(data.paymentMethod).toUpperCase() : "-";
    var paymentStatus = data.paymentStatus || "Belum Dibayar";
    var notes = data.notes || "-";

    // Sisipkan baris baru di spreadsheet
    sheet.appendRow([
      timestamp,
      orderCode,
      customerName,
      phone,
      district,
      address,
      itemsSummary,
      total,
      paymentMethod,
      paymentStatus,
      notes
    ]);

    // Berikan respons sukses
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        message: "Pesanan berhasil dicatat ke Google Sheets",
        orderCode: orderCode
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: error.toString()
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// Fungsi pengujian sederhana melalui browser (GET)
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "active",
      message: "Webhook Google Apps Script Radar Mineral siap menerima data pesanan."
    })
  ).setMimeType(ContentService.MimeType.JSON);
}
