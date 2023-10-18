import { SuppliesCategoryModel } from '@/apis/models/SuppliesCategoryModel';
import { errorMessage, suppliesSerialStatusConstant } from '@/utils/constants';
import { Checkbox, Form, Input, Modal, Radio } from 'antd';
import { useEffect, useState } from 'react';

interface UpdateFormProps {
  openUpdateForm: boolean;
  onSubmitUpdate: (values: Omit<SuppliesCategoryModel, 'id'>) => Promise<void>;
  updateModel: Partial<SuppliesCategoryModel>;
  closeUpdateForm: () => void;
}

const UpdateForm: React.FC<UpdateFormProps> = props => {
  const [form] = Form.useForm();
  const [loadingStateSubmitButton, setLoadingStateSubmitButton] = useState<boolean>(false);
  const onFinish = async () => {
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
          label='Danh mục vật tư'
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
          <Input placeholder='Nhập danh mục vật tư' maxLength={255} />
        </Form.Item>
        <Form.Item
          label='Vật tư có serial'
          name='suppliesSerialStatus'
          required={true}
          rules={[
            {
              required: true,
              message: errorMessage.get('required')
            }
          ]}
          valuePropName="value"
        >
          <Radio.Group options={suppliesSerialStatusConstant.map(item => ({ label: item.value, value: item.key }))} />
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
