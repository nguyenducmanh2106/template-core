import { memo, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import Routes from '@/config/routes';

export default memo(() => {

  return (
    <ConfigProvider>
      <Routes />
    </ConfigProvider>
  );
});
