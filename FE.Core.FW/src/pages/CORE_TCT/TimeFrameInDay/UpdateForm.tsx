import React, { useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import { Modal, Form, Input, Button, message, Checkbox, TreeSelect, DatePicker, Switch, Select, TimePicker } from 'antd';
import { ITreeRouter } from '@/@types/router';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';
import { TimeFrameInDayModel } from '@/apis/models/TimeFrameInDayModel';
import { SelectOptionModel } from '@/apis/models/data';
import NotNegativeNumber from '@/components/NotNegativeNumber/Index';

dayjs.extend(customParseFormat);
interface UpdateFormPorps {
  visible: boolean;
  values: Partial<TimeFrameInDayModel>;
  timeFrames: SelectOptionModel[];
  onSubmitLoading: boolean;
  onSubmit: (values: TimeFrameInDayModel, form: FormInstance) => void;
  onCancel: () => void;
}

const UpdateForm: React.FC<UpdateFormPorps> = (props) => {
  const { visible, values, timeFrames, onSubmit, onSubmitLoading, onCancel } = props;
  var treeData: ITreeRouter[] = [];
  const [value, setValue] = useState<string | undefined>(undefined);
  const onChange = (newValue: string) => {
    setValue(newValue);
  };
  const format = 'HH:mm';
  const formVals: TimeFrameInDayModel = {
    id: values.id,
    sysTimeFrameId: values.sysTimeFrameId,
    maxRegistry: values?.maxRegistry as number,
    timeEnd: values?.timeEnd as string,
    timeStart: values?.timeStart as string,
    isShow: values?.isShow as boolean,
  };
  const [valueFrame, setValueFrame] = useState<string>(formVals.sysTimeFrameId as string);
  const [valuesShow, setChecksShow] = useState<boolean>(formVals.isShow as boolean);
  const [form] = Form.useForm();

  const checksShow = (e: boolean) => {
    setChecksShow(e);
  };
  const changeV = (newValue: string) => {
    setValueFrame(newValue);
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

  return (
    <Modal
      destroyOnClose
      width={'30%'}
      maskClosable={false}
      title='Sửa'
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
        name='editform'
        labelCol={{ span: 6 }}
        initialValues={{
          id: formVals.id,
          maxRegistry: formVals?.maxRegistry as number,
          timeEnd: dayjs(values?.timeEnd, format),
          timeStart: dayjs(values?.timeStart, format),
          isShow: formVals.isShow,
          sysTimeFrameId: formVals.sysTimeFrameId,
        }}
      >
        <Form.Item
          label='Tên hiển thị'
          name='sysTimeFrameId'
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
          <Select value={valueFrame} options={timeFrames} onChange={(e) => changeV(e)}></Select>
        </Form.Item>
        <Form.Item
          label='Số lượng'
          name='maxRegistry'
          labelAlign='left'
          wrapperCol={{ span: 24 }}
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

export default UpdateForm;
