import { StockListModel, UserManageStockUpdateModel, UserModel } from '@/apis';
import { getUserManageStock } from '@/apis/services/UserManageStockService'
import { Form, Input, Modal, Select } from 'antd';
import { useEffect, useState } from 'react';
import { userApproveType } from '@/utils/constants';

interface UpdateFormProps {
  openUpdateForm: boolean;
  onSubmitUpdate: (values: Omit<UserManageStockUpdateModel, 'id'>) => Promise<void>;
  updateModel: Partial<StockListModel>;
  closeUpdateForm: () => void;
  listUser: UserModel[];
}

interface UserManageStockDetail {
  id: string;
  stockId: string;
  userId: string[];
  approveType: number;
}

const UpdateForm: React.FC<UpdateFormProps> = props => {
  const [form] = Form.useForm();
  const [loadingStateSubmitButton, setLoadingStateSubmitButton] = useState<boolean>(false);
  const onFinish = () => {
    form.validateFields().then(fieldsValue => {
      setLoadingStateSubmitButton(true);
      return props.onSubmitUpdate({ stockId: props.updateModel.id, ...fieldsValue });
    })
      .catch(error => console.log(error))
      .finally(() => setLoadingStateSubmitButton(false));
  };

  useEffect(() => {
    form.setFieldsValue(props.updateModel)
    getUserManageStock(props.updateModel.id)
      .then(response => {
        let data = response.data as UserManageStockDetail[];
        let listUserApproveProposal = data.filter(item => item.approveType == userApproveType.proposal).map(item => item.userId);
        let listUserApproveReceipt = data.filter(item => item.approveType == userApproveType.receipt).map(item => item.userId);
        form.setFieldValue('userApproveProposal', listUserApproveProposal);
        form.setFieldValue('userApproveReceipt', listUserApproveReceipt);
      });
  }, [props.updateModel]);

  return (
    <Modal
      width='50%'
      maskClosable={false}
      title='Chỉnh sửa'
      open={props.openUpdateForm}
      onCancel={() => props.closeUpdateForm()}
      cancelText='Hủy'
      okText='Lưu'
      onOk={onFinish}
      okButtonProps={{ htmlType: 'submit', loading: loadingStateSubmitButton }}
    >
      <Form
        form={form}
        labelAlign='left'
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        labelWrap
        colon={false}
      >
        <Form.Item
          label='Mã kho'
          name='code'
        >
          <Input placeholder='Nhập mã kho' maxLength={255} readOnly bordered={false} />
        </Form.Item>
        <Form.Item
          label='Tên kho'
          name='name'
        >
          <Input placeholder='Nhập tên kho' maxLength={255} readOnly bordered={false} />
        </Form.Item>
        <Form.Item
          label='User phê duyệt phiếu đề xuất'
          name='userApproveProposal'
        >
          <Select allowClear mode="multiple" optionFilterProp="label"
            options={props.listUser.map(user => ({
              label: user.username,
              key: user.syncId,
              value: user.syncId
            }))} />
        </Form.Item>
        <Form.Item
          label='User phê duyệt phiếu nhập'
          name='userApproveReceipt'
        >
          <Select allowClear mode="multiple" optionFilterProp="label"
            options={props.listUser.map(user => ({
              label: user.username,
              key: user.syncId,
              value: user.syncId
            }))} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UpdateForm;
