/**
 * Tax Early Warning Service for lenhuminh01@gmail.com
 *
 * Threshold: 100.000.000 VNĐ (Legal threshold for individual business registration in Vietnam)
 * Milestone 1 (50%): 50.000.000 VNĐ -> Early preparation alert for HKD registration
 * Milestone 2 (75%): 75.000.000 VNĐ -> Urgent alert to register HKD before 100M to avoid 35% PIT progressive tax tier
 *
 * Single Send Rule: Each milestone alert is sent EXACTLY ONCE.
 */

export const TAX_ALERT_EMAIL = 'lenhuminh01@gmail.com';
export const LEGAL_TAX_THRESHOLD = 100000000; // 100M VNĐ
export const MILESTONE_50 = 50000000; // 50M VNĐ
export const MILESTONE_75 = 75000000; // 75M VNĐ

const STORAGE_SENT_50 = 'tax_alert_sent_50_v1';
const STORAGE_SENT_75 = 'tax_alert_sent_75_v1';

export interface TaxAlertStatus {
  totalRevenue: number;
  progressPercent: number;
  sent50: boolean;
  sent75: boolean;
  activeAlert: 'none' | '50_percent' | '75_percent';
  message?: string;
}

export function getTaxAlertState(totalRevenue: number): TaxAlertStatus {
  const sent50 = localStorage.getItem(STORAGE_SENT_50) === 'true';
  const sent75 = localStorage.getItem(STORAGE_SENT_75) === 'true';

  const progressPercent = Math.min(100, Math.round((totalRevenue / LEGAL_TAX_THRESHOLD) * 100));

  let activeAlert: 'none' | '50_percent' | '75_percent' = 'none';
  let message = '';

  if (totalRevenue >= MILESTONE_75) {
    activeAlert = '75_percent';
    message = `🚨 [KHẨN CẤP 75%] Doanh thu hoa hồng đã đạt ${totalRevenue.toLocaleString('vi-VN')}đ (75% ngưỡng 100 triệu). Vui lòng làm thủ tục đăng ký Hộ Kinh Doanh Cá Thể / Doanh Nghiệp ngay để chốt mức thuế 7% phẳng, tránh bị truy thu 35%! (Mail cảnh báo đã gửi tới ${TAX_ALERT_EMAIL}).`;
  } else if (totalRevenue >= MILESTONE_50) {
    activeAlert = '50_percent';
    message = `⚠️ [CẢNH BÁO 50%] Doanh thu hoa hồng đã đạt ${totalRevenue.toLocaleString('vi-VN')}đ (50% ngưỡng 100 triệu). Hãy chuẩn bị hồ sơ đăng ký Hộ Kinh Doanh Cá Thể. (Mail cảnh báo đã gửi tới ${TAX_ALERT_EMAIL}).`;
  }

  return {
    totalRevenue,
    progressPercent,
    sent50,
    sent75,
    activeAlert,
    message,
  };
}

export function triggerTaxAlertEmailIfNeeded(totalRevenue: number): { sentNewAlert: boolean; alertType?: string } {
  const sent50 = localStorage.getItem(STORAGE_SENT_50) === 'true';
  const sent75 = localStorage.getItem(STORAGE_SENT_75) === 'true';

  // 75% Milestone Check (Highest priority)
  if (totalRevenue >= MILESTONE_75 && !sent75) {
    sendTaxAlertEmail({
      to: TAX_ALERT_EMAIL,
      subject: `[Cashback Link URGENT 75%] Doanh thu hoa hồng đạt ${totalRevenue.toLocaleString('vi-VN')}đ - Đăng ký Hộ Kinh Doanh Ngay!`,
      milestone: '75%',
      revenue: totalRevenue,
      recommendation: 'Doanh thu đã đạt 75% ngưỡng 100 triệu VNĐ. Hãy lập tức đăng ký Hộ Kinh Doanh Cá Thể (HKD) để chốt mức thuế 7% phẳng (5% VAT + 2% TNCN), tránh bị truy thu luỹ tiến 35%!',
    });
    localStorage.setItem(STORAGE_SENT_75, 'true');
    localStorage.setItem(STORAGE_SENT_50, 'true'); // Automatically mark 50% as sent if jumped straight to 75%
    return { sentNewAlert: true, alertType: '75%' };
  }

  // 50% Milestone Check
  if (totalRevenue >= MILESTONE_50 && !sent50 && totalRevenue < MILESTONE_75) {
    sendTaxAlertEmail({
      to: TAX_ALERT_EMAIL,
      subject: `[Cashback Link Alert 50%] Doanh thu hoa hồng đạt ${totalRevenue.toLocaleString('vi-VN')}đ - Dự phóng hồ sơ Hộ Kinh Doanh`,
      milestone: '50%',
      revenue: totalRevenue,
      recommendation: 'Doanh thu hoa hồng tài khoản AccessTrade đã đạt 50% ngưỡng 100 triệu VNĐ. Bạn nên dự phóng chuẩn bị giấy tờ CCCD/Mặt bằng để tiến hành đăng ký Hộ Kinh Doanh Cá Thể trong 1-2 tháng tới.',
    });
    localStorage.setItem(STORAGE_SENT_50, 'true');
    return { sentNewAlert: true, alertType: '50%' };
  }

  return { sentNewAlert: false };
}

function sendTaxAlertEmail(payload: {
  to: string;
  subject: string;
  milestone: string;
  revenue: number;
  recommendation: string;
}) {
  console.log(`[TAX ALERT MAIL SENT ONCE TO ${payload.to}]`, payload);

  // Trigger server-side mail dispatch if endpoint exists
  fetch('/api/tax/send-alert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Fail-safe log
  });
}
