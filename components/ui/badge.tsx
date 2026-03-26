import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {
  /**
   * When `true` the badge pulses briefly every 10 seconds to draw attention.
   *
   * The rhythm is two quick opacity flashes at the start of each cycle,
   * followed by a long idle period — noticeable enough to catch the eye
   * without being distracting during sustained use.
   *
   * The `@keyframes` rule is injected into `<head>` once on first render and
   * shared across all blinking badge instances.
   */
  blink?: boolean;
}

/**
 * ID used to guard against injecting the `<style>` block more than once,
 * even if multiple blinking badges mount simultaneously.
 */
const BLINK_STYLE_ID = 'badge-blink-keyframes';

/**
 * Two quick opacity flashes at 0–8 % of the cycle, then fully opaque for the
 * remaining ~9.2 s. At a 10 s `animation-duration` this means the badge
 * blinks once every 10 seconds.
 */
const BLINK_CSS = `
@keyframes badge-blink {
  0%,  100% { opacity: 1;    }
  2%         { opacity: 0.15; }
  4%         { opacity: 1;    }
  6%         { opacity: 0.15; }
  8%         { opacity: 1;    }
}
.badge-blink {
  animation: badge-blink 10s ease-in-out infinite;
}
`;

/**
 * Lazily injects the shared blink `@keyframes` stylesheet into `<head>`.
 * Safe to call on every render — the guard on `BLINK_STYLE_ID` ensures the
 * `<style>` node is only created once. No-ops in SSR environments.
 */
function ensureBlinkStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(BLINK_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = BLINK_STYLE_ID;
  style.textContent = BLINK_CSS;
  document.head.appendChild(style);
}

function Badge({ className, variant, blink = true, ...props }: BadgeProps) {
  if (blink) ensureBlinkStyles();

  return (
    <div
      className={cn(badgeVariants({ variant }), blink && 'badge-blink', className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }