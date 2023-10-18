import { errorMessage } from '@/utils/constants';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Col, Form, message, Modal, Row, Space, Upload, UploadFile } from 'antd';
import { RcFile } from 'antd/es/upload/interface';
import { set } from 'lodash';
import { useEffect, useState } from 'react';
import { getDownloadImportTemplate } from '../../apis/services/BlacklistTopikService';

interface ImportFormProps {
  isOpen: boolean;
  onSubmit: (file: Blob) => Promise<void>;
  onCancel: () => void;
}

const ImportForm: React.FC<ImportFormProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingDownload, setLoadingDownload] = useState<boolean>(false);
  const [fileUpload, setFileUpload] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const onFinish = async () => {
    try {
      setLoading(true);
      await form.validateFields();
      await props.onSubmit(fileUpload[0] as RcFile);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { setFileUpload([]); form.resetFields(); }, [props.isOpen]);

  return (
    <Modal
      destroyOnClose
      width={'30%'}
      maskClosable={false}
      title='Import file danh sách'
      open={props.isOpen}
      onCancel={props.onCancel}
      footer={[
        <Button key='back' onClick={() => props.onCancel()}>
          Hủy
        </Button>,
        <Button key='submit' type='primary' htmlType='submit' loading={loading} onClick={() => onFinish()}>
          Import
        </Button>,
      ]}
    >
      <Form form={form}>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            <Button key='download' type='link' loading={loadingDownload} onClick={() => {
              setLoadingDownload(true);
              getDownloadImportTemplate()
                .then(response => {
                  var url = URL.createObjectURL(response);
                  var elm = document.createElement('a');
                  elm.href = url;
                  elm.setAttribute('download', `blacklist_import_template.xlsx`);
                  elm.click();
                  elm.remove();
                  URL.revokeObjectURL(url);
                }).catch().finally(() => setLoadingDownload(false));
            }}
            >Tải xuống file mẫu</Button>
          </Col>
          <Col span={24}>
            <Form.Item name='fileName' labelAlign='left'
              rules={[
                {
                  required: true,
                  message: errorMessage.get('required')
                }
              ]}>
              <Upload accept='.xlsx,.xls' fileList={fileUpload} showUploadList={{ showRemoveIcon: false }} maxCount={1}
                beforeUpload={(file, fileList) => {
                  let fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                  let fileType = ['.xls', '.xlsx'];
                  if (!fileType.includes(fileExtension))
                    message.error('File không được hỗ trợ');
                  else
                    setFileUpload(fileList);

                  return false;
                }}>
                <Button icon={<UploadOutlined />}>Chọn file</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ImportForm;
