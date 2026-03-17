import React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "default", size = "default", asChild = false, ...props }, ref) => {
        // If it's asChild we assume the child is a single element like <Link> and wrap it in the page instead.
        // So we just render the button styling here. 
        return (
            <button
                ref={ref}
                className={`btn-custom btn-${variant} btn-size-${size} ${className}`}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"
