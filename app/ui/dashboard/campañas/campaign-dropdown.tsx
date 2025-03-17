import { useEffect, useRef, useState } from "react";
import { FormField } from "../entregas/new-modal-form";
// import { campaignsList } from "@/app/data/data";

type CampaignList = {
  id: string;
  name: string;
  type: string;
  code: string;
};

type CampañaDropdownProps = {
  label: string;
  name: keyof FormField | string;
  campaignsList?: CampaignList[];
  campaignName: string;
  readOnly?: boolean;
  setCampaign?: (prevState: string) => void; // x onChange()
  setCampaignName?: (name: keyof FormField, prev: string) => void;
};

export default function CampaignDropdown({
  label,
  name,
  campaignsList,
  campaignName,
  readOnly,
  setCampaign,
  setCampaignName,
}: CampañaDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  // const [campaignName, setCampaignName] = useState("");

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  // De aqui para abajo, son valores/funciones para cerrar el dropdown cuando se hace click fuera de el
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const cerrarDropdown = (e: MouseEvent): void => {
    if (
      dropdownRef.current &&
      !(dropdownRef.current as HTMLElement).contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    setIsOpen(false);
    document.addEventListener("click", cerrarDropdown);
    return () => {
      document.removeEventListener("click", cerrarDropdown);
    };
  }, []);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!setCampaign) return;
    setCampaign(e.target.value);
    console.log("first");
  };

  const handleCampaignSelection = (campaign: CampaignList) => {
    if (!setCampaignName) return;
    setCampaignName("campaignName", campaign.name);
    setCampaignName("id", campaign.id);
    setCampaignName("code", campaign.code);
    console.log(
      `Selected campaign: ${campaign.name}, ID: ${campaign.id}, CODE: ${campaign.code}`,
    );
  };

  return (
    <div
      ref={dropdownRef}
      onClick={toggleDropdown}
      className="relative flex grow select-none flex-col gap-1"
    >
      <label htmlFor={label} className="text-xs text-slate-500">
        {label}
      </label>
      <input
        id={label}
        name={name}
        type="text"
        value={campaignName}
        readOnly={readOnly}
        onChange={(e) => handleOnChange(e)}
        placeholder="Nombre campaña..."
        autoComplete="off"
        className={`${readOnly && "cursor-pointer"} h-10 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-gray-400 focus-within:border-blue-500 focus:outline-none`}
      />
      {/* Dropdown List */}
      {isOpen && (
        <ul className="absolute left-[-1px] top-16 z-10 max-h-[146px] w-[101%] divide-y overflow-y-auto rounded-lg border border-gray-200 bg-white text-slate-700 shadow-lg">
          {campaignsList?.map((campaign, index) => (
            <li
              key={index}
              onClick={(e) =>
                setCampaign
                  ? setCampaign(campaign.name)
                  : handleCampaignSelection(campaign)
              }
              className="flex h-12 w-full cursor-pointer flex-col justify-center px-4 text-sm hover:bg-sky-100"
            >
              <span>{campaign.name}</span>
              <span className="text-xs text-slate-500">{campaign.type}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
