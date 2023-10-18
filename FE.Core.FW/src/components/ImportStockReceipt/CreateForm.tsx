import { ImportStockReceiptModel, StockListModel, SupplierModel } from '@/apis';
import { SelectOptionModel } from '@/apis/models/data';
import { errorMessage } from '@/utils/constants';
import { UploadOutlined } from '@ant-design/icons';
import { AutoComplete, Button, DatePicker, Form, Input, Modal, Radio, Select, Upload, UploadFile } from 'antd';
import localeVn from 'antd/es/date-picker/locale/vi_VN';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface CreateFormProps {
  openCreateForm: boolean;
  onSubmitCreate: (values: ImportStockReceiptModel, isSendForApproval: boolean) => Promise<void>;
  closeCreateForm: () => void;
  areaData: SelectOptionModel[];
  stockList: StockListModel[];
  supplierList: SupplierModel[];
  listProposalApprovedCode: string[];
}

const CreateForm: React.FC<CreateFormProps> = props => {
  const [formCreate] = Form.useForm();
  const [loadingStateButtonSubmit, setLoadingStateButtonSubmit] = useState<boolean>(false);
  const [stockList, setStockList] = useState<StockListModel[]>([]);
  const [fileUploadList, setFileUploadList] = useState<UploadFile[]>([]);

  const formVals: Partial<ImportStockReceiptModel> = {
    importMethod: 1,
    batchNote: '',
    importStockProposalCode: '',
    note: '',
    stockId: '',
    supplierId: ''
  };

  const onFinish = (isSendForApproval: boolean = false) => {
    formCreate.validateFields().then(fieldsValue => {
      setLoadingStateButtonSubmit(true);
      fieldsValue.datePropose = moment(fieldsValue.datePropose).format('YYYY/MM/DD');
      return props.onSubmitCreate({ ...formVals, ...fieldsValue, fileImport: fileUploadList[0] }, isSendForApproval);
    })
      .catch((error) => console.log(error))
      .finally(() => setLoadingStateButtonSubmit(false));
  };

  useEffect(() => {
    if (props.openCreateForm) {
      formCreate.resetFields();
      formCreate.setFieldsValue({ ...formVals, areaId: '' });
      formCreate.setFieldValue('datePropose', moment());
      setFileUploadList([]);
      setLoadingStateButtonSubmit(false);
    }
  }, [props.openCreateForm]);

  return (
    <Modal
      forceRender={true}
      width={'80%'}
      maskClosable={false}
      title='Thêm mới'
      open={props.openCreateForm}
      onCancel={props.closeCreateForm}
      footer={[
        <Button key={1} htmlType='submit' loading={loadingStateButtonSubmit} style={{ background: "#d08451", color: "white" }} onClick={() => onFinish(false)}>Lưu bản nháp</Button>,
        <Button key={2} type='primary' htmlType='submit' loading={loadingStateButtonSubmit} onClick={() => onFinish(true)}>Gửi phê duyệt</Button>,
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
          label='Số đề nghị'
          name='importStockProposalCode'
        >
          <AutoComplete allowClear backfill={true}
            options={props.listProposalApprovedCode.map(item => ({ value: item }))}
            placeholder='Nhập số đề nghị' maxLength={255}
            filterOption={(inputValue, option) => option?.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
          />
        </Form.Item>
        <Form.Item
          label='Chi nhánh'
          name='areaId'
          required={true}
          rules={[
            {
              required: true,
              message: errorMessage.get('required')
            }
          ]}
        >
          <Select showSearch options={props.areaData} onChange={value => {
            setStockList(props.stockList.filter(item => item.areaId == value));
            formCreate.setFieldValue('stockId', '');
          }} />
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
          <Select showSearch options={stockList.map(item => ({ label: item.name, value: item.id }))} />
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
          label='Đợt nhập'
          name='batchNote'
        >
          <Input maxLength={255} />
        </Form.Item>
        <Form.Item
          label='Ghi chú'
          name='note'
        >
          <Input.TextArea maxLength={1000} placeholder='Nhập ghi chú' />
        </Form.Item>
        <Form.Item
          label='Phương thức nhập kho'
          name='importMethod'
          valuePropName="value"
        >
          <Radio.Group>
            <Radio value={1}>Vật tư</Radio>
            <Radio value={2}>Đề thi</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label='File Import'
          name='fileImport'
          required={true}
          rules={[
            {
              required: true,
              message: errorMessage.get('required')
            }
          ]}
        >
          <Upload accept='.xlsx,.xls' fileList={fileUploadList} showUploadList={{ showRemoveIcon: false }} maxCount={1}
            beforeUpload={(file, fileList) => { setFileUploadList(fileList); return false; }}>
            <Button icon={<UploadOutlined />}>Chọn file</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateForm;
