import { useState, type CSSProperties } from "react"
import { CheckIcon, CopyIcon, PlusIcon } from "lucide-react"

import { Button as FacetButton } from "@/components/ui/button"
import { Button } from "@/showcase/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/showcase/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/showcase/ui/tooltip"
import {
  AXIS_VALUES,
  PREVIEW_CLASS,
  PREVIEW_STATES,
  type AxisProp,
  type ButtonProps,
  type PreviewState,
  type ShowcaseState,
} from "./state"

const DOTS: CSSProperties = {
  backgroundImage:
    "radial-gradient(color-mix(in oklab, var(--foreground) 12%, transparent) 1px, transparent 1px)",
  backgroundSize: "18px 18px",
  backgroundPosition: "center",
}

const DIAGONAL: CSSProperties = {
  backgroundImage:
    "linear-gradient(to top right, transparent calc(50% - 0.5px), var(--border) 50%, transparent calc(50% + 0.5px))",
}

// A disabled button cannot be hovered, pressed or focused, so it never gets a preview class.
function Sample({
  props,
  label,
  preview,
}: {
  props: ButtonProps
  label: string
  preview: PreviewState
}) {
  const icon = props.size.startsWith("icon")
  return (
    <FacetButton
      variant={props.variant}
      size={props.size}
      disabled={props.disabled}
      className={props.disabled ? undefined : PREVIEW_CLASS[preview] || undefined}
      aria-label={icon ? `${label}（${props.variant} / ${props.size}）` : undefined}
    >
      {icon ? <PlusIcon /> : label}
    </FacetButton>
  )
}

function withAxes(fixed: ButtonProps, row: AxisProp, rv: unknown, col: AxisProp, cv: unknown) {
  return { ...fixed, [row]: rv, [col]: cv } as ButtonProps
}

const headCell =
  "border-b border-r bg-muted/60 font-mono backdrop-blur-md text-[11px] font-normal text-muted-foreground"

function Matrix({ state }: { state: ShowcaseState }) {
  const { row, col, fixed, label, preview } = state
  const cols = AXIS_VALUES[col]
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <table data-testid="matrix" className="min-w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <th
              scope="col"
              aria-label={`行 ${row}，列 ${col}`}
              className={`sticky top-0 left-0 z-30 h-14 w-28 min-w-28 p-0 ${headCell}`}
              style={DIAGONAL}
            >
              <span className="relative block size-full">
                <span className="absolute top-2 right-3">{col}</span>
                <span className="absolute bottom-2 left-3">{row}</span>
              </span>
            </th>
            {cols.map((cv) => (
              <th
                key={String(cv)}
                scope="col"
                className={`sticky top-0 z-20 min-w-22 px-2 ${headCell}`}
              >
                {String(cv)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {AXIS_VALUES[row].map((rv) => (
            <tr key={String(rv)} className="group">
              <th scope="row" className={`sticky left-0 z-10 px-3 text-left ${headCell}`}>
                {String(rv)}
              </th>
              {cols.map((cv) => (
                <td
                  key={String(cv)}
                  className="h-20 border-r border-b px-2 text-center transition-colors group-hover:bg-muted/30"
                >
                  <Sample
                    props={withAxes(fixed, row, rv, col, cv)}
                    label={label}
                    preview={preview}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function codeLine({ view, row, col, fixed, label }: ShowcaseState) {
  const onAxis = (p: AxisProp) => view === "matrix" && (row === p || col === p)
  const attrs = (["variant", "size"] as const)
    .filter((p) => !onAxis(p))
    .map((p) => `${p}="${fixed[p]}"`)
  if (!onAxis("disabled") && fixed.disabled) attrs.push("disabled")
  if (view === "single") return `<Button${attrs.map((a) => ` ${a}`).join("")}>${label}</Button>`
  return attrs.join(" ")
}

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="复制代码"
            onClick={() =>
              navigator.clipboard.writeText(code).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 1200)
              })
            }
          />
        }
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </TooltipTrigger>
      <TooltipContent>{copied ? "已复制" : "复制代码"}</TooltipContent>
    </Tooltip>
  )
}

export function Stage({
  state,
  onPreview,
  matStyle,
}: {
  state: ShowcaseState
  onPreview: (p: PreviewState) => void
  matStyle: CSSProperties
}) {
  const code = codeLine(state)
  return (
    <div
      data-testid="stage"
      className="flex min-h-[28rem] flex-1 flex-col overflow-hidden rounded-xl border bg-background shadow-xs"
      style={matStyle}
    >
      {state.view === "single" ? (
        <div className="flex flex-1 items-center justify-center p-10" style={DOTS}>
          <div style={{ zoom: 2 }}>
            <Sample props={state.fixed} label={state.label} preview={state.preview} />
          </div>
        </div>
      ) : (
        <Matrix state={state} />
      )}
      <div className="flex h-12 shrink-0 items-center justify-between gap-4 border-t bg-muted/40 pr-2 pl-4">
        <div className="flex min-w-0 items-center gap-1.5">
          {state.view === "matrix" && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {code ? "其余固定" : "全部 prop 已在矩阵中展开"}
            </span>
          )}
          {code && (
            <>
              <code className="truncate font-mono text-xs">{code}</code>
              <CopyCode code={code} />
            </>
          )}
        </div>
        <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
          预览状态
          <Select value={state.preview} onValueChange={(v) => v && onPreview(v as PreviewState)}>
            <SelectTrigger
              size="sm"
              className="min-w-24 bg-background font-mono text-xs"
              aria-label="预览状态"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PREVIEW_STATES.map((s) => (
                <SelectItem key={s} value={s} className="font-mono text-xs">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>
    </div>
  )
}
