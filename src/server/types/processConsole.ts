type ProcessConsoleProps = {
  type: "log" | "error" | "warn" | "info";
  message: string;
};

export function processConsole({ type, message }: ProcessConsoleProps) {
  console[type](message);
}
