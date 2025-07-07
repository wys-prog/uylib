import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <meta
        httpEquiv="Content-Security-Policy"
        content="script-src 'self' https://apis.google.com https://www.gstatic.com https://accounts.google.com; object-src 'none';"
      />
      {children}
    </>
  );
}
