import { ExamScheduleAPModel } from '@/apis';
import { ExamModel, ExamPeriodResponse, ExamWorkShiftModel } from '@/apis/models/data';
import { Checkbox, Col, DatePicker, Form, Input, Modal, Row, Select } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { getExamIdInPeriod } from '@/apis/services/ExamScheduleApService';

const dateFormat = 'DD/MM/YYYY';

interface UpdateFormProps {
  openUpdateForm: boolean;
  examWorkShift: ExamWorkShiftModel[];
  examPeriod: ExamPeriodResponse[];
  exam: ExamModel[];
  onSubmitUpdate: (values: Omit<ExamScheduleAPModel, 'id'>) => void;
  closeUpdateForm: () => void;
  updateModel: ExamScheduleAPModel
}

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const [form] = Form.useForm();
  const [loadingStateSubmitButton, setLoadingStateSubmitButton] = useState<boolean>(false);
  const [listExamDisable, setListExamDisable] = useState<string[]>([]);
  const onFinish = () => {
    form.validateFields().then(fieldsValue => {
      setLoadingStateSubmitButton(true);
      return props.onSubmitUpdate({ ...props.updateModel, ...fieldsValue, examDate: moment(fieldsValue.examDate).format('YYYY-MM-DD') });
    })
      .catch(error => console.log(error))
      .finally(() => setLoadingStateSubmitButton(false));
  };

  useEffect(() => {
    if (props.openUpdateForm) {
      form.setFieldsValue({ ...props.updateModel, examDate: moment(props.updateModel.examDate, 'YYYY-MM-DD') });
      getExamIdInPeriod(props.updateModel.examPeriodId, props.updateModel.id).then(response => setListExamDisable(response.data as string[]));
    }
  }, [props.openUpdateForm]);

  return (
    <Modal
      destroyOnClose
      width={'50%'}
      maskClosable={false}
      title='Chỉnh sửa'
      open={props.openUpdateForm}
      onCancel={() => props.closeUpdateForm()}
      cancelText='Hủy'
      okText='Lưu'
      onOk={onFinish}
      okButtonProps={{ htmlType: 'submit', loading: loadingStateSubmitButton }}
    >
      <Form form={form} layout='vertical'>
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
              <DatePicker allowClear={false} format={dateFormat} placeholder='Nhập ngày thi' />
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
                  getExamIdInPeriod(value, props.updateModel.id).then(response => setListExamDisable(response.data as string[]));
                  form.resetFields(['examId']);
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

export default UpdateForm;
