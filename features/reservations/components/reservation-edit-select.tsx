"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronRightIcon } from "@/features/reservations/components/chevron-right-icon";

export type ReservationEditSelectOption = {
  description?: string;
  value: string;
};

type ReservationEditSelectProps = {
  disabled?: boolean;
  emptyLabel: string;
  id?: string;
  onChange: (value: string) => void;
  options: ReservationEditSelectOption[];
  value: string;
};

export function ReservationEditSelect({
  disabled = false,
  emptyLabel,
  id,
  onChange,
  options,
  value,
}: ReservationEditSelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const selectedOption = options.find((option) => option.value === value) ?? null;

  return (
    <div
      ref={containerRef}
      className={`reservation-edit-select${isOpen ? " is-open" : ""}${
        disabled ? " is-disabled" : ""
      }`}
    >
      <button
        id={selectId}
        type="button"
        className="reservation-edit-select__trigger"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${selectId}-listbox`}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((currentValue) => !currentValue);
          }
        }}
      >
        <span className="reservation-edit-select__value">
          {selectedOption ? (
            <>
              <span className="reservation-edit-select__time">{selectedOption.value}</span>
              {selectedOption.description ? (
                <span className="reservation-edit-select__description">
                  {selectedOption.description}
                </span>
              ) : null}
            </>
          ) : (
            <span className="reservation-edit-select__placeholder">{emptyLabel}</span>
          )}
        </span>
        <span className="reservation-edit-select__icon" aria-hidden="true">
          <ChevronRightIcon />
        </span>
      </button>

      {isOpen ? (
        <div
          id={`${selectId}-listbox`}
          className="reservation-edit-select__menu scrollbar-thin"
          role="listbox"
          aria-labelledby={selectId}
        >
          {options.length === 0 ? (
            <div className="reservation-edit-select__empty">{emptyLabel}</div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`reservation-edit-select__option${
                    isSelected ? " is-selected" : ""
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <span className="reservation-edit-select__time">{option.value}</span>
                  {option.description ? (
                    <span className="reservation-edit-select__option-description">
                      {option.description}
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
