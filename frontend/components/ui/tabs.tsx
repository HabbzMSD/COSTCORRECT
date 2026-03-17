"use client"
import React, { useState, createContext, useContext } from "react"

const TabsContext = createContext<{ value: string; onValueChange: (v: string) => void }>({ value: "", onValueChange: () => { } })

export function Tabs({ defaultValue, value, onValueChange, className = "", children }: { defaultValue?: string, value?: string, onValueChange?: (v: string) => void, className?: string, children: React.ReactNode }) {
    const [uncontrolled, setUncontrolled] = useState(defaultValue || "")
    const currentValue = value !== undefined ? value : uncontrolled

    const handleValueChange = (v: string) => {
        if (value === undefined) setUncontrolled(v)
        if (onValueChange) onValueChange(v)
    }

    return (
        <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
            <div className={`tabs-root ${className}`}>{children}</div>
        </TabsContext.Provider>
    )
}

export function TabsList({ className = "", children }: { className?: string, children: React.ReactNode }) {
    return <div className={`tabs-list-custom ${className}`}>{children}</div>
}

export function TabsTrigger({ value, className = "", children }: { value: string, className?: string, children: React.ReactNode }) {
    const { value: selectedValue, onValueChange } = useContext(TabsContext)
    const isSelected = selectedValue === value

    return (
        <button
            type="button"
            role="tab"
            aria-selected={isSelected}
            data-state={isSelected ? "active" : "inactive"}
            className={`tabs-trigger-custom ${isSelected ? 'active' : ''} ${className}`}
            onClick={() => onValueChange(value)}
        >
            {children}
        </button>
    )
}

export function TabsContent({ value, className = "", children }: { value: string, className?: string, children: React.ReactNode }) {
    const { value: selectedValue } = useContext(TabsContext)
    if (selectedValue !== value) return null

    return (
        <div
            role="tabpanel"
            data-state="active"
            className={`tabs-content-custom ${className}`}
        >
            {children}
        </div>
    )
}
