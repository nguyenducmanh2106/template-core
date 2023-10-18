import { ExamPeriodModel } from '@/apis/models/ExamPeriodModel';
import { errorMessage } from '@/utils/constants';
import { Checkbox, Form, Input, Modal, Select } from 'antd';
import { useEffect, useState } from 'react';

interface CreateFormProps {
  openCreateForm: boolean;
  onSubmitCreate: (values: Omit<ExamPeriodModel, 'id'>) => Promise<void>;
  closeCreateForm: () => void;
}

const CreateForm: React.FC<CreateFormProps> = props => {
  const [formCreate] = Form.useForm();
  const [loadingStateButtonSubmit, setLoadingStateButtonSubmit] = useState<boolean>(false);

  const formVals: Partial<ExamPeriodModel> = { name: '', note: '', status: true };

  const onFinish = () => {
    formCreate.validateFields().then(fieldsValue => {
      setLoadingStateButtonSubmit(true);
      return props.onSubmitCreate({ ...formVals, ...fieldsValue });
    })
      .catch((error) => console.log(error))
      .finally(() => setLoadingStateButtonSubmit(false));
  };

  useEffect(() => {
    if (!props.openCreateForm) {
      formCreate.resetFields();
      formCreate.setFieldsValue(formVals);
      setLoadingStateButtonSubmit(false);
    }
  }, [props.openCreateForm]);

  return (
    <Modal
      forceRender={true}
      width={'50%'}
      maskClosable={false}
      title='Thêm mới'
      open={props.openCreateForm}
      onCancel={() => props.closeCreateForm()}
      cancelText='Hủy'
      okText='Lưu'
      onOk={onFinish}
      okButtonProps={{ htmlType: 'submit', loading: loadingStateButtonSubmit }}
    >
      <Form
        form={formCreate}
        labelAlign='left'
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
      >
        <Form.Item
          label='Tên kỳ thi'
          name='name'
          required={true}
          rules={[
            {
              validator: (_, value: string) => {
                if (value == undefined || value.trim() == '')
                  return Promise.reject(errorMessage.get('required'));

                return Promise.resolve();
              }
            }
          ]}
        >
          <Input placeholder='Nhập tên kỳ thi' maxLength={255} />
        </Form.Item>
        <Form.Item
          label='Ghi chú'
          name='note'
        >
          <Input.TextArea maxLength={1000} placeholder='Nhập ghi chú' />
        </Form.Item>
        <Form.Item
          label='Trạng thái'
          name='status'
        >
          <Select options={[{ label: 'Đang mở', value: true }, { label: 'Đã kết thúc', value: false }]} />
        </Form.Item>
        <Form.Item
          label='Kỳ thi thứ'
          name='number'
        >
          <Input type='number' maxLength={1000} placeholder='Nhập lần thứ của kỳ thi' />
        </Form.Item>
        <Form.Item
          label='Dữ liệu mặc định'
          name='isCurrent'
          valuePropName='checked'
        >
          <Checkbox />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateForm;
