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

const Loader = (Component) => (props) =>
(
  <Suspense fallback={<SuspenseLoader />}>
    <Component {...props} />
  </Suspense>
);

// Applications

const Products = Loader(
  lazy(() => import('src/portal/products/Index'))
);
const Transactions = Loader(
  lazy(() => import('src/portal/transactions/Index'))
);
const Dates = Loader(
  lazy(() => import('src/portal/dates/Index'))
);
const Orders = Loader(
  lazy(() => import('src/portal/orders/Index'))
);

const Customers = Loader(
  lazy(() => import('src/portal/customers/Index'))
);
const Addresses = Loader(
  lazy(() => import('src/portal/addresses/Index'))
);


const routes: RouteObject[] = [
  {
    path: '',
    element: <SidebarLayout />,
    children: [
      {
        path: '/',
        element: <Products />
      },
      {
        path: RouterUrls.boxesList,
        element: <Navigate to="/" replace />
      },
      {
        path: RouterUrls.boxAdd,
        element: <AddProduct />
      },
      {
        path: RouterUrls.boxEdit,
        element: <EditProduct />
      },
      {
        path: RouterUrls.datesList,
        element: <Dates />
      },
      {
        path: RouterUrls.dateAdd,
        element: <AddDate />
      },
      {
        path: RouterUrls.dateEdit,
        element: <EditDate />
      },
      {
        path: RouterUrls.ordersList,
        element: <Orders />
      },
      {
        path: RouterUrls.customersList,
        element: <Customers />
      },
      {
        path: RouterUrls.addressesList,
        element: <Addresses />
      },
      {
        path: RouterUrls.transactionsList,
        element: <Transactions />
      }
    ]
  },
  {
    path: '/auth',
    element: <BaseLayout />,
    children: [
      {
        path: 'login',
        element: <Login />
      },
      {
        path: '',
        element: <Navigate to="login" replace />
      }
    ]
  }
];


// const routes: RouteObject[] = [
//   {
//     path: '',
//     element: <BaseLayout />,
//     children: [
//       {
//         path: '/',
//         element: <Overview />
//       },
//       {
//         path: 'overview',
//         element: <Navigate to="/" replace />
//       },
//       {
//         path: 'status',
//         children: [
//           {
//             path: '',
//             element: <Navigate to="404" replace />
//           },
//           {
//             path: '404',
//             element: <Status404 />
//           },
//           {
//             path: '500',
//             element: <Status500 />
//           },
//           {
//             path: 'maintenance',
//             element: <StatusMaintenance />
//           },
//           {
//             path: 'coming-soon',
//             element: <StatusComingSoon />
//           }
//         ]
//       },
//       {
//         path: '*',
//         element: <Status404 />
//       }
//     ]
//   },
//   {
//     path: 'dashboards',
//     element: <SidebarLayout />,
//     children: [
//       {
//         path: '',
//         element: <Navigate to="crypto" replace />
//       },
//       {
//         path: 'crypto',
//         element: <Crypto />
//       },
//       {
//         path: 'messenger',
//         element: <Messenger />
//       }
//     ]
//   },
//   {
//     path: 'management',
//     element: <SidebarLayout />,
//     children: [
//       {
//         path: '',
//         element: <Navigate to="transactions" replace />
//       },
//       {
//         path: 'transactions',
//         element: <Transactions />
//       },
//       {
//         path: 'profile',
//         children: [
//           {
//             path: '',
//             element: <Navigate to="details" replace />
//           },
//           {
//             path: 'details',
//             element: <UserProfile />
//           },
//           {
//             path: 'settings',
//             element: <UserSettings />
//           }
//         ]
//       }
//     ]
//   },
//   {
//     path: '/components',
//     element: <SidebarLayout />,
//     children: [
//       {
//         path: '',
//         element: <Navigate to="buttons" replace />
//       },
//       {
//         path: 'buttons',
//         element: <Buttons />
//       },
//       {
//         path: 'modals',
//         element: <Modals />
//       },
//       {
//         path: 'accordions',
//         element: <Accordions />
//       },
//       {
//         path: 'tabs',
//         element: <Tabs />
//       },
//       {
//         path: 'badges',
//         element: <Badges />
//       },
//       {
//         path: 'tooltips',
//         element: <Tooltips />
//       },
//       {
//         path: 'avatars',
//         element: <Avatars />
//       },
//       {
//         path: 'cards',
//         element: <Cards />
//       },
//       {
//         path: 'forms',
//         element: <Forms />
//       }
//     ]
//   }
// ];

export default routes;
