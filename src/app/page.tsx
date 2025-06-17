import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6">
        <Image src="/logo.svg" alt="Sneakpeak logo" width={120} height={32} />
      </header>
      <main className="flex-1 p-4 md:p-6">
        <h1 className="text-2xl font-bold">Welcome to Sneakpeak</h1>
        <p className="text-muted-foreground">
          Your project dashboard will be displayed here.
        </p>
      </main>
    </div>
  );
}
