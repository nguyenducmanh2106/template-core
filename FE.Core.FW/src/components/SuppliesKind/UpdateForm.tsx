import { SuppliesCategoryModel, SuppliesGroupModel, SuppliesKindModel } from '@/apis';
import { errorMessage, patternValidate } from '@/utils/constants';
import { Checkbox, Form, Input, Modal, Select } from 'antd';
import { useEffect, useState } from 'react';

interface UpdateFormProps {
  openUpdateForm: boolean;
  onSubmitUpdate: (values: Omit<SuppliesKindModel, 'id'>) => Promise<void>;
  updateModel: Partial<SuppliesKindModel>;
  closeUpdateForm: () => void;
  suppliesGroupList: SuppliesGroupModel[];
  suppliesCategoryList: SuppliesCategoryModel[]
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
          label='Mã loại vật tư'
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
          <Input placeholder='Nhập mã loại vật tư' maxLength={255} />
        </Form.Item>
        <Form.Item
          label='Tên loại vật tư'
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
          <Input placeholder='Nhập tên loại vật tư' maxLength={255} />
        </Form.Item>
        <Form.Item
          label='Nhóm vật tư'
          name='suppliesGroupId'
          required={true}
          rules={[
            {
              required: true,
              message: errorMessage.get('required')
            }
          ]}
        >
          <Select showSearch optionFilterProp='label' options={props.suppliesGroupList.map(item => ({ label: item.name, value: item.id }))} />
        </Form.Item>
        <Form.Item
          label='Danh mục vật tư'
          name='suppliesCategoryId'
          required={true}
          rules={[
            {
              required: true,
              message: errorMessage.get('required')
            }
          ]}
        >
          <Select showSearch optionFilterProp='label' options={props.suppliesCategoryList.map(item => ({ label: item.name, value: item.id }))} />
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
          valuePropName="checked"
        >
          <Checkbox />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UpdateForm;
