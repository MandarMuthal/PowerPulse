import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <p className="font-display text-9xl font-extrabold text-lime-400">404</p>
      <h1 className="mt-2 text-5xl">This page does not exist</h1>
      <p className="mx-auto mt-3 max-w-md text-iron-300">The link may be broken or the page may have moved.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/" className="btn-primary">Go home</Link>
        <Link to="/exercises" className="btn-outline">Browse exercises</Link>
      </div>
    </div>
  );
}
