"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Campaign } from "@/app/lib/definitions";

type DatePickerProps = {
  date?: Date;
  label?: string;
  setDate?: (date: Date) => void;
  setFormData?: (
    prevState: Campaign | ((prevState: Campaign) => Campaign),
  ) => void;
};

export function DatePicker({
  date,
  label,
  setDate,
  setFormData,
}: DatePickerProps) {
  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      if (setFormData) {
        console.log("setFormData");
        setFormData((prevState) => ({
          ...prevState,
          [label === "Inicio" ? "fecha_inicio" : "fecha_termino"]: selectedDate,
        }));
      } else if (setDate) {
        setDate(selectedDate);
      }
    }
  };

  return (
    <div className="flex w-full flex-col gap-1">
      <label className="text-xs text-slate-500">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "justify-start border-slate-300 text-left font-normal text-slate-700",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon />
            {date ? (
              format(date, "PPP", { locale: es })
            ) : (
              <span>Selecciona una fecha</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto border-slate-300 p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            locale={es}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
