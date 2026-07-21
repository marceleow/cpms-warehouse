import { Link } from "@tanstack/react-router";
import { HomeIcon } from "lucide-react";
import { buttonVariants } from "./ui/button";

export default function NotFound() {
  return (
    <div className="h-dvh flex flex-col gap-2 items-center justify-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl font-semibold">page not found</p>
      <Link to="/" className={buttonVariants()}>
        <HomeIcon />
        go back
      </Link>
    </div>
  );
}
