// src/components/client/StarRating.tsx
import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  /** Calificación actual (1-5) */
  rating: number;
  /** Número total de reseñas (opcional, para mostrar al lado) */
  totalRatings?: number;
  /** Tamaño de las estrellas */
  size?: "small" | "medium" | "large";
  /** Modo interactivo (permite seleccionar estrellas) */
  interactive?: boolean;
  /** Callback cuando cambia la calificación */
  onChange?: (rating: number) => void;
  /** Mostrar etiqueta con el número */
  showLabel?: boolean;
  /** Clase adicional */
  className?: string;
}

const sizeClasses = {
  small: "w-4 h-4",
  medium: "w-5 h-5",
  large: "w-8 h-8",
};

export const StarRating = ({
  rating,
  totalRatings,
  size = "medium",
  interactive = false,
  onChange,
  showLabel = true,
  className,
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  const handleClick = (starIndex: number) => {
    if (interactive && onChange) {
      onChange(starIndex);
    }
  };

  const handleMouseEnter = (starIndex: number) => {
    if (interactive) {
      setHoverRating(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= displayRating;
          const isHalfFilled =
            !Number.isInteger(displayRating) &&
            starIndex === Math.ceil(displayRating) &&
            !interactive;

          return (
            <button
              key={starIndex}
              type="button"
              onClick={() => handleClick(starIndex)}
              onMouseEnter={() => handleMouseEnter(starIndex)}
              onMouseLeave={handleMouseLeave}
              disabled={!interactive}
              className={cn(
                "transition-all duration-150",
                interactive && "cursor-pointer hover:scale-110",
                !interactive && "cursor-default"
              )}
              aria-label={`${starIndex} ${starIndex === 1 ? "estrella" : "estrellas"}`}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors duration-150",
                  isFilled
                    ? "fill-yellow-400 text-yellow-400"
                    : isHalfFilled
                    ? "fill-yellow-400/50 text-yellow-400"
                    : "fill-gray-200 text-gray-300"
                )}
              />
            </button>
          );
        })}
      </div>

      {showLabel && (
        <div className="flex items-center gap-1 text-sm">
          <span className="font-semibold text-gray-700">
            {rating > 0 ? rating.toFixed(1) : "0.0"}
          </span>
          {totalRatings !== undefined && (
            <span className="text-gray-500">
              ({totalRatings} {totalRatings === 1 ? "reseña" : "reseñas"})
            </span>
          )}
        </div>
      )}
    </div>
  );
};
