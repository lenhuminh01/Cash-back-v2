import React, { useState } from 'react';
import { X, Wallet, ArrowUpRight, ShieldCheck, Info, CheckCircle2 } from 'lucide-react';
import { UserWallet, PayoutRequest } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: UserWallet;
  onRequestPayout: (req: Omit<PayoutRequest, 'id' | 'createdAt' | 'status'>) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onRequestPayout,
}) => {
  const [bankName, setBankName] = useState(wallet.bankName || 'MBBank');
  const [accountNumber, setAccountNumber] = useState(wallet.accountNumber || '');
  const [accountName, setAccountName] = useState(wallet.accountName || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const minPayout = 50000;
  const canWithdraw = wallet.availableBalance >= minPayout;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!accountNumber.trim() || !accountName.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ số tài khoản và tên chủ tài khoản.');
      return;
    }

    if (!canWithdraw) {
      setErrorMsg(`Số dư khả dụng chưa đạt hạn mức rút tối thiểu (${minPayout.toLocaleString('vi-VN')} VNĐ).`);
      return;
    }

    onRequestPayout({
      amount: wallet.availableBalance,
      bankName,
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim().toUpperCase(),
    });

    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  Ví Tích Luỹ Hoàn Tiền
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  Mã thiết bị: {wallet.deviceId}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Balance Cards */}
          <div className="p-4 space-y-3 bg-zinc-50 dark:bg-zinc-950/60">
            <div className="grid grid-cols-2 gap-2.5">
              {/* Available Balance */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                  Số dư khả dụng
                </span>
                <p className="font-black text-lg text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {wallet.availableBalance.toLocaleString('vi-VN')} đ
                </p>
                <span className="text-[10px] text-zinc-400">Rút được tiền ngay</span>
              </div>

              {/* Pending Balance */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                  Chờ đối soát
                </span>
                <p className="font-black text-lg text-zinc-900 dark:text-white mt-0.5">
                  {wallet.pendingBalance.toLocaleString('vi-VN')} đ
                </p>
                <span className="text-[10px] text-zinc-400">Chờ chốt (30-45 ngày)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>Tiền hoàn được bảo hộ chống rủi ro thuế & chi trả trực tiếp từ AccessTrade.</span>
            </div>
          </div>

          {/* Payout Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center justify-between">
              <span>Rút Tiền Về Ngân Hàng / Ví Điện Tử</span>
              <span className="text-[10px] font-normal text-zinc-400">Tối thiểu: 50.000đ</span>
            </h4>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Chọn Ngân Hàng / Ví
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none"
                >
                  <option value="MBBank">MBBank (Ngân Hàng Quân Đội)</option>
                  <option value="Vietcombank">Vietcombank</option>

                  <option value="Techcombank">Techcombank</option>
                  <option value="VPBank">VPBank</option>
                  <option value="Momo">Ví Điện Tử MoMo</option>
                  <option value="VietQR">VietQR Chuyển Nhanh</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Số Tài Khoản / Số Điện Thoại
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Ví dụ: 0988123456"
                  className="w-full py-2 px-3 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tên Chủ Tài Khoản (Viết hoa không dấu)
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="NGUYEN VAN A"
                  className="w-full py-2 px-3 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>Đã gửi yêu cầu rút tiền thành công!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!canWithdraw}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Gửi Yêu Cầu Rút Tiền</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
