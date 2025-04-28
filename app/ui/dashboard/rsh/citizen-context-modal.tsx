import { fetchRSHByRUT } from "@/app/lib/data/rsh";
import CitizenDetailModal from "./citizen-detail-modal";

type ModalContextProps = {
  name: string;
  rut: string;
};

export default async function ModalCitizenDetailContext({
  name,
  rut,
}: ModalContextProps) {
  const response = await fetchRSHByRUT(rut);
  return (
    // <div className="flex h-svh items-start justify-center">
    <CitizenDetailModal name={name} citizen={response.data[0]} />
    // </div>
  );
}
