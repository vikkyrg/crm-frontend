import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';

export function DropdownMenu({ triggerIcon, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-text-muted hover:text-text p-1 rounded hover:bg-background transition-colors focus:outline-none"
      >
        {triggerIcon || <MoreHorizontal className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-40 origin-top-right rounded-md bg-surface border border-border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1" onClick={(e) => e.stopPropagation()}>
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  onClick: (e) => {
                    if (child.props.onClick) child.props.onClick(e);
                    setIsOpen(false);
                  }
                });
              }
              return child;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ onClick, children, className = '', icon: Icon, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-sm flex items-center ${
        danger ? 'text-danger hover:bg-danger/10' : 'text-text hover:bg-background'
      } ${className}`}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
}
