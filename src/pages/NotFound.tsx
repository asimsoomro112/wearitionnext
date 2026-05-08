import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-6xl md:text-8xl mb-4 text-foreground">404</h1>
      <p className="text-foreground/60 mb-8 font-sans">The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="px-8 py-4 bg-foreground text-background text-xs font-medium uppercase tracking-[0.2em] hover:bg-accent transition-colors">
        Return Home
      </Link>
    </div>
  );
}
