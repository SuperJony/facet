import type { CSSProperties } from "react"
import { ArrowLeftRightIcon, MoonIcon, SunIcon } from "lucide-react"

import { Badge } from "@/showcase/ui/badge"
import { Button } from "@/showcase/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/showcase/ui/select"
import { Separator } from "@/showcase/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/showcase/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/showcase/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/showcase/ui/tooltip"
import pkg from "../../package.json"
import { Panel } from "./panel"
import { Stage } from "./stage"
import {
  AXIS_PROPS,
  MAT_TOKENS,
  THEMES,
  useShowcaseState,
  type AxisProp,
  type Scheme,
  type Theme,
  type View,
} from "./state"

const THEME_LABEL: Record<Theme, string> = { base: "Base", skeuo: "Skeuo" }

// ToggleGroup styled as a segmented control, matching the default TabsList look.
const segmented = "rounded-lg bg-muted p-[3px]"
const segment =
  "h-7 px-3 text-muted-foreground hover:bg-transparent aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm dark:aria-pressed:bg-input/50"

function FacetMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden="true">
      <path d="M12 2 21 8.5 17.5 21h-11L3 8.5Z" className="fill-foreground" />
      <path
        d="M3 8.5h18M12 2 8 8.5 12 21l4-12.5L12 2"
        className="stroke-background"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AxisSelect({
  label,
  value,
  onChange,
}: {
  label: string
  value: AxisProp
  onChange: (p: AxisProp) => void
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      {label}
      <Select value={value} onValueChange={(v) => v && onChange(v as AxisProp)}>
        <SelectTrigger size="sm" className="min-w-24 font-mono text-xs" aria-label={`${label}轴`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {AXIS_PROPS.map((p) => (
            <SelectItem key={p} value={p} className="font-mono text-xs">
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  )
}

export function App() {
  const { state, update, setAxis } = useShowcaseState()
  const matStyle = Object.fromEntries(
    MAT_TOKENS.filter((t) => state.mat[t.key] !== undefined).map((t) => [
      t.key,
      `${state.mat[t.key]}${t.unit}`,
    ]),
  ) as CSSProperties

  return (
    <TooltipProvider>
      <div className="flex h-svh min-w-5xl flex-col bg-background text-foreground">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b px-5">
          <div className="flex items-center gap-2.5">
            <FacetMark />
            <span className="text-[15px] font-semibold tracking-tight">facet</span>
            <Badge variant="outline" className="font-mono text-[11px] text-muted-foreground">
              v{pkg.version}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <ToggleGroup
              aria-label="主题"
              size="sm"
              spacing={0.5}
              className={segmented}
              value={[state.theme]}
              onValueChange={(v) => v[0] && update({ theme: v[0] as Theme })}
            >
              {THEMES.map((t) => (
                <ToggleGroupItem key={t} value={t} className={segment}>
                  {THEME_LABEL[t]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Separator orientation="vertical" className="h-5" />
            <ToggleGroup
              aria-label="亮暗模式"
              size="sm"
              spacing={0.5}
              className={segmented}
              value={[state.scheme]}
              onValueChange={(v) => v[0] && update({ scheme: v[0] as Scheme })}
            >
              <ToggleGroupItem value="light" aria-label="亮色" className={segment}>
                <SunIcon />
              </ToggleGroupItem>
              <ToggleGroupItem value="dark" aria-label="暗色" className={segment}>
                <MoonIcon />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <nav aria-label="组件" className="flex w-48 shrink-0 flex-col gap-0.5 border-r p-3">
            <span className="px-2.5 pt-1 pb-2 text-xs font-medium text-muted-foreground">组件</span>
            <a
              href="#button"
              aria-current="page"
              className="flex h-9 items-center justify-between rounded-lg bg-muted px-2.5 text-sm font-medium"
            >
              Button
            </a>
            <span
              aria-disabled="true"
              className="flex h-9 items-center justify-between rounded-lg px-2.5 text-sm text-muted-foreground"
            >
              Popover
              <Badge variant="secondary" className="text-[11px] font-normal">
                里程碑 2
              </Badge>
            </span>
          </nav>

          <main id="button" className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 bg-muted/40 p-6">
            {/* One row of fixed height: switching views only adds or removes the axis controls. */}
            <div className="flex h-9 shrink-0 items-center gap-4">
              <h1 className="mr-auto text-xl font-semibold tracking-tight">Button</h1>
              {state.view === "matrix" && (
                <div className="flex items-center gap-1.5">
                  <AxisSelect label="行" value={state.row} onChange={(p) => setAxis("row", p)} />
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="交换行列"
                          onClick={() => update({ row: state.col, col: state.row })}
                        />
                      }
                    >
                      <ArrowLeftRightIcon />
                    </TooltipTrigger>
                    <TooltipContent>交换行列</TooltipContent>
                  </Tooltip>
                  <AxisSelect label="列" value={state.col} onChange={(p) => setAxis("col", p)} />
                </div>
              )}
              <Tabs value={state.view} onValueChange={(v) => update({ view: v as View })}>
                <TabsList>
                  <TabsTrigger value="single" className="px-3">
                    单个
                  </TabsTrigger>
                  <TabsTrigger value="matrix" className="px-3">
                    矩阵
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Stage state={state} matStyle={matStyle} onPreview={(preview) => update({ preview })} />
          </main>

          <Panel state={state} update={update} />
        </div>
      </div>
    </TooltipProvider>
  )
}
