import React from 'react';

interface CoffeeBeanIconProps {
    className?: string;
    alt?: string;
}

export const CoffeeBeanIcon: React.FC<CoffeeBeanIconProps> = ({
    className = 'w-12 h-12',
    alt = 'Biji Kopi Sanubari',
}) => {
    return (
        <img
            src="/brand/coffee-beans.png"
            alt={alt}
            className={`pointer-events-none object-contain select-none ${className}`}
        />
    );
};
