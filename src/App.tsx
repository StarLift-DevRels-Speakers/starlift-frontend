import { RouterProvider } from 'react-router';
import { router } from '@/app/router';
import { ToastProvider } from '@/components/ui';
import { DemoStoreProvider } from '@/store/DemoStoreProvider';

function App() {
  return (
    <DemoStoreProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </DemoStoreProvider>
  );
}

export default App;
