export function Topology({ ascii }: { ascii: string }) {
  return (
    <pre className="my-3 p-4 border border-border rounded-lg bg-muted/20 text-xs font-mono leading-relaxed text-foreground/90 overflow-x-auto whitespace-pre">
      {ascii}
    </pre>
  );
}
