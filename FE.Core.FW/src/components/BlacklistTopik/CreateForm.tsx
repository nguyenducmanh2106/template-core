import { BlacklistTopikModel } from '@/apis/models/BlacklistTopikModel';
import { blackListTopikStatus, blackListTopikType, errorMessage } from '@/utils/constants';
import { Col, DatePicker, Form, Input, Modal, Row, Select } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface CreateFormProps {
  openCreateForm: boolean;
  onSubmitCreate: (values: BlacklistTopikModel) => Promise<void>;
  closeCreateForm: () => void;
}

const CreateForm: React.FC<CreateFormProps> = props => {
  const [formCreate] = Form.useForm();
  const [loadingStateButtonSubmit, setLoadingStateButtonSubmit] = useState<boolean>(false);
  const [displayStartAndFinishWorkingDate, setDisplayStartAndFinishWorkingDate] = useState<boolean>(false);

  const formVals: Partial<BlacklistTopikModel> = { type: blackListTopikType.candicate, status: blackListTopikStatus.InBlacklist };

  const onFinish = () => {
    formCreate.validateFields().then(fieldsValue => {
      setLoadingStateButtonSubmit(true);
      fieldsValue.startWorkDate = fieldsValue.startWorkDate != null ? moment(fieldsValue.startWorkDate).format('YYYY-MM-DD') : null;
      fieldsValue.notifyResultDate = fieldsValue.notifyResultDate != null ? moment(fieldsValue.notifyResultDate).format('YYYY-MM-DD') : null;
      fieldsValue.finishWorkDate = fieldsValue.finishWorkDate != null ? moment(fieldsValue.finishWorkDate).format('YYYY-MM-DD') : null;
      fieldsValue.finishPunishmentDate = fieldsValue.finishPunishmentDate != null ? moment(fieldsValue.finishPunishmentDate).format('YYYY-MM-DD') : null;
      fieldsValue.dateOfBirth = moment(fieldsValue.dateOfBirth).format('YYYY-MM-DD');
      return props.onSubmitCreate({ ...formVals, ...fieldsValue });
    })
      .catch((error) => console.log(error))
      .finally(() => setLoadingStateButtonSubmit(false));
  };

  useEffect(() => {
    if (!props.openCreateForm) {
      formCreate.resetFields();
      formCreate.setFieldsValue(formVals);
      setLoadingStateButtonSubmit(false);
    }
  }, [props.openCreateForm]);

  return (
    <Modal
      forceRender={true}
      width={'60%'}
      maskClosable={false}
      title='Thêm mới'
      open={props.openCreateForm}
      onCancel={() => props.closeCreateForm()}
      cancelText='Hủy'
      okText='Lưu'
      onOk={onFinish}
      okButtonProps={{ htmlType: 'submit', loading: loadingStateButtonSubmit }}
      centered
    >
      <Form
        form={formCreate}
        labelAlign='left'
        labelCol={{ span: 8 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Họ và tên tiếng Anh' name='fullName' required
              rules={[
                {
                  required: true,
                  message: errorMessage.get('required')
                },
                {
                  whitespace: true,
                  message: errorMessage.get('required')
                },
              ]}
            >
              <Input maxLength={255} placeholder='Nhập họ tên' />
            </Form.Item>
            <Form.Item label='Chứng minh nhân dân' name='identityCard'>
              <Input maxLength={255} placeholder='Nhập số chứng minh nhân dân' />
            </Form.Item>
            <Form.Item label='Hộ chiếu' name='passport'>
              <Input maxLength={255} placeholder='Nhập số hộ chiếu' />
            </Form.Item>
            <Form.Item label='Ngày làm việc IIG' name='startWorkDate' hidden={!displayStartAndFinishWorkingDate}
              dependencies={['finishWorkDate']}
              rules={[
                (formInstance => ({
                  validator: (_, value) => {
                    let finishWorkDate = moment(formInstance.getFieldValue('finishWorkDate'));

                    if (value > finishWorkDate)
                      return Promise.reject('Không lớn hơn ngày kết thúc làm việc');

                    return Promise.resolve();
                  }
                }))
              ]}
            >
              <DatePicker format='DD/MM/YYYY' placeholder='Ngày bắt đầu làm việc' />
            </Form.Item>
            <Form.Item label='Ngày thông báo kết quả' name='notifyResultDate'
              dependencies={['finishPunishmentDate']}
              rules={[
                (formInstance => ({
                  validator: (_, value) => {
                    let finishPunishmentDate = moment(formInstance.getFieldValue('finishPunishmentDate'));

                    if (value > finishPunishmentDate)
                      return Promise.reject('Không lớn hơn ngày hết hạn kỷ luật');

                    return Promise.resolve();
                  }
                }))
              ]}
            >
              <DatePicker format='DD/MM/YYYY' placeholder='Ngày thông báo kết quả' />
            </Form.Item>
            <Form.Item label='Biện pháp kỷ luật' name='punishmentAction'>
              <Input maxLength={255} placeholder='Nhập chi tiết biện pháp kỷ luật' />
            </Form.Item>
            <Form.Item label='Kỳ thi' name='examPeriod'>
              <Input maxLength={255} placeholder='Nhập tên kỳ thi' />
            </Form.Item>
            <Form.Item label='Khu vực' name='area'>
              <Input maxLength={255} placeholder='Nhập khu vực' />
            </Form.Item>
            <Form.Item label='Bài thi' name='exam'>
              <Input maxLength={255} placeholder='Nhập tên bài thi' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Ngày sinh' name='dateOfBirth' required
              rules={[
                {
                  required: true,
                  message: errorMessage.get('required')
                },
                {
                  validator: (_, value) => {
                    if (value > moment())
                      return Promise.reject('Ngày sinh không lớn hơn ngày hiện tại')

                    return Promise.resolve();
                  }
                }
              ]}
            >
              <DatePicker format='DD/MM/YYYY' placeholder='Nhập ngày tháng năm sinh' />
            </Form.Item>
            <Form.Item label='Căn cước công dân' name='citizenIdentityCard'>
              <Input maxLength={255} placeholder='Nhập số căn cước công dân' />
            </Form.Item>
            <Form.Item label='Đối tượng' name='type'>
              <Select options={[{ label: 'Giám thị', value: blackListTopikType.proctor }, { label: 'Thí sinh', value: blackListTopikType.candicate }]}
                onChange={(value) => {
                  if (value == blackListTopikType.proctor)
                    setDisplayStartAndFinishWorkingDate(true);
                  else
                    setDisplayStartAndFinishWorkingDate(false);

                  formCreate.setFields([
                    { name: 'startWorkDate', value: null, errors: [] },
                    { name: 'finishWorkDate', value: null, errors: [] }
                  ]);
                }}
              />
            </Form.Item>
            <Form.Item label='Ngày nghỉ việc IIG' name='finishWorkDate' hidden={!displayStartAndFinishWorkingDate}>
              <DatePicker format='DD/MM/YYYY' placeholder='Ngày nghỉ việc tại IIG' />
            </Form.Item>
            <Form.Item label='Ngày hết hạn kỷ luật' name='finishPunishmentDate'>
              <DatePicker format='DD/MM/YYYY' placeholder='Nhập ngày hết hạn kỷ luật' />
            </Form.Item>
            <Form.Item label='Số báo danh' name='candicateNumber'>
              <Input maxLength={255} placeholder='Nhập số báo danh' />
            </Form.Item>
            <Form.Item label='Quốc gia' name='country'>
              <Input maxLength={255} placeholder='Nhập tên quốc gia' />
            </Form.Item>
            <Form.Item label='Địa điểm thi' name='location'>
              <Input maxLength={255} placeholder='Nhập địa điểm thi' />
            </Form.Item>
            <Form.Item label='Trạng thái' name='status'>
              <Select options={[
                { label: 'Chờ xác nhận', value: blackListTopikStatus.waitConfirm },
                { label: 'Đang trong danh sách blacklist', value: blackListTopikStatus.InBlacklist },
                { label: 'Không trong danh sách blacklist', value: blackListTopikStatus.OutBlacklist }
              ]} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label='Ghi chú' name='note' labelCol={{ span: 4 }}>
          <Input.TextArea maxLength={1000} placeholder='Nhập ghi chú' />
        </Form.Item>
      </Form>
    </Modal >
  )
}

export default CreateForm;
