import { useEffect, useRef, useState } from "react";

type FormField = {
  id: string;
  campaignName: string;
  detail: string;
  code: string;
};

type CampaignList = {
  id: string;
  name: string;
  type: string;
  code: string;
};

type CampaignNameDropdownProps = {
  label: string;
  name: keyof FormField | string;
  campaignsList?: CampaignList[];
  campaignName: string;
  readOnly?: boolean;
  setCampaign?: (prevState: string) => void; // x onChange()
  setCampaignName?: (name: keyof FormField, prev: string) => void;
};

export default function CampaignNameDropdown({
  label,
  name,
  campaignsList,
  campaignName,
  readOnly,
  setCampaign,
  setCampaignName,
}: CampaignNameDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

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
  };

  const handleCampaignSelection = (campaign: CampaignList) => {
    if (!setCampaignName) return;
    setCampaignName("campaignName", campaign.name);
    setCampaignName("id", campaign.id);
    setCampaignName("code", campaign.code);
    // console.log(
    //   `Selected campaign: ${campaign.name}, ID: ${campaign.id}, CODE: ${campaign.code}`,
    // );
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
        required
        className={`${readOnly && "cursor-pointer"} h-10 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-gray-400 focus-within:border-blue-500 focus:outline-none`}
      />
      {/* Dropdown List */}
      {isOpen && (
        <ul className="absolute top-16 z-10 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white px-2 text-slate-700 shadow-lg">
          {campaignsList && campaignsList.length > 0 ? (
            campaignsList.map((campaign, index) => (
              <li
                key={index}
                onClick={() =>
                  setCampaign
                    ? setCampaign(campaign.name)
                    : handleCampaignSelection(campaign)
                }
                className="flex w-full cursor-pointer flex-col justify-center rounded-md px-3 py-2 text-sm first:mt-2 last:mb-2 hover:bg-slate-100/80"
              >
                <span className="text-sm font-medium text-slate-700">
                  {campaign.name}
                </span>
                <span className="text-xs text-slate-500">{campaign.type}</span>
              </li>
            ))
          ) : (
            <li className="flex w-full flex-col justify-center rounded-md px-3 py-2 text-sm text-slate-500">
              No hay campañas disponibles
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
