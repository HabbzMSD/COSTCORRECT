import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

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
        <ClerkProvider>
            <html lang="en">
                <head>
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                            (function() {
                                try {
                                    var currentTheme = localStorage.getItem("theme");
                                    if (currentTheme === "dark" || (!currentTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                                        document.documentElement.setAttribute("data-theme", "dark");
                                    } else {
                                        document.documentElement.removeAttribute("data-theme");
                                    }
                                } catch (e) {}
                            })();
                            `,
                        }}
                    />
                </head>
                <body>{children}</body>
            </html>
        </ClerkProvider>
    );
}
