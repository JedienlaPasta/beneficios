import { ConfigProvider, DatePicker } from "antd";
import es_ES from "antd/lib/locale/es_ES";
import { inter } from "../fonts";
import dayjs from "dayjs";
import { Campaign } from "@/app/lib/definitions";

type CustomAntdDatePickerProps = {
  label: string;
  placeholder?: string;
  defaultValue?: dayjs.Dayjs | null;
  required?: boolean;
  setDate?: (
    pickerDate: dayjs.Dayjs | null,
    dateString: string | string[],
  ) => void;
  setFormData?: React.Dispatch<React.SetStateAction<Campaign>>;
  value?: dayjs.Dayjs | null;
};

export default function CustomAntdDatePicker({
  label,
  placeholder,
  defaultValue,
  required,
  setDate,
  setFormData,
  value,
}: CustomAntdDatePickerProps) {
  // Separa el setData de newCampaign/updateCampaign
  const datePickerHandler = (
    date: dayjs.Dayjs | null,
    dateString: string | string[],
  ) => {
    if (setDate) {
      setDate(date, dateString);
    } else if (setFormData && date) {
      setFormData((prev) => ({
        ...prev,
        [label === "Inicio" ? "fecha_inicio" : "fecha_termino"]: date.toDate(),
      }));
    }
  };

  return (
    <ConfigProvider
      locale={es_ES}
      theme={{
        token: {
          fontFamily: inter.style.fontFamily,
        },
      }}
    >
      <div className="flex flex-col gap-1">
        <label className="ml-1 text-[10px] font-bold uppercase text-slate-500">
          {label}
          {required ? (
            <span className="text-xs font-normal text-red-500"> *</span>
          ) : (
            <span className="text-[10px] font-normal text-slate-400">
              {" "}
              (opcional)
            </span>
          )}
        </label>
        <DatePicker
          allowClear={false}
          format={"DD/MM/YYYY"}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={datePickerHandler}
          required={required}
          value={value ?? null}
          className="h-10 rounded-lg border border-slate-200 px-4 text-sm text-slate-700 shadow-sm transition-all placeholder:text-gray-400 focus-within:!border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 hover:border-slate-200 focus:border-blue-400"
        />
      </div>
    </ConfigProvider>
  );
}
