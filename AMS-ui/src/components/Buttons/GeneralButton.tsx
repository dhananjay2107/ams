'use client'
import { Button } from '@heroui/react'
import React from 'react'

const GeneralButton = ({
    name,
    variant,
    color,
    type,
    handlePress
}: {
    name: string,
    variant: "light" | "solid",
    color?: "primary" | "secondary" | "danger",
    type?: "submit" | "reset",
    handlePress?: () => void
}) => {
    return (
        <Button variant={variant} color={color} type={type} onPress={handlePress}>{name}</Button>
    )
}

export default GeneralButton