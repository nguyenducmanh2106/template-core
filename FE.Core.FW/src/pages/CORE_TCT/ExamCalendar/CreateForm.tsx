import React, { ReactElement, useEffect, useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import { Modal, Form, Input, Button, message, Switch, Select, Tabs, DatePicker, Space, TimePicker } from 'antd';
import { ExamCalendarModel } from '@/apis/models/ExamCalendarModel';
import { ExamModel, ExamRoomModel, SelectOptionModel } from '@/apis/models/data';
import TextArea from 'antd/lib/input/TextArea';
import moment, { Moment } from 'moment';
import { RangeValue } from 'rc-picker/lib/interface';
import { ConvertExamOptionModel, ConvertExamRoomOptionModel } from '@/utils/convert';
import { examForm } from '@/utils/constants';
const { RangePicker } = TimePicker;

interface CreateFormProps {
  visible: boolean;
  values?: Partial<ExamCalendarModel>;
  headerQuater: SelectOptionModel[];
  rooms: ExamRoomModel[];
  examShift: SelectOptionModel[];
  exam: ExamModel[];
  status: SelectOptionModel[];
  onSubmitLoading: boolean;
  onSubmit: (values: Omit<ExamCalendarModel, 'id'>, form: FormInstance) => void;
  onCancel: () => void;
}

const CreateForm: React.FC<CreateFormProps> = (props) => {
  const { visible, values, rooms, examShift, status, exam, headerQuater, onSubmit, onSubmitLoading, onCancel } = props;
  const [examRoomSelect, setExamRoomSelect] = useState<SelectOptionModel[]>([]);
  const [examOptionSelect, setExamOptionSelect] = useState<SelectOptionModel[]>([]);
  const formVals: Omit<ExamCalendarModel, 'id'> = {};
  const headerQuaterOption = headerQuater;

  const [form] = Form.useForm();

  const changeV = (id: string) => {
    const examRoomT = rooms.filter((item: ExamRoomModel) => {
      return item.headQuarterId == id
    })
    setExamRoomSelect(ConvertExamRoomOptionModel(examRoomT));
    form.setFieldValue('room', null);
  };

  const changeExamForm = (id: string) => {
    const examsss = exam.filter((item: ExamModel) => {
      return item.examForm == id
    })
    setExamOptionSelect(ConvertExamOptionModel(examsss));
    form.setFieldValue('room', null);
  };


  const onFinish = async () => {
    try {
      const fieldsValue = await form.validateFields();
      fieldsValue.examId = fieldsValue.examId.toString();
      const time1 = fieldsValue.timeTest[0].format('HH:mm')
      const time2 = fieldsValue.timeTest[1].format('HH:mm')
      fieldsValue.timeTest = time1 + ' - ' + time2
      onSubmit({ ...formVals, ...fieldsValue }, form);
    } catch (error) {
      message.warning('Hãy nhập đủ các trường');
    }
  };

  return (
    <Modal
      destroyOnClose
      width={'45%'}
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
          // name: formVals?.name,
          room: formVals?.room as string,
          dateTest: formVals?.dateTest as string,
          examShift: formVals.examShift,
          timeTest: formVals.timeTest,
          examId: formVals.examId,
          status: formVals.status,
        }}
      >
        <Form.Item
          label='Trụ sở'
          name='headerQuarterId'
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
          <Select placeholder={'Chọn trụ sở'} options={headerQuater} onChange={(e) => changeV(e)}></Select>
        </Form.Item>
        <Form.Item
          label='Phòng thi'
          name='room'
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
          <Select placeholder={'Chọn phòng thi'} options={examRoomSelect}></Select>
        </Form.Item>
        <Form.Item
          label='Ngày thi'
          name='dateTest'
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
          <DatePicker style={{ width: '100%' }} placeholder='Nhập ngày thi' format={'DD-MM-YYYY'} />
        </Form.Item>
        <Form.Item
          label='Ngày kết thúc đăng ký'
          name='endDateRegister'
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
          <DatePicker
            style={{ width: '100%' }}
            format={'DD-MM-YYYY'}
            placeholder='Nhập ngày kết thúc'
          />
        </Form.Item>
        <Form.Item
          label='Ca thi'
          name='examShift'
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
          <Select placeholder={'Chọn ca thi'} options={examShift}></Select>
        </Form.Item>
        <Form.Item
          label='Loại bài thi'
          name='examTypeId'
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
          <Select placeholder={'Chọn loại bài thi'} onChange={(e) => changeExamForm(e)}>
            <Select.Option key={examForm.TiengAnh}>Tiếng Anh</Select.Option>
            <Select.Option key={examForm.TinHoc}>Tin Học</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label='Bài thi'
          name='examId'
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
          <Select placeholder={'Chọn bài thi'} mode='multiple' options={examOptionSelect}></Select>
        </Form.Item>
        <Form.Item
          label='Thời gian thi'
          name='timeTest'
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
          <RangePicker placeholder={['Bắt đầu', 'Kết thúc']} bordered={false} format={'HH:mm'} />
        </Form.Item>
        <Form.Item
          label='Ghi chú'
          name='note'
          labelAlign='left'
        >
          <TextArea rows={4} placeholder='Ghi chú' />
        </Form.Item>
        <Form.Item
          label='Số lượng thí sinh'
          name='quantityCandidate'
          labelAlign='left'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input type='number' placeholder='Nhập số lượng thí sinh' />
        </Form.Item>
        <Form.Item
          label='Trạng thái'
          name='status'
          labelAlign='left'
        >
          <Select defaultValue={'1'} placeholder={'Chọn ca thi'} options={status}></Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateForm;
