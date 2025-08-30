import { Poppins, Source_Code_Pro } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "Mooneye",
  description: "Terminal-based Money Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${sourceCodePro.variable}`}>
        {children}
      </body>
    </html>
  );
}
