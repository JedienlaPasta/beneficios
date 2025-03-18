"use client";
import { useState } from "react";
import { FcFolder, FcOpenedFolder } from "react-icons/fc";

export default function FolderIcon() {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <section
      className="flex-cols mt-2 flex gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex grow items-center justify-between">
        <h3 className="text font-semibold text-slate-600">
          Documentos Adjuntos
        </h3>
        {isHovered ? (
          <FcOpenedFolder className="h-7 w-7" />
        ) : (
          <FcFolder className="h-7 w-7" />
        )}
      </div>
    </section>
  );
}
