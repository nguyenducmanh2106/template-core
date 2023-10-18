import { SuppliesGroupModel } from '@/apis/models/SuppliesGroupModel';
import { errorMessage, patternValidate } from '@/utils/constants';
import { Checkbox, Form, Input, Modal } from 'antd';
import { useEffect, useState } from 'react';

interface UpdateFormProps {
  openUpdateForm: boolean;
  onSubmitUpdate: (values: Omit<SuppliesGroupModel, 'id'>) => Promise<void>;
  updateModel: Partial<SuppliesGroupModel>;
  closeUpdateForm: () => void;
}

const UpdateForm: React.FC<UpdateFormProps> = props => {
  const [form] = Form.useForm();
  const [loadingStateSubmitButton, setLoadingStateSubmitButton] = useState<boolean>(false);
  const onFinish = () => {
    form.validateFields().then(fieldsValue => {
      setLoadingStateSubmitButton(true);
      return props.onSubmitUpdate({ ...props.updateModel, ...fieldsValue });
    })
      .catch(error => console.log(error))
      .finally(() => setLoadingStateSubmitButton(false));
  };

  useEffect(() => { form.setFieldsValue(props.updateModel) }, [props.updateModel]);

  return (
    <Modal
      width='50%'
      maskClosable={false}
      title='Chỉnh sửa'
      open={props.openUpdateForm}
      onCancel={() => props.closeUpdateForm()}
      cancelText='Hủy'
      okText='Lưu'
      onOk={onFinish}
      okButtonProps={{ htmlType: 'submit', loading: loadingStateSubmitButton }}
    >
      <Form
        form={form}
        labelAlign='left'
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
      >
        <Form.Item
          label='Mã nhóm vật tư'
          name='code'
          required={true}
          rules={[
            {
              validator: (_, value: string) => {
                if (value == undefined || value.trim() == '')
                  return Promise.reject(errorMessage.get('required'));

                return Promise.resolve();
              }
            },
            {
              pattern: patternValidate.get('code'),
              message: errorMessage.get('incorrectFormat')
            }
          ]}
        >
          <Input placeholder='Nhập mã nhóm vật tư' maxLength={255} />
        </Form.Item>
        <Form.Item
          label='Tên nhóm vật tư'
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
          <Input placeholder='Nhập tên nhóm vật tư' maxLength={255} />
        </Form.Item>
        <Form.Item
          label='Ghi chú'
          name='note'
        >
          <Input.TextArea maxLength={1000} placeholder='Nhập ghi chú' />
        </Form.Item>
        <Form.Item
          label='Trạng thái hoạt động'
          name='isActive'
          valuePropName='checked'
        >
          <Checkbox />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UpdateForm;
