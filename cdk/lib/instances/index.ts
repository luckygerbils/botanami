import { Beta } from "./beta";
import { Prod } from "./prod";

export * from "./beta";
export * from "./prod";

export type AppInstance = typeof Beta | typeof Prod;