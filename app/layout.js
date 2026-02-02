import "./globals.css";
import ClientLayout from "./ClientLayout";
import "shaka-player/dist/controls.css";

export const metadata = {
  title: "MNFLIX",
  description: "Stream movies and TV shows",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="m-0 p-0 bg-black text-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
