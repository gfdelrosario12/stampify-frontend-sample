"use client"

import { createPortal } from "react-dom"
import { AlertTriangle, X } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen || typeof window === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-md border border-purple-500/30 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDestructive && (
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
            )}
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-lg disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-purple-200">{message}</p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-purple-500/20 flex gap-3 bg-slate-900 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}