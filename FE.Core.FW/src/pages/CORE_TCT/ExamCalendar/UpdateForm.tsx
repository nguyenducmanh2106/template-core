import React, { useEffect, useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import { Modal, Form, Input, Button, message, Checkbox, TreeSelect, DatePicker, Switch, Select, TabsProps, Tabs, Row, TimePicker } from 'antd';
import { ITreeRouter } from '@/@types/router';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';
import { ExamCalendarModel } from '@/apis/models/ExamCalendarModel';
import { ExamModel, ExamRoomModel, SelectOptionModel } from '@/apis/models/data';
import NotNegativeNumber from '@/components/NotNegativeNumber/Index';
import TextArea from 'antd/lib/input/TextArea';
import { HoldPositionModel, Code, ResponseData } from '@/apis';
import { getGetByCalendarId, postHolePosition, putHolePosition } from '@/apis/services/HolePositionService';
import Table, { ColumnsType } from 'antd/lib/table';
import CreateFormHold from './CreateFormHold';
import UpdateFormHold from './UpdateFormHold';
import { ConvertExamOptionModel, ConvertExamRoomOptionModel } from '@/utils/convert';
import { examForm } from '@/utils/constants';
const { RangePicker } = TimePicker;
dayjs.extend(customParseFormat);
interface UpdateFormPorps {
  visible: boolean;
  values: Partial<ExamCalendarModel>;
  headerQuater: SelectOptionModel[];
  rooms: ExamRoomModel[];
  examShift: SelectOptionModel[];
  exam: ExamModel[];
  status: SelectOptionModel[];
  onSubmitLoading: boolean;
  onSubmit: (values: ExamCalendarModel, form: FormInstance) => void;
  onCancel: () => void;
}

const UpdateForm: React.FC<UpdateFormPorps> = (props) => {
  const { visible, values, rooms, status, examShift, exam, headerQuater, onSubmit, onSubmitLoading, onCancel } = props;
  var treeData: ITreeRouter[] = [];
  const [firstExamId, setFirstExamId] = useState<string>(exam.find(p=>p.id == (values.examId?.split(',')[0] as string))?.examForm as string);
  const [showCreateHold, setShowCreateHold] = useState<boolean>(false);
  const [list, setList] = useState<HoldPositionModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const formVals: ExamCalendarModel = {
    id: values.id,
    room: values?.room as string,
    dateTest: values?.dateTest as string,
    examShift: values.examShift,
    timeTest: values.timeTest,
    examId: values.examId,
    status: values.status,
    headerQuarterId: values.headerQuarterId,
    endDateRegister: values.endDateRegister,
    note: values.note,
    quantityCandidate: values.quantityCandidate
  };
  const getList = async (): Promise<void> => {
    setLoading(true);
    const response: ResponseData = await getGetByCalendarId(values.id as string);
    setList((response.data || []) as HoldPositionModel[]);
    setLoading(false);
  };
  useEffect(() => {
    getList();
  }, []);
  const [examRoomSelect, setExamRoomSelect] = useState<SelectOptionModel[]>(ConvertExamRoomOptionModel(rooms.filter((item: ExamRoomModel) => {
    return item.headQuarterId == values.headerQuarterId
  })));
  const changeV = (id: string) => {
    const examRoomT = rooms.filter((item: ExamRoomModel) => {
      return item.headQuarterId == id
    })
    setExamRoomSelect(ConvertExamRoomOptionModel(examRoomT));
    form.setFieldValue('room', null);
  };
  const [examOptionSelect, setExamOptionSelect] = useState<SelectOptionModel[]>(ConvertExamOptionModel(exam.filter((item: ExamModel) => {
    return item.examForm == firstExamId
  })));
  const changeExamForm = (id: string) => {
    const examsss = exam.filter((item: ExamModel) => {
      return item.examForm == id
    })
    setExamOptionSelect(ConvertExamOptionModel(examsss));
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
  const updateSubmit = async (values: HoldPositionModel) => {
    const res = await putHolePosition(undefined, values);
    if (res.code == Code._200) {
      message.success('Thành công !');
      setUpdateFormVisible(false)
      getList();
    } else {
      message.error(res.message);
    }
  };

  const [updateFormVisible, setUpdateFormVisible] = useState<boolean>(false);
  const [updateData, setUpdateData] = useState<Partial<HoldPositionModel>>({});
  const [detailUpdateLoading, setDetailUpdateLoading] = useState<string[]>([]);
  const detailUpdateData = async (data: Partial<HoldPositionModel>) => {
    setDetailUpdateLoading([data.id as string]);
    await setUpdateData({
      ...data,
    });
    setUpdateFormVisible(true);
    setDetailUpdateLoading([]);
  };
  const [createSubmitLoading, setCreateSubmitLoading] = useState<boolean>(false);
  const createSubmitHold = async (values: Omit<HoldPositionModel, 'id'>, form: FormInstance) => {
    setCreateSubmitLoading(true);
    values.examCalendarId = formVals.id;
    const res = await postHolePosition(undefined, values);
    if (res.code == Code._200) {
      form.resetFields();
      getList();
      setShowCreateHold(false);
      message.success('Thành công !');
    } else {
      message.error(res.message);
    }
    setCreateSubmitLoading(false);
  };

  const columns: ColumnsType<HoldPositionModel> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 80,
      render: (_, record, index) => <>{index + 1}</>,
    },
    {
      title: 'Đơn vị giữ chỗ',
      dataIndex: 'room',
      render: (_, record) => <span>{record.name}</span>,
    },
    {
      title: 'Số lượng',
      dataIndex: 'dateTest',
      render: (_, record) => <span>{record.quantity}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (_, record) => (
        <span>{record.status ? 'Đang mở' : ' Đã đóng'}</span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <>
          <Button
            type='link'
            loading={detailUpdateLoading.includes(record.id || '')}
            onClick={() => detailUpdateData(record)}
          >
            Sửa
          </Button>
        </>
      ),
    },
  ];
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Thông tin chung',
      children: <>
        <Form
          form={form}
          name='editform'
          labelCol={{ span: 6 }}
          initialValues={{
            headerQuarterId: formVals?.headerQuarterId,
            room: formVals?.room as string,
            dateTest: moment(formVals?.dateTest),
            endDateRegister: moment(formVals?.endDateRegister),
            examShift: formVals.examShift,
            timeTest: [dayjs(formVals.timeTest?.split(' - ')[0], 'HH:mm'), dayjs(formVals.timeTest?.split(' - ')[1], 'HH:mm')],
            examId: formVals.examId?.split(','),
            status: formVals.status?.toString(),
            note: formVals.note,
            quantityCandidate: formVals.quantityCandidate
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
            <DatePicker
              style={{ width: '100%' }}
            />
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
            <Select placeholder={'Chọn ca thi'} mode='multiple' options={examOptionSelect}></Select>
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
            <Select placeholder={'Chọn ca thi'} options={status}></Select>
          </Form.Item>
        </Form>
      </>,
    },
    {
      key: '2',
      label: 'Thông tin đặt chỗ',
      children: <>
        <Row>
          <Button type='primary' onClick={() => setShowCreateHold(true)}>
            Thêm mới
          </Button>
        </Row>
        <br></br>
        <Table
          rowKey='id'
          size='small'
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={false}
        />
      </>,
    },
  ];

  return (
    <Modal
      destroyOnClose
      width={'45%'}
      centered
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
      <Tabs tabPosition='top' style={{ marginTop: '-30px' }} defaultActiveKey="1" centered items={items} />

      <CreateFormHold onSubmitHold={createSubmitHold} visible={showCreateHold} onCancel={() => setShowCreateHold(false)}></CreateFormHold>
      <UpdateFormHold values={updateData} onSubmit={updateSubmit} visible={updateFormVisible} onCancel={() => setUpdateFormVisible(false)}></UpdateFormHold>
    </Modal>
  );
};

export default UpdateForm;
