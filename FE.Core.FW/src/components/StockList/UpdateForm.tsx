import { SelectOptionModel } from '@/apis/models/data';
import { StockListModel } from '@/apis/models/StockListModel';
import { patternValidate, errorMessage } from '@/utils/constants';
import { Form, Input, Modal, Select } from 'antd';
import { useEffect, useState } from 'react';

interface UpdateFormProps {
  openUpdateForm: boolean;
  onSubmitUpdate: (values: Omit<StockListModel, 'id'>) => Promise<void>;
  updateModel: Partial<StockListModel>;
  closeUpdateForm: () => void;
  areaData: SelectOptionModel[];
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
          label='Mã kho'
          name='code'
          required={true}
          rules={[
            {
              validator: (_, value: string) => {
                if (value == undefined || value.trim() == '')
                  return Promise.reject('Không được để trống');

                return Promise.resolve();
              }
            },
            {
              pattern: patternValidate.get('code'),
              message: errorMessage.get('incorrectFormat')
            }
          ]}
        >
          <Input placeholder='Nhập mã kho' maxLength={255} />
        </Form.Item>
        <Form.Item
          label='Tên kho'
          name='name'
          required={true}
          rules={[
            {
              validator: (_, value: string) => {
                if (value == undefined || value.trim() == '')
                  return Promise.reject('Không được để trống');

                return Promise.resolve();
              }
            }
          ]}
        >
          <Input placeholder='Nhập tên kho' maxLength={255} />
        </Form.Item>
        <Form.Item
          label='Khu vực'
          name='areaId'
          required={true}
          rules={[{
            required: true,
            message: 'Không được để trống'
          }]}
        >
          <Select options={props.areaData} />
        </Form.Item>
        <Form.Item
          label='Ghi chú'
          name='note'
        >
          <Input.TextArea maxLength={1000} placeholder='Nhập ghi chú' />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UpdateForm;
