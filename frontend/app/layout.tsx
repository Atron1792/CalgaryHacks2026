// frontend/app/layout.tsx
import Sidebar from './components/sidebar';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="layout-root">
        <div className="layout-grid">
          <Sidebar />
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}