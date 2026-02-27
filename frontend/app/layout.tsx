import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "CostCorrect — SA Architectural Plan BOQ Generator",
    description:
        "Upload your architectural plan and instantly get a South African Bill of Quantities with brick counts, cement bags, and sand cubes.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
