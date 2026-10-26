import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * The public site's button, per the v3 design. One class string so a `<Link>`,
 * an `<a>` or a `<button>` can all wear it.
 *
 *   light theme  -- soft pill, sentence case
 *   dark theme   -- squared 3px corners, small uppercase with tracking
 *
 * `gold` is a flat brand fill (no gradient); `ghost` is the outlined one.
 * The shadcn <Button> stays for the admin, where dense controls want its
 * compact sizing.
 */
export const siteButton = cva(
  'relative inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full font-semibold whitespace-nowrap transition duration-200 outline-none focus-visible:ring-4 focus-visible:ring-gold-500/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[1.1rem] [&_svg]:shrink-0 dk:rounded-[3px] dk:tracking-[0.1em] dk:uppercase',
  {
    variants: {
      variant: {
        gold: 'bg-gold-500 text-gold-foreground shadow-[0_8px_22px_-10px_color-mix(in_oklab,var(--gold-500)_65%,transparent)] hover:brightness-[1.07] dk:bg-gold-500',
        ghost:
          'border border-line-2 bg-card/75 text-foreground shadow-[inset_0_1px_0_#fff] hover:border-gold-700 hover:bg-card hover:text-gold-ink dk:border-gold-500 dk:bg-transparent dk:text-gold-ink dk:shadow-none dk:hover:bg-gold-500/10 dk:hover:text-gold-ink',
        // text-only: Back links and other low-emphasis actions
        quiet: 'text-chrome-400 hover:text-gold-ink',
        plain: 'border border-line-2 text-foreground hover:border-gold-500 hover:text-gold-ink',
      },
      size: {
        default: 'h-[52px] px-7 text-[0.95rem] dk:text-[0.8rem]',
        sm: 'h-[42px] px-5 text-[0.85rem] dk:text-[0.8rem]',
        lg: 'h-[56px] px-7 text-[1.02rem] dk:text-[0.85rem]',
      },
    },
    defaultVariants: { variant: 'gold', size: 'default' },
  }
)

export type SiteButtonProps = VariantProps<typeof siteButton>

/**
 * The same button as a component, for places that need a real <button> (or
 * `render={<Link />}`) with the public site's look. Use this on every
 * customer-facing screen; the shadcn <Button> is for the admin only.
 */
export function SiteButton({
  className,
  variant,
  size,
  nativeButton,
  ...props
}: ButtonPrimitive.Props & SiteButtonProps) {
  return (
    <ButtonPrimitive
      nativeButton={nativeButton ?? !props.render}
      className={cn(siteButton({ variant, size }), 'cursor-pointer', className)}
      {...props}
    />
  )
}
