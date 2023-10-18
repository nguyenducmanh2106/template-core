import { SelectOptionModel } from '@/apis/models/data';
import { StockListModel } from '@/apis/models/StockListModel';
import { patternValidate, errorMessage } from '@/utils/constants';
import { Form, Input, Modal, Select } from 'antd';
import { useEffect, useState } from 'react';

interface CreateFormProps {
  openCreateForm: boolean;
  onSubmitCreate: (values: Omit<StockListModel, 'id'>) => Promise<void>;
  closeCreateForm: () => void;
  areaData: SelectOptionModel[]
}

const CreateForm: React.FC<CreateFormProps> = props => {
  const [formCreate] = Form.useForm();
  const [loadingStateButtonSubmit, setLoadingStateButtonSubmit] = useState<boolean>(false);
  const formVals: Omit<StockListModel, 'id'> = {
    code: '',
    name: '',
    areaId: '',
    note: ''
  };

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

export default CreateForm;
