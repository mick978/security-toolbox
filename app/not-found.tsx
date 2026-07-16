import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container py-20 text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="mt-4 text-muted-foreground">这条命令没查到</p>
      <Link href="/" className="mt-6 inline-block text-primary hover:underline">← 回首页</Link>
    </div>
  );
}
