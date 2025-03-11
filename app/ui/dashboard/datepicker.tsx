import { ConfigProvider, DatePicker } from "antd";
import es_ES from "antd/lib/locale/es_ES";
import { inter } from "../fonts";
import dayjs from "dayjs";
import { Campaign } from "@/app/lib/definitions";

type CustomAntdDatePickerProps = {
  label: string;
  placeholder?: string;
  defaultValue?: dayjs.Dayjs | null;
  setDate?: (
    pickerDate: dayjs.Dayjs | null,
    dateString: string | string[],
  ) => void;
  setFormData?: React.Dispatch<React.SetStateAction<Campaign>>;
};

export default function CustomAntdDatePicker({
  label,
  placeholder,
  defaultValue,
  setDate,
  setFormData,
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
        <label className="text-xs text-slate-500">{label}</label>
        <DatePicker
          allowClear={false}
          format={"DD/MM/YYYY"}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={datePickerHandler}
          className={`h-10 rounded-lg border border-slate-300 px-4 text-sm text-slate-700 placeholder:text-slate-400 focus-within:!border-blue-500 hover:border-slate-400/70 focus:!border-blue-500 focus:outline-none ${inter.className}`}
        />
      </div>
    </ConfigProvider>
  );
}
