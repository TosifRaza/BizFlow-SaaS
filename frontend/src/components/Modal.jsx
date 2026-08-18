// import { useEffect, useCallback, useRef } from 'react';
// import { createPortal } from 'react-dom';
// import { HiOutlineXMark } from 'react-icons/hi2';

// const sizeStyles = {
//   sm: 'max-w-md',
//   md: 'max-w-lg',
//   lg: 'max-w-2xl',
//   xl: 'max-w-4xl',
// };

// function Modal({
//   isOpen,
//   onClose,
//   title,
//   size = 'md',
//   children,
//   showClose = true,
// }) {
//   const overlayRef = useRef(null);
//   const contentRef = useRef(null);

//   const handleKeyDown = useCallback(
//     (e) => {
//       if (e.key === 'Escape' && isOpen) {
//         onClose();
//       }
//     },
//     [isOpen, onClose]
//   );

//   useEffect(() => {
//     if (isOpen) {
//       document.addEventListener('keydown', handleKeyDown);
//       document.body.style.overflow = 'hidden';
//     }
//     return () => {
//       document.removeEventListener('keydown', handleKeyDown);
//       document.body.style.overflow = '';
//     };
//   }, [isOpen, handleKeyDown]);

//   const handleOverlayClick = (e) => {
//     if (e.target === overlayRef.current) {
//       onClose();
//     }
//   };

//   if (!isOpen) return null;

//   return createPortal(
//     <div
//       ref={overlayRef}
//       onClick={handleOverlayClick}
//       className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-200"
//       role="dialog"
//       aria-modal="true"
//       aria-labelledby="modal-title"
//     >
//       <div
//         ref={contentRef}
//         className={[
//           'bg-white rounded-xl shadow-xl w-full transform transition-all duration-200',
//           'animate-in fade-in zoom-in-95',
//           sizeStyles[size] || sizeStyles.md,
//         ].join(' ')}
//       >
//         {(title || showClose) && (
//           <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
//             {title && (
//               <h2
//                 id="modal-title"
//                 className="text-lg font-semibold text-gray-900"
//               >
//                 {title}
//               </h2>
//             )}
//             {showClose && (
//               <button
//                 onClick={onClose}
//                 className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
//                 aria-label="Close"
//               >
//                 <HiOutlineXMark className="w-5 h-5" />
//               </button>
//             )}
//           </div>
//         )}
//         <div className="px-6 py-4">{children}</div>
//       </div>
//     </div>,
//     document.body
//   );
// }

// export default Modal;
import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { HiOutlineXMark } from 'react-icons/hi2';

const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  showClose = true,
}) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);

      // Prevent background page from scrolling
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={contentRef}
        className={[
          'bg-white rounded-xl shadow-xl w-full max-h-[90vh] flex flex-col',
          'transform transition-all duration-200',
          'animate-in fade-in zoom-in-95',
          sizeStyles[size] || sizeStyles.md,
        ].join(' ')}
      >
        {/* Modal Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-gray-900"
              >
                {title}
              </h2>
            )}

            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Modal Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1 min-h-0">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;