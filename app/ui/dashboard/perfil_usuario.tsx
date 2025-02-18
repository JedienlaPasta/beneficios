import img from "@/public/user-sample-100x67.jpg";
import Image from "next/image";
export default function PerfilUsuario() {
  return (
    <section className="flex items-center gap-2 p-2 mx-4 my-4 border rounded-md bg-slate-800/10">
      <span className="relative w-10 aspect-square">
        <Image
          src={img}
          alt="user-image"
          className="object-cover w-full h-full rounded-md"
        />
        <div className="absolute bottom-[-3px] right-[-1px] w-[10px] h-[10px] bg-green-400 rounded-md"></div>
      </span>
      <span className="">
        <h3 className="text-sm font-bold text-slate-900/80">Kristina Meyers</h3>
        <p className="text-xs text-slate-900/70">Administrador</p>
      </span>
    </section>
  );
}
