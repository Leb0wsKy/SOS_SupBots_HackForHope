import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle, Loader2, X, Info, ShieldAlert } from 'lucide-react';

/* ═══════════════════════════════════════════════════════
   Shared Confirm / Prompt Modal — replaces window.confirm
   & window.prompt with a polished UI.

   Props:
     open        – boolean
     title       – heading text
     message     – body / description
     onConfirm   – (inputValue?: string) => void
     onCancel    – () => void
     loading     – boolean  (disable buttons while async)
     danger      – boolean  (red theme)
     confirmText – custom confirm label (default "Confirmer")
     cancelText  – custom cancel label  (default "Annuler")
     withInput   – boolean  (show a text input — prompt mode)
     inputLabel  – label for the text input
     inputPlaceholder – placeholder text
     inputRequired – boolean (block confirm when empty)
   ═══════════════════════════════════════════════════════ */

const ConfirmModal = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  withInput = false,
  inputLabel = '',
  inputPlaceholder = '',
  inputRequired = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [show, setShow] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setInputValue('');
      requestAnimationFrame(() => setShow(true));
      // Auto-focus input
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setShow(false);
    }
  }, [open]);

  const handleConfirm = () => {
    if (withInput && inputRequired && !inputValue.trim()) return;
    onConfirm(withInput ? inputValue.trim() : undefined);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onCancel();
    if (e.key === 'Enter' && !withInput) handleConfirm();
    if (e.key === 'Enter' && withInput && inputValue.trim()) handleConfirm();
  };

  if (!open) return null;

  const accentBg = danger ? 'bg-red-50' : 'bg-blue-50';
  const accentIcon = danger ? 'text-sos-red' : 'text-sos-blue';
  const confirmBg = danger
    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
    : 'bg-gradient-to-r from-sos-blue to-blue-600 hover:from-blue-600 hover:to-blue-700';

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-200
        ${show ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent pointer-events-none'}`}
      onClick={onCancel}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-md w-full transition-all duration-300 ease-out
          ${show ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header area */}
        <div className="px-6 pt-6 pb-2 flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accentBg}`}>
            {danger
              ? <ShieldAlert className={`w-5 h-5 ${accentIcon}`} />
              : <Info className={`w-5 h-5 ${accentIcon}`} />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-sos-gray-900 leading-snug">{title}</h3>
            <p className="mt-1 text-sm text-sos-gray-500 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-sos-gray-100 transition cursor-pointer shrink-0 -mt-1 -mr-1"
          >
            <X className="w-4 h-4 text-sos-gray-400" />
          </button>
        </div>

        {/* Optional text input (prompt mode) */}
        {withInput && (
          <div className="px-6 pt-3">
            {inputLabel && (
              <label className="block text-sm font-medium text-sos-gray-700 mb-1">{inputLabel}</label>
            )}
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={inputPlaceholder}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-sos-gray-300 text-sm
                         placeholder:text-sos-gray-400 resize-none
                         focus:outline-none focus:ring-2 focus:ring-sos-blue/40 focus:border-sos-blue transition"
            />
          </div>
        )}

        {/* Actions */}
        <div className="px-6 pb-6 pt-5 flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-sos-gray-200 text-sos-gray-600 text-sm font-medium
                       hover:bg-sos-gray-50 hover:border-sos-gray-300 transition cursor-pointer
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || (withInput && inputRequired && !inputValue.trim())}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold
                        transition-all cursor-pointer shadow-sm
                        disabled:opacity-50 disabled:cursor-not-allowed ${confirmBg}`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook for managing confirm modal state imperatively.
 * Returns [modalProps, showConfirm] where showConfirm returns a Promise<boolean|string>.
 *
 * Usage:
 *   const [confirmProps, showConfirm] = useConfirm();
 *   ...
 *   const ok = await showConfirm({ title: '…', message: '…', danger: true });
 *   if (!ok) return;
 *
 * For prompt mode:
 *   const reason = await showConfirm({ title: '…', withInput: true, inputRequired: true });
 *   if (reason === false) return;  // cancelled
 *   // reason is the typed string
 */
export const useConfirm = () => {
  const [state, setState] = useState({ open: false });
  const resolveRef = useRef(null);

  const showConfirm = useCallback((opts = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ ...opts, open: true });
    });
  }, []);

  const onConfirm = useCallback((inputValue) => {
    setState((s) => ({ ...s, open: false }));
    resolveRef.current?.(inputValue !== undefined ? inputValue : true);
  }, []);

  const onCancel = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
    resolveRef.current?.(false);
  }, []);

  const modalProps = { ...state, onConfirm, onCancel };

  return [modalProps, showConfirm];
};

export default ConfirmModal;
