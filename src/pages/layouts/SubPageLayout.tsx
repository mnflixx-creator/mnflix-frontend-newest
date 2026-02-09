/**
 * SubPageLayout stub - P-Stream specific layout
 * Not needed for MNFLIX
 */

import { ReactNode } from 'react';

export interface SubPageLayoutProps {
  children?: ReactNode;
}

export function SubPageLayout({ children }: SubPageLayoutProps) {
  return <div>{children}</div>;
}

export function BlurEllipsis({ children }: { children?: ReactNode }) {
  return <div>{children}</div>;
}
