import type { ReactNode } from "react";
import { SectionCard } from "../section-card";

export const ProviderSectionCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <SectionCard title={title} description={description}>
    {children}
  </SectionCard>
);
