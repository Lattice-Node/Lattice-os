export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/workspace/:path*", "/publish/:path*"],
};
