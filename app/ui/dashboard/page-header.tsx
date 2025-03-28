"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PageHeader() {
  //   const [id_usuario, setIdUsuario] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");

  useEffect(() => {
    try {
      const userSession = localStorage.getItem("userSession");
      if (userSession) {
        const userData = JSON.parse(userSession);
        // setIdUsuario(userData.id_usuario);
        const name = userData.nombre.split(" ")[0];
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        setNombreUsuario(capitalizedName);
      } else {
        toast.error("No se encontró sesión de usuario");
      }
    } catch (error) {
      console.error("Error getting user session:", error);
      toast.error("Error al obtener la sesión de usuario");
    }
  }, []);

  return (
    <div className="mb-6 flex items-center justify-between 3xl:w-[96rem] 3xl:justify-self-center">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Bienvenid@ {nombreUsuario}!
        </h2>
        <p className="text-sm text-slate-600/70">
          Aquí podrás ver información general y sobre las actividades que has
          realizado.
        </p>
      </div>
    </div>
  );
}
