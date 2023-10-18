import { memo } from 'react';
import { Button, Form } from 'antd';
import style from './index.module.less';
import { removeToken } from '@/utils/localToken';

export default memo(() => {
  removeToken();
  const handleLoginWithWSO2 = () => {
    window.location.href =
      import.meta.env.VITE_HOST_WSO2 +
      import.meta.env.VITE_HOST_TENANT_IIG + '/oauth2/authorize?response_type=code&client_id=' +
      import.meta.env.VITE_CLIENT_ID_WSO2 +
      '&nonce=asd&redirect_uri=' +
      import.meta.env.VITE_REDIRECT_URI_WSO2 +
      '&scope=openid';
  };

  return (
    <div className={style.main}>
      <h1 className={style.title}>{'Đăng nhập'}</h1>
      <Form name='basic'>
        <Form.Item>
          <Button type='primary' className={style.submit} loading={false} onClick={handleLoginWithWSO2}>
            {'Đăng nhập với WSO2 Identity Server'}
          </Button>
        </Form.Item>

      </Form>
    </div>
  );
});
