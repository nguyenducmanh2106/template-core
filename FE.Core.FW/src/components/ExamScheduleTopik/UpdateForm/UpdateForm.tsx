import { ExamScheduleTopikModel } from '@/apis/models/ExamScheduleTopikModel';
import { FormInstance } from 'antd/lib/form';
import { Form, Row, Col, Input, DatePicker, InputNumber, Modal, Select, message, Button, Switch } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';
import { ExamPeriodResponse, SelectOptionModel } from '@/apis/models/data';
import { useState } from 'react';

dayjs.extend(customParseFormat);
const dateFormat = 'DD/MM/YYYY';
interface UpdateFormProps {
  values: Partial<ExamScheduleTopikModel>;
  examWorkShifts: SelectOptionModel[];
  exams: SelectOptionModel[];
  statusOption: SelectOptionModel[];
  visible: boolean;
  onSubmitLoading: boolean;
  onCancel: () => void;
  onSubmit: (values: ExamScheduleTopikModel, form: FormInstance) => void;
  examPeriod: ExamPeriodResponse[];
}

const { Option } = Select;
const { TextArea } = Input;
const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { values, examWorkShifts, exams, statusOption, visible, onSubmitLoading, onCancel, onSubmit } = props;

  const [form] = Form.useForm();

  const formVals: ExamScheduleTopikModel = {
    id: values?.id as string,
    examinationName: values?.examinationName as string,
    koreaName: values?.koreaName as string,
    englishName: values?.englishName as string,
    examDate: values?.examDate as string,
    examTime: values?.examTime as string,
    examId: values?.examId as string,
    examWorkShiftId: values?.examWorkShiftId as string,
    startRegister: values?.startRegister as string,
    endRegister: values?.endRegister as string,
    note: values?.note as string,
    public: values?.public as boolean,
    status: values?.status,
    examPeriodId: values?.examPeriodId,
    noteTimeEnterExamRoom: values?.noteTimeEnterExamRoom,
  };

  const [checkPublic, setCheckPublic] = useState<boolean>(formVals.public as boolean);

  const changeV = (newValue: string) => { }

  const checksPublic = (e: boolean) => {
    setCheckPublic(e);
  };

  const onFinish = async () => {
    try {
      const fieldsValue = await form.validateFields();
      fieldsValue.examDate = moment(fieldsValue.examDate).format("DD/MM/YYYY");
      fieldsValue.startRegister = moment(fieldsValue.startRegister).format('DD/MM/YYYY');
      fieldsValue.endRegister = moment(fieldsValue.endRegister).format('DD/MM/YYYY');
      onSubmit({ ...formVals, ...fieldsValue }, form);
    } catch (error) {
      //message.warning('Hãy nhập đủ các trường');
    }
  };

  console.log(formVals);

  return (
    <Modal
      open={visible}
      destroyOnClose
      width={'50%'}
      maskClosable={false}
      title='Chỉnh sửa'
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
        layout='vertical'
        initialValues={{
          examinationName: formVals.examinationName,
          englishName: formVals.englishName,
          koreaName: formVals.koreaName,
          examDate: moment(formVals.examDate, 'DD/MM/YYYY'),
          examTime: formVals.examTime,
          examId: formVals.examId,
          examWorkShiftId: formVals.examWorkShiftId,
          startRegister: moment(formVals.startRegister),
          endRegister: moment(formVals.endRegister),
          note: formVals.note,
          public: formVals.public,
          status: formVals.status?.toString(),
          examPeriodId: formVals.examPeriodId,
          noteTimeEnterExamRoom: formVals.noteTimeEnterExamRoom,
        }}
      >
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              label='Tên lịch thi Việt'
              name='examinationName'
              labelAlign='left'
              rules={[
                {
                  required: true,
                  validator: async (rule, value) => {
                    if (value === '' || !value || value.trim() === '') {
                      throw new Error('Không được để trống');
                    } else if (value.length > 255) {
                      throw new Error('Nhập không quá 255 ký tự');
                    }
                  },
                },
              ]}
            >
              <Input placeholder='Nhập tên lịch thi' />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              label='Tên lịch thi tiếng Anh'
              name='englishName'
              labelAlign='left'
              rules={[
                {
                  required: true,
                  validator: async (rule, value) => {
                    if (value === '' || !value || value.trim() === '') {
                      throw new Error('Không được để trống');
                    } else if (value.length > 255) {
                      throw new Error('Nhập không quá 255 ký tự');
                    }
                  },
                },
              ]}
            >
              <Input placeholder='Nhập tên lịch thi' />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              label='Tên lịch thi tiếng Hàn'
              name='koreaName'
              labelAlign='left'
              rules={[
                {
                  required: true,
                  validator: async (rule, value) => {
                    if (value === '' || !value || value.trim() === '') {
                      throw new Error('Không được để trống');
                    } else if (value.length > 255) {
                      throw new Error('Nhập không quá 255 ký tự');
                    }
                  },
                },
              ]}
            >
              <Input placeholder='Nhập tên lịch thi' />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={18}>
          <Col span={12}>
            <Form.Item
              label='Ngày thi'
              name='examDate'
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
              <DatePicker style={{ width: '100%' }} format={dateFormat} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label='Ca thi'
              name='examWorkShiftId'
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
              <Select placeholder={'Chọn ca thi'} options={examWorkShifts} onChange={(e) => changeV(e)}></Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label='Thời gian thi'
              name='examTime'
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
              <Input placeholder="Nhập thời gian thi" />
            </Form.Item>
          </Col>
          <Col span={12}>
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
              <Select placeholder={'Chọn bài thi'} options={exams} onChange={(e) => changeV(e)}></Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label='Kỳ thi'
              name='examPeriodId'
              labelAlign='left'
              rules={[
                {
                  required: true,
                  message: 'Không được để trống'
                }
              ]}
            >
              <Select placeholder='Chọn kỳ thi' options={props.examPeriod.filter(item => item.status == true || item.id == formVals.examPeriodId)
                .map(item => ({ label: item.name, value: item.id }))}
                showSearch optionFilterProp='label'
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label='Thời gian kết thúc vào phòng thi'
              name='noteTimeEnterExamRoom'
              labelAlign='left'
            >
              <Input maxLength={255} placeholder='Nhập thời gian kết thúc vào phòng thi' />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label='Ghi chú'
              name='note'
              labelAlign='left'
            >
              <TextArea rows={4} maxLength={1000} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label='Thời gian bắt đầu đăng ký'
              name='startRegister'
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
              <DatePicker style={{ width: '100%' }} format={dateFormat} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label='Thời gian kết thúc đăng ký'
              name='endRegister'
              labelAlign='left'
              dependencies={["startRegister"]}
              rules={[
                {
                  required: true,
                  validator: async (rule, value) => {
                    if (value === '' || !value) {
                      throw new Error('Không được để trống');
                    }
                    if (moment(value).unix() < moment(form.getFieldValue('startRegister')).unix()) {
                      throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
                    }
                  },
                },
              ]}
            >
              <DatePicker style={{ width: '100%' }} format={dateFormat} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label='Trạng thái'
              name='status'
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
              <Select placeholder={'Chọn trạng thái'} options={statusOption} onChange={(e) => changeV(e)}></Select>
            </Form.Item>
          </Col>
          <Col span={12} offset={4}>
            <Form.Item
              label='Trạng thái công khai số báo danh'
              name='public'
              labelAlign='left'
            >
              <Switch checked={checkPublic} onClick={(e) => checksPublic(e)} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default UpdateForm;
