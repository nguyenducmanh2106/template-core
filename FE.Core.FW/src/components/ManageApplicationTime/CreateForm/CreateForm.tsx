import React, { ReactElement, useEffect, useState } from 'react';
import { FormInstance } from 'antd/lib/form';
import { Modal, Form, Input, Button, message, Switch, Select, Tabs, DatePicker, Space, TimePicker } from 'antd';
import { ManageApplicationTimeModel } from '@/apis/models/ManageApplicationTimeModel';
import NotNegativeNumber from '@/components/NotNegativeNumber/Index';
import { SelectOptionModel } from '@/apis/models/data';
import TextArea from 'antd/lib/input/TextArea';
import moment, { Moment } from 'moment';
import { RangeValue } from 'rc-picker/lib/interface';

interface CreateFormProps {
  visible: boolean;
  values?: Partial<ManageApplicationTimeModel>;
  headerQuater: SelectOptionModel[];
  timeFrames: SelectOptionModel[];
  onSubmitLoading: boolean;
  onSubmit: (values: Omit<ManageApplicationTimeModel, 'id'>, form: FormInstance) => void;
  onCancel: () => void;
}

const CreateForm: React.FC<CreateFormProps> = (props) => {
  const { visible, values, timeFrames, headerQuater, onSubmit, onSubmitLoading, onCancel } = props;

  const formVals: Omit<ManageApplicationTimeModel, 'id'> = {
    sysTimeFrameId: values?.sysTimeFrameId as string,
    maxRegistry: values?.maxRegistry as number,
    timeEnd: values?.timeEnd as string,
    timeStart: values?.timeStart as string,
    isShow: values?.isShow as boolean,
    headerQuarterId: values?.headerQuarterId as string,
  };
  const headerQuaterOption = headerQuater;

  const [form] = Form.useForm();

  const changeV = (newValue: string) => { };

  const onChangeRangerPicker = (e: RangeValue<Moment>) => {
  };
  const onFinish = async () => {
    try {
      const fieldsValue = await form.validateFields();
      if (tabsActive == 1 && fieldsValue.timeStart > fieldsValue.timeEnd) {
        message.warning('Giờ bắt đầu không được lớn hơn giờ kết thúc');
      } else {
        if (tabsActive == 1) {
          fieldsValue.timeStart = fieldsValue.timeStart.format("HH:mm")
          fieldsValue.timeEnd = fieldsValue.timeEnd.format("HH:mm")
        }
        onSubmit({ ...formVals, ...fieldsValue }, form);
      }

    } catch (error) {
      message.warning('Hãy nhập đủ các trường');
    }
  };

  const [tabsActive, setTabsActive] = useState<number>(1);

  const onChange = (key: string) => {
    if (key == '1') {
      setTabsActive(1);
    } else {
      setTabsActive(2);
    }
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
      <Tabs
        defaultActiveKey='1'
        onChange={onChange}
        type='card'
        items={[
          {
            label: 'Tạo đơn lẻ',
            key: '1',
            children: (
              <Form
                form={form}
                name='editform'
                labelCol={{ span: 6 }}
                initialValues={{
                  maxRegistry: formVals?.maxRegistry as number,
                  timeEnd: formVals?.timeEnd as string,
                  timeStart: formVals?.timeStart as string,
                  isShow: formVals.isShow,
                  sysTimeFrameId: formVals.sysTimeFrameId,
                  headerQuarterId: formVals.headerQuarterId,
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
                        if (tabsActive == 1 && (value === '' || !value)) {
                          throw new Error('Không được để trống');
                        }
                      },
                    },
                  ]}
                >
                  <Select placeholder={'Chọn trụ sở'} options={headerQuater} onChange={(e) => changeV(e)}></Select>
                </Form.Item>
                <Form.Item
                  label='Ngày thu hồ sơ'
                  name='ReceivedDate'
                  labelAlign='left'
                  wrapperCol={{ span: 8 }}
                  rules={[
                    {
                      required: true,
                      validator: async (rule, value) => {
                        if (tabsActive == 1) {
                          if (value === '' || !value) {
                            throw new Error('Không được để trống');
                          } else if (value.length > 255) {
                            throw new Error('Nhập không quá 255 ký tự');
                          }
                        }
                      },
                    },
                  ]}
                >
                  <DatePicker placeholder='Chọn' />
                </Form.Item>
                <Form.Item
                  label='Số lượng'
                  name='maxRegistry'
                  labelAlign='left'
                  wrapperCol={{ span: 8 }}
                  rules={[
                    {
                      required: true,
                      validator: async (rule, value) => {
                        if (tabsActive == 1) {
                          if (value === '' || !value) {
                            throw new Error('Không được để trống');
                          } else if (value.length > 255) {
                            throw new Error('Nhập không quá 255 ký tự');
                          }
                        }
                      },
                    },
                  ]}
                >
                  <NotNegativeNumber valueInput={formVals.maxRegistry as number} />
                </Form.Item>
                <Form.Item
                  label='Giờ bắt đầu'
                  name='timeStart'
                  labelAlign='left'
                  rules={[
                    {
                      required: true,
                      validator: async (rule, value) => {
                        if (tabsActive == 1) {
                          if (value === '' || !value) {
                            throw new Error('Không được để trống');
                          }
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
                        if (tabsActive == 1) {
                          if (value === '' || !value) {
                            throw new Error('Không được để trống');
                          }
                        }
                      },
                    },
                  ]}
                >
                  <TimePicker format={'HH:mm'} />
                </Form.Item>
                <Form.Item
                  label='Ghi chú'
                  name='note'
                  labelAlign='left'
                  rules={[
                    {
                      required: false,
                      validator: async (rule, value) => {
                        if (tabsActive == 1 && value != undefined && value.length > 1000) {
                          throw new Error('Nhập không quá 1000 ký tự');
                        }
                      },
                    },
                  ]}
                >
                  <TextArea rows={4} placeholder='Ghi chú' />
                </Form.Item>
              </Form>
            ),
          },
          {
            label: 'Tạo hàng loại',
            key: '2',
            children: (
              <Form
                form={form}
                name='editforma'
                labelCol={{ span: 6 }}
                initialValues={{
                  maxRegistry: formVals?.maxRegistry as number,
                  timeEnd: formVals?.timeEnd as string,
                  timeStart: formVals?.timeStart as string,
                  isShow: formVals.isShow,
                  sysTimeFrameId: formVals.sysTimeFrameId,
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
                        if (tabsActive == 2 && (value === '' || !value)) {
                          throw new Error('Không được để trống');
                        }
                      },
                    },
                  ]}
                >
                  <Select options={headerQuaterOption} onChange={(e) => changeV(e)}></Select>
                </Form.Item>
                <Form.Item
                  label='Khung thời gian'
                  name='sysTimeFrameId'
                  labelAlign='left'
                  rules={[
                    {
                      required: true,
                      validator: async (rule, value) => {
                        if (tabsActive == 2 && (value === '' || !value)) {
                          throw new Error('Không được để trống');
                        }
                        if (tabsActive == 2 && value.length > 255) {
                          throw new Error('Nhập không quá 255 ký tự');
                        }
                      },
                    },
                  ]}
                >
                  <Select options={timeFrames} onChange={(e) => changeV(e)}></Select>
                </Form.Item>
                <Form.Item
                  label='Ngày thu hồ sơ'
                  name='listReceivedDate'
                  labelAlign='left'
                  wrapperCol={{ span: 12 }}
                  rules={[
                    {
                      required: true,
                      validator: async (rule, value) => {
                        if (tabsActive == 2 && (value === '' || !value)) {
                          throw new Error('Không được để trống');
                        }
                        if (tabsActive == 2 && value.length > 255) {
                          throw new Error('Nhập không quá 255 ký tự');
                        }
                      },
                    },
                  ]}
                >
                  <DatePicker.RangePicker onChange={(e) => onChangeRangerPicker(e)} />
                </Form.Item>
              </Form>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default CreateForm;
