import { StockListModel, SupplierModel, SuppliesCategoryModel, SuppliesKindModel, SuppliesModel } from '@/apis';
import { ApproveProposalModel, ImportStockProposalResponse } from '@/apis/models/data';
import { getDownloadImportStockProposal } from '@/apis/services/ImportStockProposalService';
import DetailProposal from '@/components/ImportStockProposal/DetailProposal';
import { errorMessage, importStockProposalStatus } from '@/utils/constants';
import { Button, Col, DatePicker, Form, Input, Modal, Radio, Row, Select, Space } from 'antd';
import localeVn from 'antd/es/date-picker/locale/vi_VN';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface DetailFormProps {
  openDetailModal: boolean;
  closeDetailModal: () => void;
  approveProposal: (params: ApproveProposalModel) => Promise<void>;
  stockList: StockListModel[];
  supplierList: SupplierModel[];
  suppliesKind: SuppliesKindModel[];
  suppliesCategory: SuppliesCategoryModel[];
  updateModel: Partial<ImportStockProposalResponse>;
  suppliesList: SuppliesModel[];
  listStockUserManage: string[];
}

const DetailForm: React.FC<DetailFormProps> = props => {
  let isUserManageStock = props.listStockUserManage.includes(props.updateModel.stockId ?? '');
  const [formCreate] = Form.useForm();
  const [formApprove] = Form.useForm();
  const [loadingStateButtonSubmit, setLoadingStateButtonSubmit] = useState<boolean>(false);
  const [requiredUpload, setRequiredUpload] = useState<boolean>(false);
  const [loadingDownloadProposal, setLoadingDownloadProposal] = useState<boolean>(false);

  const onFinish = (isApprove: boolean) => {
    formApprove.validateFields().then(fieldsValue => {
      setLoadingStateButtonSubmit(true);
      return props.approveProposal({ ...fieldsValue, isApprove: isApprove, id: props.updateModel.id });
    })
      .catch((error) => console.log(error))
      .finally(() => setLoadingStateButtonSubmit(false));
  };

  const downloadProposal = () => {
    setLoadingDownloadProposal(true);
    getDownloadImportStockProposal(props.updateModel.id)
      .then(response => {
        var url = URL.createObjectURL(response);
        var elm = document.createElement('a');
        elm.href = url;
        elm.setAttribute('download', `Proposal_${moment().format('YYYYMMDDHHmmss')}.xlsx`);
        elm.click();
        elm.remove();
        URL.revokeObjectURL(url);
      }).catch().finally(() => setLoadingDownloadProposal(false));
  };

  useEffect(() => {
    if (props.openDetailModal) {
      formCreate.resetFields();
      formCreate.setFieldsValue(props.updateModel);
      formCreate.setFieldValue('datePropose', moment(props.updateModel.datePropose));
      formCreate.setFieldValue('dateImportExpected', moment(props.updateModel.dateImportExpected));

      formApprove.resetFields();
      formApprove.setFieldValue('reasonReject', props.updateModel.reasonReject);

      setLoadingStateButtonSubmit(false);
    }
  }, [props.openDetailModal]);

  useEffect(() => { formApprove.validateFields(['reasonReject']) }, [requiredUpload])

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
              props.updateModel.status == importStockProposalStatus.waitingForApprove && isUserManageStock &&
              <>
                <Button key={1} type='primary' danger htmlType='submit' loading={loadingStateButtonSubmit} onClick={() => { setRequiredUpload(true); onFinish(false); }}>Từ chối</Button>
                <Button key={2} type='primary' htmlType='submit' loading={loadingStateButtonSubmit} onClick={() => { setRequiredUpload(false); onFinish(true); }}>Phê duyệt</Button>
              </>
            }
            {
              props.updateModel.status == importStockProposalStatus.approve &&
              <Button key={3} type='primary' htmlType='button' loading={loadingDownloadProposal} onClick={() => { downloadProposal() }} >In phiếu đề xuất</Button>
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
        <DetailProposal listSupplies={props.suppliesList} listSuppliesCategory={props.suppliesCategory}
          proposalId={props.updateModel.id} listSuppliesKind={props.suppliesKind} />
      </Form>
      <Form
        form={formApprove}
        labelAlign='left'
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        disabled={props.updateModel.status != importStockProposalStatus.waitingForApprove || !isUserManageStock}
        style={{ marginTop: '16px' }}
      >
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              label='Lý do từ chối'
              name='reasonReject'
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
