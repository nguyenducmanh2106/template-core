import { ImportStockProposalModel, StockListModel, SupplierModel, SuppliesCategoryModel, SuppliesKindModel, SuppliesModel } from '@/apis';
import { ImportStockProposalResponse } from '@/apis/models/data';
import DetailProposal from '@/components/ImportStockProposal/DetailProposal';
import { errorMessage } from '@/utils/constants';
import { UploadOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, Modal, Radio, Select, Upload, UploadFile } from 'antd';
import localeVn from 'antd/es/date-picker/locale/vi_VN';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface UpdateFormProps {
  openUpdateForm: boolean;
  onSubmitUpdate: (values: ImportStockProposalModel, isSendForApproval: boolean) => Promise<void>;
  closeUpdateForm: () => void;
  stockList: StockListModel[];
  supplierList: SupplierModel[];
  suppliesKind: SuppliesKindModel[];
  suppliesCategory: SuppliesCategoryModel[];
  updateModel: Partial<ImportStockProposalResponse>;
  suppliesList: SuppliesModel[];
}

const UpdateForm: React.FC<UpdateFormProps> = props => {
  const [formCreate] = Form.useForm();
  const [loadingStateButtonSubmit, setLoadingStateButtonSubmit] = useState<boolean>(false);
  const [fileUploadList, setFileUploadList] = useState<UploadFile[]>([]);

  const onFinish = (isSendForApproval: boolean = false) => {
    formCreate.validateFields().then(fieldsValue => {
      setLoadingStateButtonSubmit(true);
      fieldsValue.datePropose = moment(fieldsValue.datePropose).format('YYYY/MM/DD');
      fieldsValue.dateImportExpected = moment(fieldsValue.dateImportExpected).format('YYYY/MM/DD');
      return props.onSubmitUpdate({
        ...props.updateModel, ...fieldsValue, fileImport: fileUploadList.length > 0 ? fileUploadList[0] : undefined
      }, isSendForApproval);
    })
      .catch((error) => console.log(error))
      .finally(() => setLoadingStateButtonSubmit(false));
  };

  useEffect(() => {
    if (props.openUpdateForm) {
      formCreate.resetFields();
      formCreate.setFieldsValue(props.updateModel);
      formCreate.setFieldValue('datePropose', moment(props.updateModel.datePropose));
      formCreate.setFieldValue('dateImportExpected', moment(props.updateModel.dateImportExpected));
      setFileUploadList([]);
      setLoadingStateButtonSubmit(false);
    }
  }, [props.openUpdateForm]);

  return (
    <Modal
      forceRender={true}
      width={'80%'}
      maskClosable={false}
      title='Thêm mới'
      open={props.openUpdateForm}
      onCancel={props.closeUpdateForm}
      footer={[
        <Button key={1} htmlType='submit' loading={loadingStateButtonSubmit} style={{ background: "#d08451", color: "white" }} onClick={() => onFinish(false)}>Lưu bản nháp</Button>,
        <Button key={2} type='primary' htmlType='submit' loading={loadingStateButtonSubmit} onClick={() => onFinish(true)}>Gửi phê duyệt</Button>
      ]}
    >
      <Form
        form={formCreate}
        labelAlign='left'
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
      >
        <Form.Item
          label='Ngày đề xuất'
          name='datePropose'
          required={true}
          rules={[
            {
              required: true,
              message: errorMessage.get('required')
            }
          ]}
        >
          <DatePicker format={['DD/MM/YYYY', 'DD-MM-YYYY']} locale={localeVn} placeholder='Nhập ngày đề xuất' />
        </Form.Item>
        <Form.Item
          label='Ngày dự kiến trả hàng'
          name='dateImportExpected'
          dependencies={['datePropose']}
          required={true}
          rules={[
            {
              required: true,
              message: errorMessage.get('required')
            },
            {
              validator: (_, value) => {
                if (moment(value).isBefore(moment(formCreate.getFieldValue('datePropose')))) {
                  return Promise.reject('Không nhỏ hơn ngày đề xuất');
                }

                return Promise.resolve();
              }
            }
          ]}
        >
          <DatePicker format={['DD/MM/YYYY', 'DD-MM-YYYY']} locale={localeVn} placeholder='Nhập ngày dự kiến trả hàng' />
        </Form.Item>
        <Form.Item
          label='Loại đề xuất'
          name='type'
          valuePropName="value"
        >
          <Radio.Group>
            <Radio value={1}>Trong nước</Radio>
            <Radio value={2}>Nước ngoài</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label='Nhà cung cấp'
          name='supplierId'
          required={true}
          rules={[
            {
              required: true,
              message: errorMessage.get('required')
            }
          ]}
        >
          <Select showSearch options={props.supplierList.map(item => ({ label: item.name, value: item.id }))} />
        </Form.Item>
        <Form.Item
          label='Kho đặt hàng'
          name='stockId'
          required={true}
          rules={[
            {
              required: true,
              message: errorMessage.get('required')
            }
          ]}
        >
          <Select showSearch options={props.stockList.map(item => ({ label: item.name, value: item.id }))} />
        </Form.Item>
        <Form.Item
          label='Ghi chú'
          name='note'
        >
          <Input.TextArea maxLength={1000} placeholder='Nhập ghi chú' />
        </Form.Item>
        <Form.Item
          label='File Import'
          name='fileImport'
        >
          <Upload accept='.xlsx,.xls' fileList={fileUploadList} showUploadList={{ showRemoveIcon: false }} maxCount={1}
            beforeUpload={(file, fileList) => { setFileUploadList(fileList); return false; }}>
            <Button icon={<UploadOutlined />}>Chọn file</Button>
          </Upload>
        </Form.Item>
        <DetailProposal listSupplies={props.suppliesList} listSuppliesCategory={props.suppliesCategory}
          proposalId={props.updateModel.id} listSuppliesKind={props.suppliesKind} />
      </Form>
    </Modal >
  )
}

export default UpdateForm;
