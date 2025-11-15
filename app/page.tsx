export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-6xl font-bold">Bread Baddies</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          A modern community crowdfunding platform where communities come together
          to propose ideas, vote on proposals, and fund projects that matter.
        </p>
        <div className="flex gap-4">
          <a
            href="/login"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Get Started
          </a>
          <a
            href="#features"
            className="px-6 py-3 border border-border rounded-md hover:bg-accent transition-colors"
          >
            Learn More
          </a>
        </div>
      </main>
    </div>
  );
}
