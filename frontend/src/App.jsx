import React from 'react';
import Header from './Header';
import Home from './Home';
import Transaction from './Pages/Transaction';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import ViewStocks from './Pages/ViewStocks';
import StockForm from './Pages/StockForm';
import LoginForm from './Pages/Login';
import PatientForm from './Pages/PatientForm';
import AllPatients from './Pages/AllPatients';
import BillHistory from './Pages/BillHistory';
import PurchaseEntry from './Pages/PurchaseEntry';
import PurchaseHistory from './Pages/PurchaseHistory';
function App() {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '',
    element: <App />,
    children: [
      {
        path: '/',
        element: <LoginForm />,
      },
      {
        path: '/home',
        element: <Home />,
      },
      {
        path: '/purchaseentry',
        element: <PurchaseEntry />,
      },
      {
        path: '/purchasehistory', // Add this new path
        element: <PurchaseHistory />,
      },
      {
        path: '/managepatients',
        element: <PatientForm />,
      },
      {
        path: '/allpatients',
        element: <AllPatients />,
      },
      {
        path: 'customers/:customerid',
        element: <Transaction />,
      },
      {
        path: '/managestocks',
        element: <StockForm />,
      },
      {
        path: '/viewstocks',
        element: <ViewStocks />,
      },
      {
        path: '/generatebill',
        element: <Transaction />,
      },
      {
        path: '/BillHistory',
        element: <BillHistory />,
      },
    ],
  },
]);

export default router;
