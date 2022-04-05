import { useMemo } from "react";
import { createSimulation, Simulation, SimulationOptions } from "./simulation";

export default function useSimulation(opts: SimulationOptions): Simulation {
  return useMemo(() => createSimulation(opts), [opts]);
}
