import React from "react"

export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={`card-custom ${className}`} {...props} />
}
export function CardHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={`card-header-custom ${className}`} {...props} />
}
export function CardTitle({ className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={`card-title-custom ${className}`} {...props} />
}
export function CardDescription({ className = "", ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={`card-description-custom ${className}`} {...props} />
}
export function CardContent({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={`card-content-custom ${className}`} {...props} />
}
