import { memo, Suspense } from 'react';
import { Link } from 'react-router-dom';
import classnames from 'classnames';

import { useRecoilState } from 'recoil';
import { globalState, useGlobalState } from '@/store/global';
import IconSvg from '@/components/IconSvg';
import BreadCrumbs from '@/components/BreadCrumbs';

import logo from '@/assets/images/logo.png';
import RightTabNav from './RightTabNav';
import SiderMenu from './SiderMenu';
import RightTopUser from './RightTopUser';
import RightTopMessage from './RightTopMessage';

import Settings from './Settings';

import { IRouter, IPathKeyRouter, BreadcrumbType } from '@/@types/router';

export interface RightTopProps {
  menuData: IRouter[];
  jsonMenuData: IPathKeyRouter;
  routeItem: IRouter;
  userRoles?: string[];
  breadCrumbs?: BreadcrumbType[];
}

export default memo(({ menuData, jsonMenuData, routeItem, userRoles = [], breadCrumbs = [] }: RightTopProps) => {
  // const [global, setGlobal] = useRecoilState(globalState);
  const [global, setGlobal] = useRecoilState(useGlobalState);

  const toggleCollapsed = () => {
    setGlobal({ ...global, collapsed: !global.collapsed });
  };

  return (
    <div
      id='universallayout-right-top'
      className={classnames({
        fiexd: global.headFixed,
        narrow: global.collapsed,
        tabNavEnable: !global.tabNavEnable,
        navModeHorizontal: global.navMode === 'horizontal',
      })}
    >
      <div className='universallayout-right-top-header'>
        {global.navMode === 'inline' ? (
          <div className='universallayout-right-top-top'>
            <div className='universallayout-flexible' onClick={toggleCollapsed}>
              {global.collapsed ? <IconSvg name='menu-unfold'></IconSvg> : <IconSvg name='menu-fold'></IconSvg>}
            </div>
            <div className='universallayout-top-menu'>
              <BreadCrumbs className='breadcrumb' list={breadCrumbs} />
            </div>
            <div className='universallayout-top-menu-right'>
              <Suspense fallback={<>...</>}>
                <RightTopMessage />
              </Suspense>
              <RightTopUser />
              <Settings />
            </div>
          </div>
        ) : (
          <div className='universallayout-right-top-top menu'>
            <div className='universallayout-right-top-logo'>
              <Link to='/' className='logo-url'>
                <img alt='' src={logo} width='30' />
                <h3 className='logo-title'>ICom</h3>
              </Link>
            </div>
            <div className='universallayout-top-menu'>
              <SiderMenu
                userRoles={userRoles}
                menuData={menuData}
                routeItem={routeItem}
                theme={global.theme}
                mode='horizontal'
              />
            </div>
            <div className='universallayout-top-menu-right'>
              <Suspense fallback={<>...</>}>
                <RightTopMessage />
              </Suspense>
              <RightTopUser />
              <Settings />
            </div>
          </div>
        )}
        {global.tabNavEnable && <RightTabNav routeItem={routeItem} jsonMenuData={jsonMenuData} />}
      </div>
    </div>
  );
});
