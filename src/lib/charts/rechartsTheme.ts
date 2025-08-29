
import { BABY_BLUE_PALETTE } from "@/lib/palette";
import * as Recharts from "recharts";

/* Recharts doesn’t have a single “setOptions” so we shim styling by
   wrapping Pie/Line/Bar default props via proxies. */
let initialized = false;

export function initRechartsPalette() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  // Patch Pie to default each Cell fill to our palette when not provided
  const OriginalPie: any = (Recharts as any).Pie;
  (Recharts as any).Pie = (props: any) => {
    if (!props.children) return OriginalPie(props);
    // If there are Cells without fill, inject palette
    let idx = 0;
    const children = Array.isArray(props.children) ? props.children : [props.children];
    const patched = children.map((child: any) =>
      child?.type?.displayName === 'Cell' && !child.props?.fill
        ? { ...child, props: { ...child.props, fill: BABY_BLUE_PALETTE[(idx++) % BABY_BLUE_PALETTE.length] } }
        : child
    );
    return OriginalPie({ ...props, children: patched });
  };

  // For Bar/Line areas, if no stroke/background specified, apply palette by dataset index
  const patchSeries = (CompName: "Bar"|"Line"|"Area") => {
    const OriginalComp: any = (Recharts as any)[CompName];
    (Recharts as any)[CompName] = (props: any) => {
      const idx = props?.["dataKeyIndex"] ?? props?.["__index__"] ?? 0;
      const color = BABY_BLUE_PALETTE[idx % BABY_BLUE_PALETTE.length];
      const next = { stroke: color, fill: props.fill ?? color, ...props };
      return OriginalComp(next);
    };
  };

  patchSeries("Bar");
  patchSeries("Line");
  patchSeries("Area");
}
