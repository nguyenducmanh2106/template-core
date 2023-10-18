import React, { useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import { Modal, Form, Input, Button, message, Select, TreeSelect, Checkbox, DatePicker, Switch } from 'antd';
import TableForm from '@/components/TableForm/TableForm';
import { TimeFrameModel } from '@/apis';
import { SelectOptionModel } from '@/apis/models/data';

interface CreateFormProps {
  visible: boolean;
  values?: Partial<TimeFrameModel>;
  onSubmitLoading: boolean;
  headQuarters: SelectOptionModel[];
  onSubmit: (values: Omit<TimeFrameModel, 'id'>, form: FormInstance) => void;
  onCancel: () => void;
}

const CreateForm: React.FC<CreateFormProps> = (props) => {
  const { visible, values, headQuarters, onSubmit, onSubmitLoading, onCancel } = props;

  const formVals: Omit<TimeFrameModel, 'id'> = {
    name: values?.name as string,
    isShow: values?.isShow as boolean,
  };
  const [valuesShow, setChecksShow] = useState<boolean>(true);

  const [form] = Form.useForm();

  const checksShow = (e: boolean) => {
    setChecksShow(e);
  };
  const onFinish = async () => {
    try {
      const fieldsValue = await form.validateFields();
      onSubmit({ ...formVals, ...fieldsValue }, form);
    } catch (error) {
      message.warning('Hãy nhập đủ các trường');
    }
  };
  const [value, setValue] = useState<string | undefined>(undefined);

  const onChange = (newValue: string) => {
    setValue(newValue);
  };
  return (
    <Modal
      destroyOnClose
      width={'50%'}
      maskClosable={false}
      title='Thêm mới'
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key='back' onClick={() => onCancel()}>
          Hủy
        </Button>,
        <Button key='submit' type='primary' htmlType='submit' loading={onSubmitLoading} onClick={() => onFinish()}>
          Lưu
        </Button>,
      ]}
    >
      <Form
        form={form}
        name='createform'
        labelCol={{ span: 6 }}
        initialValues={{
          name: formVals.name,
          isShow: formVals.isShow,
        }}
      >
        <Form.Item
          label='Tên hiển thị'
          name='name'
          labelAlign='left'
          rules={[
            {
              required: true,
              validator: async (rule, value) => {
                if (value === '' || !value) {
                  throw new Error('Không được để trống');
                } else if (value.length > 255) {
                  throw new Error('Nhập không quá 255 ký tự');
                }
              },
            },
          ]}
        >
          <Input placeholder='Nhập tên hiển thị' />
        </Form.Item>
        <Form.Item
          label='Chọn trụ sở'
          name='headQuarterId'
          labelAlign='left'
          rules={[
            {
              required: true,
              validator: async (rule, value) => {
                if (value === '' || !value) {
                  throw new Error('Không được để trống');
                } else if (value.length > 255) {
                  throw new Error('Nhập không quá 255 ký tự');
                }
              },
            },
          ]}
        >
          <Select placeholder='Chọn trụ sở'  options={headQuarters}/>
        </Form.Item>
        <Form.Item label='Hiển thị' name='isShow' labelAlign='left'>
          <Switch checked={valuesShow} onClick={(e) => checksShow(e)} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateForm;
