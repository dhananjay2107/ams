'use client'
import { Input } from '@heroui/react'
import React, { ReactNode } from 'react'

const GeneralInput = ({
    name,
    placeholder,
    variant,
    icon,
    radius
}: {
    name: string,
    placeholder: string,
    variant: "bordered",
    icon?: ReactNode,
    radius?: "full" | "lg" | "md" | "sm" | "none"
}) => {
    return (
        <Input
            placeholder={placeholder}
            name={name}
            variant={variant}
            startContent={icon}
            radius={radius}
        />
    )
}

export default GeneralInput