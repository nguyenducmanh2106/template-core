import React, { useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import { Modal, Form, Input, Button, message, Switch, Select, TimePicker } from 'antd';
import { TimeFrameInDayModel } from '@/apis/models/TimeFrameInDayModel';
import NotNegativeNumber from '@/components/NotNegativeNumber/Index';
import { SelectOptionModel } from '@/apis/models/data';

interface CreateFormProps {
  visible: boolean;
  values?: Partial<TimeFrameInDayModel>;
  timeFrames: SelectOptionModel[];
  onSubmitLoading: boolean;
  onSubmit: (values: Omit<TimeFrameInDayModel, 'id'>, form: FormInstance) => void;
  onCancel: () => void;
}

const CreateForm: React.FC<CreateFormProps> = (props) => {
  const { visible, values, timeFrames, onSubmit, onSubmitLoading, onCancel } = props;

  const formVals: Omit<TimeFrameInDayModel, 'id'> = {
    sysTimeFrameId: values?.sysTimeFrameId as string,
    maxRegistry: values?.maxRegistry as number,
    timeEnd: values?.timeEnd as string,
    timeStart: values?.timeStart as string,
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
      fieldsValue.timeStart = fieldsValue.timeStart.format("HH:mm")
      fieldsValue.timeEnd = fieldsValue.timeEnd.format("HH:mm")
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
      width={'30%'}
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
        labelCol={{ span: 8 }}
        initialValues={{
          sysTimeFrameId: formVals.sysTimeFrameId,
          isShow: formVals.isShow,
          maxRegistry: formVals?.maxRegistry as number,
          timeEnd: formVals?.timeEnd as string,
          timeStart: formVals?.timeStart as string,
        }}
      >
        <Form.Item
          label='Loại khung thời gian'
          name='sysTimeFrameId'
          labelAlign='left'
          wrapperCol={{ span: 12 }}
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
          <Select options={timeFrames}></Select>
        </Form.Item>
        <Form.Item
          label='Số lượng'
          name='maxRegistry'
          labelAlign='left'
          wrapperCol={{ span: 12 }}
          rules={[
            {
              required: true,
              validator: async (rule, value) => {
                if (value === '' || !value) {
                  throw new Error('Không được để trống');
                }
                if (value != undefined && value.length > 255) {
                  throw new Error('Nhập không quá 255 ký tự');
                }
              },
            },
          ]}
        >
          <Input placeholder='Nhập số lượng' />
        </Form.Item>
        <Form.Item
          label='Giờ bắt đầu'
          name='timeStart'
          labelAlign='left'
          wrapperCol={{ span: 12 }}
          rules={[
            {
              required: true,
              validator: async (rule, value) => {
                if (value === '' || !value) {
                  throw new Error('Không được để trống');
                }
              },
            },
          ]}
        >
          <TimePicker format={'HH:mm'} />
        </Form.Item>
        <Form.Item
          label='Giờ kết thúc'
          name='timeEnd'
          labelAlign='left'
          wrapperCol={{ span: 12 }}
          rules={[
            {
              required: true,
              validator: async (rule, value) => {
                if (value === '' || !value) {
                  throw new Error('Không được để trống');
                }
              },
            },
          ]}
        >
          <TimePicker format={'HH:mm'} />
        </Form.Item>
        <Form.Item label='Hiển thị' name='isShow' labelAlign='left'>
          <Switch checked={valuesShow} onClick={(e) => checksShow(e)} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateForm;
