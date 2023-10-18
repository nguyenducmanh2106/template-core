import { SuppliesGroupModel, SuppliesKindModel, SuppliesModel } from '@/apis';
import { errorMessage, patternValidate } from '@/utils/constants';
import { DatePicker, Form, Input, Modal, Select } from 'antd';
import localeVn from 'antd/es/date-picker/locale/vi_VN';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface CreateFormProps {
  openCreateForm: boolean;
  onSubmitCreate: (values: Omit<SuppliesModel, 'id'>) => Promise<void>;
  closeCreateForm: () => void;
  suppliesGroupList: SuppliesGroupModel[];
  suppliesKindList: SuppliesKindModel[]
}

const CreateForm: React.FC<CreateFormProps> = props => {
  const [formCreate] = Form.useForm();
  const [loadingStateButtonSubmit, setLoadingStateButtonSubmit] = useState<boolean>(false);
  const [suppliesKindList, setSuppliesKindList] = useState<SuppliesKindModel[]>([]);

  const formVals: Omit<SuppliesModel, 'id'> = {
    code: '',
    suppliesGroupId: '',
    suppliesKindId: '',
    expiryDate: ''
  };

  const onFinish = () => {
    formCreate.validateFields().then(fieldsValue => {
      setLoadingStateButtonSubmit(true);
      fieldsValue.expiryDate = fieldsValue.expiryDate == null || fieldsValue.expiryDate == '' ? undefined : moment(fieldsValue.expiryDate).format('YYYY-MM-DD');
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
          label='Mã vật tư'
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
          <Input placeholder='Nhập mã vật tư' maxLength={255} />
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
          <Select showSearch optionFilterProp='label' options={props.suppliesGroupList.map(item => ({ label: item.name, value: item.id }))}
            onChange={(value: string) => {
              setSuppliesKindList(props.suppliesKindList.filter(item => item.suppliesGroupId == value));
              formCreate.setFieldValue('suppliesKindId', '');
            }}
          />
        </Form.Item>
        <Form.Item
          label='Loại vật tư'
          name='suppliesKindId'
          required={true}
          rules={[
            {
              required: true,
              message: errorMessage.get('required')
            }
          ]}
        >
          <Select showSearch optionFilterProp='label' options={suppliesKindList.map(item => ({ label: item.name, value: item.id }))} />
        </Form.Item>
        <Form.Item
          label='Hạn sử dụng'
          name='expiryDate'
        >
          <DatePicker allowClear format={['DD/MM/YYYY', 'DD-MM-YYYY']} locale={localeVn} placeholder='Nhập hạn sử dụng' />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateForm;
