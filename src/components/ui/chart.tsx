"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

// Tipos correctos para v3
 import type { TooltipContentProps } from "recharts";
import type {
  Payload as TooltipItem,
} from "recharts/types/component/DefaultTooltipContent";
import type {
  LegendPayload,
} from "recharts/types/component/DefaultLegendContent";

type TooltipValue = number | string | Array<number | string>;
type TooltipName = string | number;

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, c]) => c.theme || c.color
  );
  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .filter(Boolean)
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

type MyTooltipProps = TooltipContentProps<TooltipValue, TooltipName> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
    color?: string;
  };

function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: MyTooltipProps) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  const items = payload as ReadonlyArray<TooltipItem<TooltipValue, TooltipName>>;
  const nestLabel = items.length === 1 && indicator !== "dot";

  const tooltipLabel = !hideLabel
    ? (() => {
        const first = items[0];
        const key = `${labelKey || first?.dataKey || first?.name || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, first, key);
        const value =
          !labelKey && typeof label === "string"
            ? config[label as keyof typeof config]?.label || label
            : itemConfig?.label;

        if (labelFormatter) {
          return (
            <div className={cn("font-medium", labelClassName)}>
              {labelFormatter(value, items as any)}
            </div>
          );
        }
        if (!value) return null;
        return <div className={cn("font-medium", labelClassName)}>{value}</div>;
      })()
    : null;

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}

      <div className="grid gap-1.5">
        {items.map((item, index) => {
          const key = `${nameKey || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item as any, key);

          // color del indicador (intenta varias fuentes)
          const inner: any = item.payload ?? {};
          const indicatorColor =
            color ||
            (typeof item.color === "string" ? item.color : undefined) ||
            inner.fill ||
            inner.stroke;

          const numeric =
            typeof item.value === "number"
              ? item.value
              : Number.isFinite(Number(item.value))
              ? Number(item.value)
              : undefined;

          return (
            <div
              key={String(item.dataKey ?? index)}
              className={cn(
                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                indicator === "dot" && "items-center"
              )}
            >
              {formatter && item.value !== undefined && item.name ? (
                // firma típica: (value, name, item, index, payloadArray)
                formatter(
                  item.value,
                  item.name as any,
                  item as any,
                  index,
                  items as any
                )
              ) : (
                <>
                  {!hideIndicator && (
                    <div
                      className={cn(
                        "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                        {
                          "h-2.5 w-2.5": indicator === "dot",
                          "w-1": indicator === "line",
                          "w-0 border-[1.5px] border-dashed bg-transparent":
                            indicator === "dashed",
                          "my-0.5": nestLabel && indicator === "dashed",
                        }
                      )}
                      style={
                        {
                          "--color-bg": indicatorColor,
                          "--color-border": indicatorColor,
                        } as React.CSSProperties
                      }
                    />
                  )}

                  <div
                    className={cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center"
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label ?? item.name}
                      </span>
                    </div>

                    {numeric !== undefined ? (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {numeric.toLocaleString()}
                      </span>
                    ) : item.value != null ? (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {String(item.value)}
                      </span>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

type MyLegendProps = React.ComponentProps<"div"> & {
  payload?: ReadonlyArray<LegendPayload>;
  verticalAlign?: "top" | "bottom" | "middle";
  hideIcon?: boolean;
  nameKey?: string;
};

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: MyLegendProps) {
  if (!payload?.length) return null;

  const cast = payload as ReadonlyArray<LegendPayload>;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {cast.map((item, idx) => {
        const key = `${nameKey || (item.dataKey as string) || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(
          useChart().config,
          item as any,
          key
        );

        return (
          <div
            key={String(item.value ?? idx)}
            className="[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: String(item.color ?? "") }}
              />
            )}
            {itemConfig?.label ?? item.value}
          </div>
        );
      })}
    </div>
  );
}

// Helper para extraer config desde un payload (tooltip o legend)
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payloadItem: unknown,
  key: string
) {
  if (typeof payloadItem !== "object" || payloadItem === null) return undefined;

  const anyItem = payloadItem as Record<string, unknown>;
  const inner =
    typeof anyItem.payload === "object" && anyItem.payload !== null
      ? (anyItem.payload as Record<string, unknown>)
      : undefined;

  let configLabelKey = key;

  if (typeof anyItem[key] === "string") {
    configLabelKey = anyItem[key] as string;
  } else if (inner && typeof inner[key] === "string") {
    configLabelKey = inner[key] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : (config[key as keyof typeof config] as ChartConfig[string] | undefined);
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
