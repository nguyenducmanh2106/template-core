import { useUserState } from '@/store/user';
import { hasPermissionRoles } from '@/utils/router';
import { Button, Result } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

const Forbidden = (
  <Result
    status={403}
    title='403'
    subTitle='Bạn không có quyền truy cập trang web'
    extra={
      <Button type='primary'>
        <Link to='home/workplace'>Trang chủ</Link>
      </Button>
    }
  />
);

export interface ALinkProps {
  children: React.ReactNode;
  navigation?: string;
  bitPermission?: number;
  noNode?: React.ReactNode;
}

/**
 * 
 * @param navigation: mã của navigation
 * @param bitPermission: mã của mã bit của action
 * @returns 
 */
const Permission: React.FC<ALinkProps> = ({ navigation, bitPermission, noNode = Forbidden, children }) => {
  const user = useRecoilValue(useUserState);
  const permissions = user.permissions
  return hasPermissionRoles(permissions, navigation, bitPermission) ? <>{children}</> : <>{noNode}</>;
};

export default Permission;
