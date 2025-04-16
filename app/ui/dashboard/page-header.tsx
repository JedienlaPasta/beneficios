import { JSX } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  children?: JSX.Element;
};

export default function PageHeader({
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between 3xl:w-[96rem] 3xl:justify-self-center">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <p className="text-sm text-slate-600/70">{description}</p>
      </div>
      {children && <div className="flex items-center">{children}</div>}
    </div>
  );
}
