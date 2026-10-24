import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("browser-detect", "routes/browser-detect.tsx"),
  route("wave", "routes/wave.tsx"),
  route("defi-hacks", "routes/defi-hacks.tsx"),
] satisfies RouteConfig;
