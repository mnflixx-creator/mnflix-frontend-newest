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

const legacyDetectScript = `
(function () {
  try {
    var d = document;
    var s = d.createElement("style");
    s.textContent = "@layer test { .__layer_test { color: red; } }";
    d.head.appendChild(s);
    var ok = false;
    try {
      ok = !!(s.sheet && s.sheet.cssRules && s.sheet.cssRules.length);
    } catch (e) {
      ok = false;
    }
    if (s.parentNode) s.parentNode.removeChild(s);
    d.documentElement.classList.add(ok ? "supports-layer" : "no-layer");
  } catch (e) {
    document.documentElement.classList.add("no-layer");
  }
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: legacyDetectScript }} />
      </head>
      <body className="m-0 p-0 bg-black text-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
