import type { Metadata } from "next";
import "./globals.css";
import ClientWrapper from "@/components/ClientWrapper";

export const metadata: Metadata = {
  title: "VeriSynth — Multimodal Deepfake Detection & Digital Trust Engine",
  description: "VeriSynth analyzes images and videos in real time — surfacing AI manipulation with confidence scores, risk levels, and explainable forensic insights.",
  keywords: "deepfake detection, AI forensics, digital trust, fake media detection, multimodal AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
