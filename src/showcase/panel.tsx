import { useState, type ReactNode } from "react";
import { CheckIcon, CopyIcon, InfoIcon, RotateCcwIcon } from "lucide-react";

import { Badge } from "@/showcase/ui/badge";
import { Button } from "@/showcase/ui/button";
import { Input } from "@/showcase/ui/input";
import { Label } from "@/showcase/ui/label";
import { Slider } from "@/showcase/ui/slider";
import { Switch } from "@/showcase/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/showcase/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/showcase/ui/toggle-group";
import {
  AXIS_PROPS,
  AXIS_VALUES,
  MAT_TOKENS,
  matCss,
  type AxisProp,
  type MatKey,
  type ShowcaseState,
} from "./state";

type Update = (patch: Partial<ShowcaseState>) => void;

function Field({
  label,
  count,
  aside,
  children,
}: {
  label: string;
  count?: number;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex min-h-5 items-center justify-between gap-2">
        <span className="font-mono text-xs font-medium">
          {label}
          {count !== undefined && (
            <span className="ml-1.5 font-normal text-muted-foreground">
              {count}
            </span>
          )}
        </span>
        {aside}
      </div>
      {children}
    </div>
  );
}

function PropsTab({ state, update }: { state: ShowcaseState; update: Update }) {
  const axisOf = (p: AxisProp) =>
    state.view !== "matrix"
      ? null
      : state.row === p
        ? "行"
        : state.col === p
          ? "列"
          : null;
  const setFixed = (patch: Partial<ShowcaseState["fixed"]>) =>
    update({ fixed: { ...state.fixed, ...patch } });

  return (
    <div className="flex flex-col gap-6">
      {AXIS_PROPS.map((name) => {
        const axis = axisOf(name);
        const count =
          name === "disabled" ? undefined : AXIS_VALUES[name].length;
        if (axis) {
          return (
            <Field
              key={name}
              label={name}
              count={count}
              aside={
                <Badge
                  variant="secondary"
                  className="font-normal text-muted-foreground"
                >
                  在{axis}展开
                </Badge>
              }
            />
          );
        }
        if (name === "disabled") {
          return (
            <Field
              key={name}
              label={name}
              aside={
                <Switch
                  aria-label="disabled"
                  checked={state.fixed.disabled}
                  onCheckedChange={(disabled) => setFixed({ disabled })}
                />
              }
            />
          );
        }
        return (
          <Field key={name} label={name} count={count}>
            <ToggleGroup
              aria-label={name}
              variant="outline"
              size="sm"
              spacing={1}
              className="flex-wrap"
              value={[state.fixed[name]]}
              onValueChange={(v) => v[0] && setFixed({ [name]: v[0] })}
            >
              {AXIS_VALUES[name].map((v) => (
                <ToggleGroupItem
                  key={v}
                  value={v}
                  className="font-mono text-xs font-normal text-muted-foreground aria-pressed:border-foreground/70 aria-pressed:bg-background aria-pressed:text-foreground dark:aria-pressed:bg-input/50"
                >
                  {v}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
        );
      })}
      <Field label="children">
        <Input
          value={state.label}
          onChange={(e) => update({ label: e.target.value })}
          aria-label="children"
        />
      </Field>
    </div>
  );
}

function ParamsTab({
  state,
  update,
}: {
  state: ShowcaseState;
  update: Update;
}) {
  const [copied, setCopied] = useState(false);
  const set = (key: MatKey, n: number) => {
    if (Number.isNaN(n)) return;
    const { min, max } = MAT_TOKENS.find((t) => t.key === key)!;
    update({ mat: { ...state.mat, [key]: Math.min(max, Math.max(min, n)) } });
    setCopied(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {state.theme === "base" && (
        <p className="flex gap-2 rounded-lg border border-dashed px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
          <InfoIcon className="mt-px size-3.5 shrink-0" />
          基线主题不读取这些参数，切到 Skeuo 才能看到变化。
        </p>
      )}
      {MAT_TOKENS.map((t) => {
        const value = state.mat[t.key] ?? t.default;
        const id = `mat-${t.key}`;
        return (
          <div key={t.key} className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-2">
              <Label htmlFor={id} className="text-[13px]">
                {t.label}
              </Label>
              <span className="font-mono text-[11px] text-muted-foreground">
                {t.key}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Slider
                aria-label={t.label}
                min={t.min}
                max={t.max}
                step={t.step}
                value={[value]}
                onValueChange={(v) => set(t.key, Array.isArray(v) ? v[0] : v)}
                className="flex-1"
              />
              <div className="relative w-20 shrink-0">
                <Input
                  id={id}
                  type="number"
                  min={t.min}
                  max={t.max}
                  step={t.step}
                  value={value}
                  onChange={(e) =>
                    e.target.value !== "" && set(t.key, Number(e.target.value))
                  }
                  className="h-7 pr-6 text-right font-mono text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center font-mono text-[11px] text-muted-foreground">
                  {t.unit}
                </span>
              </div>
            </div>
          </div>
        );
      })}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button
          variant="outline"
          onClick={() => {
            update({ mat: {} });
            setCopied(false);
          }}
        >
          <RotateCcwIcon data-icon="inline-start" />
          重置
        </Button>
        <Button
          onClick={() =>
            navigator.clipboard
              .writeText(matCss(state.mat))
              .then(() => setCopied(true))
          }
        >
          {copied ? (
            <CheckIcon data-icon="inline-start" />
          ) : (
            <CopyIcon data-icon="inline-start" />
          )}
          {copied ? "已复制" : "复制 CSS"}
        </Button>
      </div>
    </div>
  );
}

export function Panel({
  state,
  update,
}: {
  state: ShowcaseState;
  update: Update;
}) {
  return (
    <aside
      aria-label="控制面板"
      className="flex min-h-0 w-72 shrink-0 flex-col border-l"
    >
      <Tabs defaultValue="props" className="min-h-0 flex-1 gap-0">
        <TabsList
          variant="line"
          className="h-12 w-full shrink-0 justify-start gap-4 border-b px-5"
        >
          <TabsTrigger value="props" className="flex-none px-0">
            Props
          </TabsTrigger>
          <TabsTrigger value="params" className="flex-none px-0">
            参数
          </TabsTrigger>
        </TabsList>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <TabsContent value="props">
            <PropsTab state={state} update={update} />
          </TabsContent>
          <TabsContent value="params">
            <ParamsTab state={state} update={update} />
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}
