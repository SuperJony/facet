import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "cn-button group/button inline-flex shrink-0 items-center justify-center border text-sm whitespace-nowrap select-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "cn-button-variant-default",
        outline: "cn-button-variant-outline",
        secondary: "cn-button-variant-secondary",
        ghost: "cn-button-variant-ghost",
        destructive: "cn-button-variant-destructive",
        link: "cn-button-variant-link",
      },
      size: {
        default:
          "cn-button-size-default h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "cn-button-size-xs h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "cn-button-size-sm h-7 gap-1 px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "cn-button-size-lg h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "cn-button-size-icon size-8",
        "icon-xs":
          "cn-button-size-icon-xs size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "cn-button-size-icon-sm size-7",
        "icon-lg": "cn-button-size-icon-lg size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// Layout and size live here, so every theme draws inside the same frame (ADR 0005).
// Everything visual, including focus, disabled and transitions, comes from the theme CSS.
// The four decoration slots are always rendered; a theme that does not use one hides it.
function Button({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      <span
        data-slot="button-base"
        className="cn-button-base"
        aria-hidden="true"
      />
      <span data-slot="button-face" className="cn-button-face">
        <span
          data-slot="button-highlight"
          className="cn-button-highlight"
          aria-hidden="true"
        />
        <span data-slot="button-label" className="cn-button-label">
          {children}
        </span>
      </span>
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
