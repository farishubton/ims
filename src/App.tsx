import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Package, Scan, FileText, Database, Download } from 'lucide-react';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ScanPage } from './pages/ScanPage';
import { AuditPage } from './pages/AuditPage';
import { Button } from './components/ui/button';
import { exportToCSV } from './lib/utils';
import { useProducts } from './hooks/useProducts';
import { cn } from './lib/utils';

function Navigation() {
  const location = useLocation();
  const { products } = useProducts();

  const handleExport = () => {
    exportToCSV(products, 'inventory');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/scan', icon: Scan, label: 'Scan' },
    { path: '/audit', icon: FileText, label: 'Audit Log' },
  ];

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              <h1 className="text-xl font-bold">Offline IMS</h1>
            </div>
            <div className="flex gap-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={location.pathname === item.path ? 'default' : 'ghost'}
                    size="sm"
                    className={cn('gap-2')}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/audit" element={<AuditPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
