
import "./globals.css";


export const metadata = {
  title: "Seo Scanner",
  description: "A tool for scanning and optimizing SEO performance",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
