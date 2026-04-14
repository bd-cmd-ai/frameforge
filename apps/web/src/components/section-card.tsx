import type { ReactNode } from "react";

export const SectionCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <section className="section-card">
    <div className="section-head">
      <div>
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>
    </div>
    {children}
  </section>
);
