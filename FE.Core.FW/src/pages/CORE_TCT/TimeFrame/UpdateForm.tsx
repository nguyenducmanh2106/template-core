import React, { useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import { Modal, Form, Input, Button, message, Checkbox, TreeSelect, DatePicker, Switch, Select } from 'antd';
import { ITreeRouter } from '@/@types/router';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';
import { TimeFrameModel } from '@/apis/models/TimeFrameModel';
import { SelectOptionModel } from '@/apis/models/data';

dayjs.extend(customParseFormat);
interface UpdateFormPorps {
  visible: boolean;
  values: Partial<TimeFrameModel>;
  onSubmitLoading: boolean;
  headQuarters: SelectOptionModel[];
  onSubmit: (values: TimeFrameModel, form: FormInstance) => void;
  onCancel: () => void;
}

const UpdateForm: React.FC<UpdateFormPorps> = (props) => {
  const { visible, headQuarters,values, onSubmit, onSubmitLoading, onCancel } = props;
  var treeData: ITreeRouter[] = [];
  const [value, setValue] = useState<string | undefined>(undefined);
  const onChange = (newValue: string) => {
    setValue(newValue);
  };

  const formVals: TimeFrameModel = {
    id: values.id,
    name: values?.name as string,
    isShow: values?.isShow as boolean,
    headQuarterId: values.headQuarterId
  };
  const [valuesShow, setChecksShow] = useState<boolean>(formVals.isShow as boolean);
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

  return (
    <Modal
      destroyOnClose
      width={'50%'}
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
          name: formVals.name,
          isShow: formVals.isShow,
          headQuarterId: formVals.headQuarterId,
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

export default UpdateForm;
