import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { BusinessProvider } from './context/BusinessContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BusinessProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                background: '#1f2937',
                color: '#f9fafb',
                fontSize: '14px',
                padding: '12px 16px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#ffffff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
              },
            }}
          />
          <AppRoutes />
        </BusinessProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
