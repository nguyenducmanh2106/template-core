import React, { useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import { Modal, Form, Button, message } from 'antd';
import UploadFile from '@/components/UploadFile/Index';

interface CreateFormProps {
  visible: boolean;
  onSubmit: (fileName: string, form: FormInstance) => void;
  onCancel: () => void;
}

const CreateForm: React.FC<CreateFormProps> = (props) => {
  const { visible, onSubmit, onCancel } = props;
  const [loading, setLoading] = useState<boolean>(false);

  const [form] = Form.useForm();
  const onFinish = async () => {
    try {
      setLoading(true);
      const fieldsValue = await form.validateFields();
      if (fieldsValue.isCheck == undefined) fieldsValue.isCheck = false;
      onSubmit(fieldsValue.fileName, form);
    } catch (error) {
      message.warning('Hãy nhập đủ các trường');
    }
    setLoading(false);
  };

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
          Hủy
        </Button>,
        <Button key='submit' type='primary' htmlType='submit' loading={loading} onClick={() => onFinish()}>
          Tìm kiếm
        </Button>,
      ]}
    >
      <Form form={form} name='postform' labelCol={{ span: 20 }}>
        <Form.Item name='fileName' labelAlign='left'>
          <UploadFile isOnlyExcel={true} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateForm;
