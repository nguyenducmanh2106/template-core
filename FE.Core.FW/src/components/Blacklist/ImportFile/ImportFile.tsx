import React, { useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Select,
  DatePicker,
  Col,
  Row,
  Upload,
  UploadFile,
  Switch,
  Divider,
} from 'antd';
import { BlacklistModel } from '@/apis';
import TextArea from 'antd/lib/input/TextArea';
import { UploadOutlined } from '@ant-design/icons';
import Dragger from 'antd/lib/upload/Dragger';
import { InboxOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';

interface CreateFormProps {
  visible: boolean;
  onSubmitLoading: boolean;
  onSubmit: (file: Blob) => void;
  onCancel: () => void;
}

const ImportFile: React.FC<CreateFormProps> = (props) => {
  const { visible, onSubmit, onSubmitLoading, onCancel } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [fileUpload, setFileUpload] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const onFinish = async () => {
    try {
      setLoading(true)
      const fieldsValue = await form.validateFields();
      if (fieldsValue.isCheck == undefined) fieldsValue.isCheck = false;
      onSubmit(fileUpload[0] as RcFile);
    } catch (error) {
      message.warning('Hãy nhập đủ các trường');
    }
    setLoading(false)
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
          Import
        </Button>,
      ]}
    >
      <Form form={form} name='postform' labelCol={{ span: 20 }}>
        <Form.Item name='fileName' labelAlign='left'>
          <Upload accept='.xlsx,.xls,.xlsm' fileList={fileUpload} showUploadList={{ showRemoveIcon: false }} maxCount={1}
            beforeUpload={(file, fileList) => {
              let fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
              let fileType = ['.xls', '.xlsx', '.xlsm'];
              if (!fileType.includes(fileExtension))
                message.error('File không được hỗ trợ');
              else
                setFileUpload(fileList);

              return false;
            }}>
            <Button icon={<UploadOutlined />}>Chọn file</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ImportFile;
