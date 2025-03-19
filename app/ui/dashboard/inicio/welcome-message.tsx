"use client";
import { useState, useEffect } from "react";

export default function WelcomeMessage() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Get user session from localStorage
    const sessionData = localStorage.getItem("userSession");
    if (sessionData) {
      try {
        const parsedData = JSON.parse(sessionData);
        setUserName(parsedData.nombre || "");
      } catch (error) {
        console.error("Error parsing user session:", error);
      }
    }
  }, []);

  return (
    <>
      <h2 className="text-2xl font-bold text-slate-800">
        Bienvenid@ {userName ? userName.split(" ")[0] : ""}
      </h2>
      <p className="text-sm text-slate-600/70">
        Aquí podrás ver información general y sobre las actividades que has
        realizado.
      </p>
    </>
  );
}
