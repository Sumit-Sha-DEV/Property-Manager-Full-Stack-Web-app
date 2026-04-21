// This layout intentionally renders WITHOUT TopBar and BottomNav.
// The property details page has its own custom sticky header.
export default function PropertyDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
