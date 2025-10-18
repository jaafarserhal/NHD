import { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { RouteObject } from 'react-router';

import SidebarLayout from 'src/layouts/SidebarLayout';
import BaseLayout from 'src/layouts/BaseLayout';

import SuspenseLoader from 'src/components/SuspenseLoader';
import AddProduct from './portal/products/Add';
import EditProduct from './portal/products/Update';
import AddDate from './portal/dates/Add';
import EditDate from './portal/dates/Update';
import Login from './portal/auth/Login';

import { RouterUrls } from './common/RouterUrls';
import ProtectedRoute from './protectedRoutes/Index';
import Collections from './portal/collections/Index';
import AddCollection from './portal/collections/Add';
import UpdateCollection from './portal/collections/Update';

const Loader = (Component) => (props) => (
  <Suspense fallback={<SuspenseLoader />}>
    <Component {...props} />
  </Suspense>
);

// Applications
const Products = Loader(lazy(() => import('src/portal/products/Index')));
const Transactions = Loader(lazy(() => import('src/portal/transactions/Index')));
const Dates = Loader(lazy(() => import('src/portal/dates/Index')));
const Orders = Loader(lazy(() => import('src/portal/orders/Index')));
const Customers = Loader(lazy(() => import('src/portal/customers/Index')));
const Addresses = Loader(lazy(() => import('src/portal/addresses/Index')));
const Galleries = Loader(lazy(() => import('src/portal/gallery/Index')));

const routes: RouteObject[] = [
  {
    path: '/', // base route for the app
    element: (
      <ProtectedRoute>
        <SidebarLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Products /> },
      { path: RouterUrls.productAdd, element: <AddProduct /> },
      { path: RouterUrls.productEdit, element: <EditProduct /> },
      { path: RouterUrls.datesList, element: <Dates /> },
      { path: RouterUrls.dateAdd, element: <AddDate /> },
      { path: RouterUrls.dateEdit, element: <EditDate /> },
      { path: RouterUrls.ordersList, element: <Orders /> },
      { path: RouterUrls.customersList, element: <Customers /> },
      { path: RouterUrls.addressesList, element: <Addresses /> },
      { path: RouterUrls.transactionsList, element: <Transactions /> },
      { path: RouterUrls.productsGallery, element: <Galleries /> },
      { path: RouterUrls.datesGallery, element: <Galleries /> },
      { path: RouterUrls.collectionsList, element: <Collections /> },
      { path: RouterUrls.collectionAdd, element: <AddCollection /> },
      { path: RouterUrls.collectionEdit, element: <UpdateCollection /> },
    ]
  },
  {
    path: '/auth',
    element: <BaseLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: '', element: <Navigate to="/auth/login" replace /> }
    ]
  },
  { path: '*', element: <Navigate to="/" replace /> }
];

export default routes;
