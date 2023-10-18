import { FaqModel } from '@/apis/models/FaqModel';
import { ExamTypeModel } from '@/apis/models/data';
import Ckeditor from '@/components/CKEditor';
import { errorMessage } from '@/utils/constants';
import { Checkbox, Form, Input, InputNumber, Modal, Select, Tabs } from 'antd';
import { useEffect, useState } from 'react';

interface CreateFormProps {
  openCreateForm: boolean;
  onSubmitCreate: (values: FaqModel) => Promise<void>;
  closeCreateForm: () => void;
  examTypeList: ExamTypeModel[];
}

const CreateForm: React.FC<CreateFormProps> = props => {
  const [formCreate] = Form.useForm();
  const [loadingStateButtonSubmit, setLoadingStateButtonSubmit] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string>('');
  const formVals: Partial<FaqModel> = { isShow: true, hasDetail: true, order: 1 };

  const onFinish = () => {
    if (formCreate.getFieldsError(['shortAnswer', 'question']).find(item => item.errors.length > 0) != undefined) {
      setActiveKey('vn');
      return;
    }
    if (formCreate.getFieldsError(['shortAnswerEnglish', 'questionEnglish']).find(item => item.errors.length > 0) != undefined) {
      setActiveKey('en');
      return;
    }
    if (formCreate.getFieldsError(['shortAnswerKorean', 'questionKorean']).find(item => item.errors.length > 0) != undefined) {
      setActiveKey('ko');
      return;
    }
    formCreate.validateFields().then(fieldsValue => {
      setLoadingStateButtonSubmit(true);
      return props.onSubmitCreate({ ...formVals, ...fieldsValue });
    })
      .catch((error) => console.log(error))
      .finally(() => setLoadingStateButtonSubmit(false));
  };

  useEffect(() => {
    if (props.openCreateForm) {
      setActiveKey('vn');
      formCreate.resetFields();
      formCreate.setFieldsValue(formVals);
      setLoadingStateButtonSubmit(false);
    }
  }, [props.openCreateForm]);

  return (
    <Modal
      forceRender={true}
      width={'70%'}
      maskClosable={false}
      title='Thêm mới'
      open={props.openCreateForm}
      onCancel={() => props.closeCreateForm()}
      cancelText='Hủy'
      okText='Lưu'
      onOk={onFinish}
      okButtonProps={{ htmlType: 'submit', loading: loadingStateButtonSubmit }}
      style={{ top: 10 }}
    >
      <Form
        form={formCreate}
        labelAlign='left'
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
      >
        <Form.Item
          label='Tên bài thi'
          name='examTypeId'
          required={true}
          rules={[
            {
              required: true,
              message: errorMessage.get('required')
            }
          ]}
        >
          <Select
            allowClear
            placeholder='Nhập bài thi'
            options={props.examTypeList.map(item => ({ label: item.name, value: item.id }))}
            optionFilterProp='label'
          />
        </Form.Item>
        <Form.Item
          label='Vị trí hiển thị'
          name='order'
          required={true}
          rules={[
            {
              validator: (_, value) => {
                if (parseInt(value) < 0) {
                  return Promise.reject('Giá trị phải lớn hơn 0');
                }

                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber precision={0} maxLength={9} />
        </Form.Item>
        <Form.Item
          label='Câu hỏi'
          required={true}
        >
          <Tabs activeKey={activeKey}
            onChange={activeKey => setActiveKey(activeKey)}
            items={[
              {
                label: 'Tiếng Việt',
                key: 'vn',
                forceRender: true,
                children:
                  <Form.Item
                    name='question'
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: errorMessage.get('required')
                      }]}>
                    <Input placeholder='Nhập câu hỏi' />
                  </Form.Item>
              },
              {
                label: 'Tiếng Anh',
                forceRender: true,
                key: 'en',
                children:
                  <Form.Item
                    name='questionEnglish'
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: errorMessage.get('required')
                      }]}>
                    <Input placeholder='Nhập câu hỏi' />
                  </Form.Item>
              },
              {
                forceRender: true,
                label: 'Tiếng Hàn',
                key: 'ko',
                children:
                  <Form.Item
                    name='questionKorean'
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: errorMessage.get('required')
                      }]}>
                    <Input placeholder='Nhập câu hỏi' />
                  </Form.Item>
              }
            ]} />
        </Form.Item>
        <Form.Item
          label='Câu trả lời nhanh'
          required={true}
        >
          <Tabs activeKey={activeKey}
            onChange={activeKey => setActiveKey(activeKey)}
            items={[
              {
                forceRender: true,
                label: 'Tiếng Việt',
                key: 'vn',
                children:
                  <Form.Item
                    name='shortAnswer'
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: errorMessage.get('required')
                      }]}>
                    <Ckeditor value='' />
                  </Form.Item>
              },
              {
                forceRender: true,
                label: 'Tiếng Anh',
                key: 'en',
                children:
                  <Form.Item
                    name='shortAnswerEnglish'
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: errorMessage.get('required')
                      }]}>
                    <Ckeditor value='' />
                  </Form.Item>
              },
              {
                forceRender: true,
                label: 'Tiếng Hàn',
                key: 'ko',
                children:
                  <Form.Item
                    name='shortAnswerKorean'
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: errorMessage.get('required')
                      }]}>
                    <Ckeditor value='' />
                  </Form.Item>
              }
            ]} />
        </Form.Item>
        <Form.Item label='Câu trả lời đầy đủ'>
          <Tabs activeKey={activeKey}
            onChange={activeKey => setActiveKey(activeKey)}
            items={[
              {
                forceRender: true,
                label: 'Tiếng Việt',
                key: 'vn',
                children:
                  <Form.Item name='fullAnswer'>
                    <Ckeditor value='' />
                  </Form.Item>
              },
              {
                forceRender: true,
                label: 'Tiếng Anh',
                key: 'en',
                children:
                  <Form.Item name='fullAnswerEnglish'>
                    <Ckeditor value='' />
                  </Form.Item>
              },
              {
                label: 'Tiếng Hàn',
                forceRender: true,
                key: 'ko',
                children:
                  <Form.Item name='fullAnswerKorean'>
                    <Ckeditor value='' />
                  </Form.Item>
              }
            ]} />
        </Form.Item>
        <Form.Item
          label='Hiển thị câu hỏi'
          name='isShow'
          valuePropName='checked'
        >
          <Checkbox />
        </Form.Item>
        <Form.Item
          label='Câu hỏi có câu trả lời đầy đủ'
          name='hasDetail'
          valuePropName='checked'
        >
          <Checkbox />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateForm;
