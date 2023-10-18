import { SuppliesGroupModel, SuppliesKindModel, SuppliesModel } from '@/apis';
import { errorMessage, patternValidate } from '@/utils/constants';
import { DatePicker, Form, Input, Modal, Select } from 'antd';
import localeVn from 'antd/es/date-picker/locale/vi_VN';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface UpdateFormProps {
  openUpdateForm: boolean;
  onSubmitUpdate: (values: Omit<SuppliesModel, 'id'>) => Promise<void>;
  updateModel: Partial<SuppliesModel>;
  closeUpdateForm: () => void;
  suppliesGroupList: SuppliesGroupModel[];
  suppliesKindList: SuppliesKindModel[]
}

const UpdateForm: React.FC<UpdateFormProps> = props => {
  const [form] = Form.useForm();
  const [loadingStateSubmitButton, setLoadingStateSubmitButton] = useState<boolean>(false);
  const [suppliesKindList, setSuppliesKindList] = useState<SuppliesKindModel[]>([]);
  const onFinish = async () => {
    form.validateFields().then(fieldsValue => {
      setLoadingStateSubmitButton(true);
      fieldsValue.expiryDate = fieldsValue.expiryDate == null || fieldsValue.expiryDate == '' ? undefined : moment(fieldsValue.expiryDate).format('YYYY-MM-DD');
      return props.onSubmitUpdate({ ...props.updateModel, ...fieldsValue });
    })
      .catch(error => console.log(error))
      .finally(() => setLoadingStateSubmitButton(false));
  };

  useEffect(() => {
    let suppliesKind = props.suppliesKindList.find(item => item.id == props.updateModel.suppliesKindId);
    setSuppliesKindList(props.suppliesKindList.filter(item => item.suppliesGroupId == suppliesKind?.suppliesGroupId));
    form.setFieldsValue({ ...props.updateModel, 'suppliesGroupId': suppliesKind?.suppliesGroupId });
    form.setFieldValue('expiryDate', props.updateModel.expiryDate == null ? '' : moment(props.updateModel.expiryDate));
  }, [props.updateModel]);

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
              form.setFieldValue('suppliesKindId', '');
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

export default UpdateForm;
