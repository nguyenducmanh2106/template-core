import { ExamScheduleAPModel } from '@/apis';
import { ExamModel, ExamPeriodResponse, ExamWorkShiftModel } from '@/apis/models/data';
import { getExamIdInPeriod } from '@/apis/services/ExamScheduleApService';
import { Checkbox, Col, DatePicker, Form, Input, Modal, Row, Select } from 'antd';
import moment from 'moment';
import locale from 'antd/es/date-picker/locale/vi_VN';
import { useEffect, useState } from 'react';

const dateFormat = 'DD/MM/YYYY';

interface CreateFormProps {
  openCreateForm: boolean;
  examWorkShift: ExamWorkShiftModel[];
  examPeriod: ExamPeriodResponse[];
  exam: ExamModel[];
  onSubmitCreate: (values: Omit<ExamScheduleAPModel, 'id'>) => void;
  closeCreateForm: () => void;
}

const CreateForm: React.FC<CreateFormProps> = (props) => {
  const [formCreate] = Form.useForm();
  const [loadingStateButtonSubmit, setLoadingStateButtonSubmit] = useState<boolean>(false);
  const [listExamDisable, setListExamDisable] = useState<string[]>([]);
  const formVals: Partial<ExamScheduleAPModel> = { isOpen: true };

  const onFinish = () => {
    formCreate.validateFields().then(fieldsValue => {
      setLoadingStateButtonSubmit(true);
      return props.onSubmitCreate({ ...formVals, ...fieldsValue, examDate: moment(fieldsValue.examDate).format('YYYY-MM-DD') });
    })
      .catch((error) => console.log(error))
      .finally(() => setLoadingStateButtonSubmit(false));
  };

  useEffect(() => {
    if (props.openCreateForm) {
      formCreate.resetFields();
      formCreate.setFieldsValue(formVals);
      setListExamDisable([]);
      setLoadingStateButtonSubmit(false);
    }
  }, [props.openCreateForm]);

  return (
    <Modal
      destroyOnClose
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
      <Form form={formCreate} layout='vertical'>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label='Tên lịch thi'
              name='name'
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: 'Không được để trống'
                }
              ]}
            >
              <Input placeholder='Nhập tên lịch thi' maxLength={255} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label='Ngày thi'
              name='examDate'
              rules={[
                {
                  required: true,
                  message: 'Không được để trống'
                }
              ]}
            >
              <DatePicker allowClear={false} format={dateFormat} locale={locale} placeholder='Nhập ngày thi' />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label='Ca thi'
              name='examWorkShiftId'
              rules={[
                {
                  required: true,
                  message: 'Không được để trống'
                }
              ]}
            >
              <Select placeholder='Nhập ca thi' options={props.examWorkShift.map(item => ({ label: item.name, value: item.id }))} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label='Thời gian thi'
              name='examTime'
            >
              <Input placeholder='Nhập thời gian thi' />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label='Kỳ thi'
              name='examPeriodId'
              rules={[
                {
                  required: true,
                  message: 'Không được để trống'
                }
              ]}
            >
              <Select placeholder='Nhập kỳ thi' options={props.examPeriod.map(item => ({ label: item.name, value: item.id }))}
                onChange={value => {
                  getExamIdInPeriod(value).then(response => setListExamDisable(response.data as string[]));
                  formCreate.resetFields(['examId']);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label='Trạng thái'
              name='isOpen'
            >
              <Select options={[{ label: 'Đang mở', value: true }, { label: 'Đang đóng', value: false }]} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label='Danh sách bài thi'
              name='examId'
              rules={[
                {
                  required: true,
                  message: 'Không được để trống'
                }
              ]}
            >
              <Checkbox.Group options={props.exam.map(item => ({ label: item.name, value: item.id || '', disabled: listExamDisable.includes(item.id || '') }))} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default CreateForm;
