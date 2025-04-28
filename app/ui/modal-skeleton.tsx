"use client";

import CloseModalButton from "./dashboard/close-modal-button";

export default function ModalSkeleton({ name }: { name: string }) {
  return (
    <div className="z-30 grid w-[24rem] max-w-full gap-8 rounded-xl bg-white p-8 shadow-xl">
      <div className="grid gap-2">
        <span className="flex justify-between">
          <div className="h-6 w-[60%] animate-pulse rounded-md bg-gray-200"></div>
          <CloseModalButton name={name} />
        </span>
        <div className="h-6 w-[40%] animate-pulse rounded-md bg-gray-200"></div>
      </div>

      <div className="grid gap-2">
        <span className="flex justify-between">
          <div className="h-6 w-[50%] animate-pulse rounded-md bg-gray-200"></div>
          <div className="h-6 w-[20%] animate-pulse rounded-md bg-gray-200"></div>
        </span>
        <div className="h-20 w-full animate-pulse rounded-md bg-gray-200"></div>

        <span className="flex justify-between">
          <div className="h-6 w-[40%] animate-pulse rounded-md bg-gray-200"></div>
          <div className="h-6 w-[20%] animate-pulse rounded-md bg-gray-200"></div>
        </span>
        <div className="h-24 w-full animate-pulse rounded-md bg-gray-200"></div>

        {/* <div className="h-6 w-[60%] animate-pulse rounded-md bg-gray-200"></div> */}
        {/* <div className="h-24 w-full animate-pulse rounded-md bg-gray-200"></div> */}
      </div>
    </div>
  );
}
