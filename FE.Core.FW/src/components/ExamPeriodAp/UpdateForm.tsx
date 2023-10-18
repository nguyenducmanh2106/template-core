import { ExamPeriodAPModel } from '@/apis/models/ExamPeriodAPModel';
import { errorMessage } from '@/utils/constants';
import { Form, Input, Modal, Select } from 'antd';
import { useEffect, useState } from 'react';

interface UpdateFormProps {
  openUpdateForm: boolean;
  onSubmitUpdate: (values: Omit<ExamPeriodAPModel, 'id'>) => Promise<void>;
  updateModel: Partial<ExamPeriodAPModel>;
  updateId: string;
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
          name='isOpen'
        >
          <Select options={[{ label: 'Đang mở', value: true }, { label: 'Đã kết thúc', value: false }]} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UpdateForm;
