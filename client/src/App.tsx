import React, { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link, RouteProps
} from 'react-router-dom';
import './App.css';
import { ProtectedRoute, routes } from './components';
import { AppBar, Box, Tab, Tabs } from './components/lib';

interface PublicRouteProps extends RouteProps {
  component: any;
  path:any;
}

export const App = () => {
  const [environment] = useState((process.env.NODE_ENV));
  const [value, setValue] = useState(window.location.pathname);

  const renderTabs = (label, value, index) => <Tab key={index} value={value} label={label} component={Link} to={value}/>;

  const renderRoutes = (index, production, props:PublicRouteProps ) => {
    // eslint-disable-next-line react/prop-types
    const { component: Component, path } = props;
    if (!production) {
      return (<Route key = {index} path={path} element={<ProtectedRoute/>}>
        <Route path={path} element = {<Component/>}/>
      </Route>);
    } else {
      return (<Route key = {index} path={path} element = {<Component />}/>);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


  return (
    <BrowserRouter>
      <AppBar sx={{ height: '40px' }}>
        <Tabs
          textColor="secondary"
          indicatorColor="secondary"
          variant="scrollable"
          scrollButtons="auto"
          onChange={handleChange}
          value={value}
        >{
            routes.map((ele, index) => environment.toLowerCase() !== 'development' && !ele.production? null :
                renderTabs(ele.label, ele.path, index))
          }
        </Tabs>
      </AppBar>
      <Box sx={{ marginTop: '40px', padding: '8px', boxSizing: 'border-box', height: '100%', width: '100%' }}>
        <Routes>
          { routes.map((ele, index) => {
            const routeProps:PublicRouteProps = {
              path: ele.path,
              component: ele.component
            };
            return renderRoutes(index, ele.production, routeProps);
          })}
        </Routes>
      </Box>
    </BrowserRouter>
  );
};
