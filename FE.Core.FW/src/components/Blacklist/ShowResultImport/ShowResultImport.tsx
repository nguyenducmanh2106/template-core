import React, { useState } from 'react';
import { Modal, Button } from 'antd';

interface CreateFormProps {
  visible: boolean;
  values?: string;
  onCancel: () => void;
}

const ShowResultImport: React.FC<CreateFormProps> = (props) => {
  const { visible, values, onCancel } = props;
  if (values != undefined) {
    const textAr = values.split('|||') as string[];
    return (
      <Modal
        destroyOnClose
        width={'30%'}
        maskClosable={false}
        title='Import file danh sách'
        open={visible}
        onCancel={onCancel}
        footer={[
          <Button key='back' onClick={() => onCancel()}>
            Đóng
          </Button>,
        ]}
      >
        <label className='fontBold'>{textAr[0]}</label><br />
        <label className='fontBold'>{textAr.length > 1 ? textAr[1] : ''}</label>
      </Modal>
    );
  } else {
    return (
      <Modal
        destroyOnClose
        width={'30%'}
        maskClosable={false}
        title='Import file danh sách'
        open={visible}
        onCancel={onCancel}
        footer={[
          <Button key='back' onClick={() => onCancel()}>
            Đóng
          </Button>,
        ]}
      ></Modal>
    );
  }
};

export default ShowResultImport;
