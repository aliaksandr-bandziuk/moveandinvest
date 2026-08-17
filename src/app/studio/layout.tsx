// Studio lives outside the [locale] segment and outside the site's own
// layout on purpose: it ships its own reset and its own typography, and the
// site's globals.scss would fight both. The proxy matcher already excludes
// /studio from locale handling.
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
