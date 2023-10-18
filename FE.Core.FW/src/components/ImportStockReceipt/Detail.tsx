import { StockListModel, SupplierModel, SuppliesCategoryModel, SuppliesKindModel, SuppliesModel } from '@/apis';
import { ApproveReceiptModel, ImportStockReceiptResponse, SelectOptionModel } from '@/apis/models/data';
import { getDownloadImportStockReceipt } from '@/apis/services/ImportStockReceiptService';
import DetailReceipt from '@/components/ImportStockReceipt/DetailReceipt';
import { errorMessage, importStockReceiptStatus } from '@/utils/constants';
import { Button, Col, DatePicker, Form, Input, Modal, Radio, Row, Select, Space } from 'antd';
import localeVn from 'antd/es/date-picker/locale/vi_VN';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface DetailFormProps {
  openDetailModal: boolean;
  closeDetailModal: () => void;
  approveReceipt: (params: ApproveReceiptModel) => Promise<void>;
  areaData: SelectOptionModel[];
  stockList: StockListModel[];
  supplierList: SupplierModel[];
  suppliesKind: SuppliesKindModel[];
  suppliesCategory: SuppliesCategoryModel[];
  updateModel: Partial<ImportStockReceiptResponse>;
  suppliesList: SuppliesModel[];
  listStockUserManage: string[];
}

const DetailForm: React.FC<DetailFormProps> = props => {
  let isUserManageStock = props.listStockUserManage.includes(props.updateModel.stockId ?? '');
  const [formCreate] = Form.useForm();
  const [formApprove] = Form.useForm();
  const [loadingStateButtonSubmit, setLoadingStateButtonSubmit] = useState<boolean>(false);
  const [stockList, setStockList] = useState<StockListModel[]>([]);
  const [requiredUpload, setRequiredUpload] = useState<boolean>(false);
  const [loadingDownloadReceipt, setLoadingDownloadReceipt] = useState<boolean>(false);

  const onFinish = (isApprove: boolean) => {
    formApprove.validateFields().then(fieldsValue => {
      setLoadingStateButtonSubmit(true);
      return props.approveReceipt({ ...fieldsValue, isApprove: isApprove, id: props.updateModel.id });
    })
      .catch((error) => console.log(error))
      .finally(() => setLoadingStateButtonSubmit(false));
  };

  const downloadReceipt = () => {
    setLoadingDownloadReceipt(true);
    getDownloadImportStockReceipt(props.updateModel.id)
      .then(response => {
        var url = URL.createObjectURL(response);
        var elm = document.createElement('a');
        elm.href = url;
        elm.setAttribute('download', `receipt_${moment().format('YYYYMMDDHHmmss')}.xlsx`);
        elm.click();
        elm.remove();
        URL.revokeObjectURL(url);
      }).catch().finally(() => setLoadingDownloadReceipt(false));
  };

  useEffect(() => {
    if (props.openDetailModal) {
      formCreate.resetFields();
      formApprove.resetFields();
      formApprove.setFieldValue('rejectReason', props.updateModel.reasonReject);
      formCreate.setFieldsValue(props.updateModel);
      formCreate.setFieldValue('datePropose', moment(props.updateModel.datePropose));
      let stock = props.stockList.find(item => item.id == props.updateModel.stockId);
      let area = props.areaData.find(item => item.value == stock?.areaId);
      setStockList(props.stockList.filter(item => item.areaId == area?.value));
      formCreate.setFieldValue('areaId', area?.value);
      formCreate.setFieldValue('stockId', stock?.id);
      setLoadingStateButtonSubmit(false);
    }
  }, [props.openDetailModal]);

  useEffect(() => { formApprove.validateFields(['rejectReason']) }, [requiredUpload])

  return (
    <Modal
      forceRender={true}
      width={'80%'}
      maskClosable={false}
      title='Thêm mới'
      open={props.openDetailModal}
      onCancel={props.closeDetailModal}
      footer={
        <Space>
          <>
            {
              props.updateModel.status == 2 && isUserManageStock &&
              <>
                <Button key={1} type='primary' danger htmlType='submit' loading={loadingStateButtonSubmit} onClick={() => { setRequiredUpload(true); onFinish(false); }}>Từ chối</Button>
                <Button key={2} type='primary' htmlType='submit' loading={loadingStateButtonSubmit} onClick={() => { setRequiredUpload(false); onFinish(true); }}>Phê duyệt</Button>
              </>
            }
            {
              props.updateModel.status == 3 &&
              <Button key={3} type='primary' htmlType='button' loading={loadingDownloadReceipt} onClick={() => { downloadReceipt() }} >In phiếu đề xuất</Button>
            }
          </>
        </Space>
      }
    >
      <Form
        form={formCreate}
        labelAlign='left'
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        disabled
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
          <Input placeholder='Nhập số đề nghị' maxLength={255} />
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
        <DetailReceipt listSupplies={props.suppliesList} listSuppliesCategory={props.suppliesCategory}
          receiptId={props.updateModel.id} listSuppliesKind={props.suppliesKind} />
      </Form>
      <Form
        form={formApprove}
        labelAlign='left'
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        disabled={props.updateModel.status != importStockReceiptStatus.waitingForApprove || !isUserManageStock}
        style={{ marginTop: '16px' }}
      >
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              label='Lý do từ chối'
              name='rejectReason'
              required={requiredUpload}
              rules={[
                {
                  required: requiredUpload,
                  message: errorMessage.get('required')
                },
                {
                  whitespace: requiredUpload,
                  message: errorMessage.get('required')
                }
              ]}
            >
              <Input.TextArea maxLength={1000} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default DetailForm;
