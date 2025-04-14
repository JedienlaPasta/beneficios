import { fetchActiveCampaigns } from "@/app/lib/data/campañas";
import { formatDate } from "@/app/lib/utils/format";
import { FaBoxOpen } from "react-icons/fa6";
import Link from "next/link";

type ActiveCampaignsProps = {
  nombre_campaña: string;
  termina: Date;
  entregas: number;
};

export default async function ActiveCampaigns() {
  const { data } = await fetchActiveCampaigns();
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        {data.map((campaign) => (
          <Link href={`/dashboard/campanas/${campaign.id}`} key={campaign.id}>
            <ActiveCampaign
              nombre_campaña={campaign.nombre_campaña}
              termina={campaign.fecha_termino}
              entregas={campaign.entregas}
            />
          </Link>
        ))}
      </div>
    </>
  );
}

function ActiveCampaign({
  nombre_campaña,
  termina,
  entregas,
}: ActiveCampaignsProps) {
  const fecha_termino = formatDate(termina);
  return (
    <div className="group relative flex min-w-64 flex-1 cursor-pointer flex-col overflow-hidden rounded-xl bg-white shadow-md shadow-slate-300/70 transition-all duration-300 hover:shadow-lg hover:shadow-slate-300/80">
      {/* Decorative gradient element */}
      {/* <div className="absolute left-[calc(100%-1rem)] top-0 z-0 h-60 w-[20rem] bg-gradient-to-b from-blue-500 to-blue-700 transition-all duration-500 group-hover:left-[calc(100%-8rem)] group-hover:-rotate-[-25deg]"></div> */}
      <div className="absolute -right-[21rem] top-[8rem] z-0 h-60 w-96 rotate-[55deg] rounded-full bg-gradient-to-b from-blue-500 to-blue-700 transition-all duration-500 group-hover:-top-[1rem] group-hover:-translate-x-24 group-hover:-rotate-[-30deg]"></div>

      {/* Card content */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-all duration-500 group-hover:bg-blue-600 group-hover:text-white">
            <FaBoxOpen />
          </div>
          <div className="flex flex-col">
            <h5 className="text-sm font-bold uppercase text-slate-700 transition-colors duration-300 group-hover:text-blue-600">
              {nombre_campaña}
            </h5>
            <span className="mt-1 flex items-center text-xs text-slate-500">
              <svg
                className="mr-1 h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Termina: {fecha_termino}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="relative right-0 text-2xl font-bold text-slate-600 transition-all duration-500 group-hover:right-3 group-hover:text-blue-50">
            {entregas}
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400 transition-all duration-500 group-hover:text-blue-300">
            Entregas
          </span>
        </div>
      </div>
    </div>
  );
}

export function ActiveCampaignsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
      <ActiveCampaignSkeleton />
      <ActiveCampaignSkeleton />
      <ActiveCampaignSkeleton />
    </div>
  );
}

function ActiveCampaignSkeleton() {
  return (
    <div className="relative flex min-w-64 flex-1 cursor-pointer flex-col overflow-hidden rounded-xl bg-white shadow-md shadow-slate-300/70">
      {/* Card content */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 animate-pulse items-center justify-center rounded-lg bg-slate-200"></div>
          <div className="flex flex-col gap-1">
            <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
              {/* Nombre Campaña */}
              <div className="h-5 w-40 animate-pulse rounded-md bg-slate-200"></div>
            </span>
            <span className="flex items-center gap-1">
              <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div>
              <div className="h-5 w-20 animate-pulse rounded-md bg-slate-200"></div>
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="h-5 w-5 animate-pulse rounded-md bg-slate-200">
            {/* {entregas} */}
          </span>
          <span className="h-5 w-16 animate-pulse rounded-md bg-slate-200"></span>
        </div>
      </div>
    </div>
  );
}
