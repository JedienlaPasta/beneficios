// import { RiCloseLine } from "react-icons/ri";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import { campaignsList } from "@/app/data/data";

type CampañaDropdownProps = {
  label: string;
  name: string;
};

export default function CampaignDropdown({
  label,
  name,
}: CampañaDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");

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

  return (
    <div
      ref={dropdownRef}
      onClick={toggleDropdown}
      className="relative flex select-none flex-col gap-1"
    >
      <label htmlFor={label} className="text-xs text-slate-500">
        {label}
      </label>
      <input
        id={label}
        name={name}
        type="text"
        value={campaignName}
        onChange={(e) => setCampaignName(e.target.value)}
        placeholder="Nombre campaña..."
        autoComplete="off"
        className="h-10 w-full rounded-lg border border-slate-300 bg-transparent bg-white px-4 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus-within:border-blue-500 focus:outline-none"
      />
      {/* <MdKeyboardArrowDown
        className={`absolute right-2 top-[42%] transform cursor-pointer text-3xl text-slate-400 transition duration-300 ${isOpen ? "rotate-[-180deg]" : ""}`}
      /> */}
      {/* Dropdown List */}
      {isOpen && (
        <ul className="absolute left-[-1px] top-16 z-10 w-[101%] divide-y overflow-hidden rounded-lg border border-gray-200 bg-white text-slate-700 shadow-lg">
          {campaignsList.map((campaign, index) => (
            <li
              key={index}
              onClick={() => setCampaignName(campaign.name)}
              className="flex w-full cursor-pointer flex-col px-4 py-[6px] text-sm hover:bg-sky-100"
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
