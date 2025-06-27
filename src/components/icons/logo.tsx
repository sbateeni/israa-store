import { cn } from "@/lib/utils";
import React from "react";

const Logo = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => {
    return (
        <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("w-8 h-8", className)}
        {...props}
      >
        <path d="M12 12c0-2.67 2-4 4-4s4 1.33 4 4c0 2.67-2 4-4 4s-4-1.33-4-4z" />
        <path d="M12 12c0-2.67-2-4-4-4S4 9.33 4 12c0 2.67 2 4 4 4s4-1.33 4-4z" />
        <path d="M14 8c0-4-2-4-2-4s-2 0-2 4" />
        <path d="M10 16c0 4 2 4 2 4s2 0 2-4" />
        <path d="M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0" opacity="0.2"/>
      </svg>
    );
  }
);

Logo.displayName = "Logo";
export default Logo;
