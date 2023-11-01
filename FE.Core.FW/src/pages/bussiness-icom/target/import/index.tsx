import { OptionModel, SelectOptionModel } from '@/@types/data';
import { Code, ResponseData, UserModel } from '@/apis';
import { TargetImportModel } from '@/apis/models/TargetImportModel';
import { postCustomer1 } from '@/apis/services/CustomerService';
import { getTarget2, postTarget } from '@/apis/services/TargetService';
import { getUser } from '@/apis/services/UserService';
import { useUserState } from '@/store/user';
import { PermissionAction, layoutCode } from '@/utils/constants';
import { ConvertOptionSelectModel } from '@/utils/convert';
import { hasPermissionRoles } from '@/utils/router';
import { InboxOutlined } from '@ant-design/icons';
import {
    Button,
    Col,
    DatePicker,
    Form,
    FormInstance,
    Modal,
    Row,
    Select,
    Space,
    TreeSelect,
    Typography,
    Upload,
    UploadFile,
    UploadProps,
    message
} from 'antd';
import { DataNode } from 'antd/es/tree';
import dayjs from 'dayjs';
import { useReducer, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';



interface Props {
    open: boolean;
    setOpen: (value: boolean) => void;
    reload: (current: number, pageSize: number) => void;
    iigdepartments: DataNode[],
}
function ImportTarget({ open, setOpen, reload, iigdepartments }: Props) {
    const [searchForm] = Form.useForm();
    // Load
    const initState = {
        typeTargets: [
            {
                label: 'Phòng ban',
                value: '0'
            },
            {
                label: 'Cá nhân',
                value: '1'
            }
        ],
        employees: [
            {
                label: '-Chọn-',
                value: ''
            },
        ]
    };

    const { Title, Paragraph, Text, Link } = Typography;
    const [state, dispatch] = useReducer<(prevState: any, updatedProperty: any) => any>(
        (prevState: any, updatedProperty: any) => ({
            ...prevState,
            ...updatedProperty,
        }),
        initState,
    );

    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalButtonOkText, setModalButtonOkText] = useState('Lưu');

    // Data
    const [buttonLoading, setButtonLoading] = useState<boolean>(false);
    const [buttonOkText, setButtonOkText] = useState<string>('Lưu');

    // searchForm
    const [form] = Form.useForm();
    const formRef = useRef<FormInstance>(null);


    const handleCancel = () => {
        // console.log('Clicked cancel button');
        searchForm.resetFields()
        setOpen(false);
    };
    const validateMessages = {
        required: '${label} không được để trống',
        types: {
            email: '${label} không đúng định dạng email',
            number: '${label} không đúng định dạng số',
        },
        number: {
            range: '${label} must be between ${min} and ${max}',
        },
    };

    const handleOk = async () => {
        setConfirmLoading(true)
        const fieldsValue = await searchForm.validateFields();
        // setModalButtonOkText('Đang xử lý...');
        // setConfirmLoading(true);
        searchForm.resetFields()

        const objBody = {
            ...fieldsValue,
            Year: dayjs(fieldsValue.Year).year(),
            Type: +fieldsValue.Type,
            File: fieldsValue.File?.fileList[0]?.originFileObj

        }
        // console.log(objBody)
        // return

        const response = await postTarget("", objBody);
        setConfirmLoading(false)
        if (response.code === Code._200) {
            message.success(response.message || "Upload file thành công")
            setOpen(false);
            setConfirmLoading(false);
            reload(1, 20)
        }
        else {
            setOpen(false);
            setConfirmLoading(false);
            message.error(response.message || "Thất bại")
        }
    };
    const [file, setFile] = useState<UploadFile>();
    const props: UploadProps = {
        name: 'file',
        multiple: false,
        // action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
        accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel",
        maxCount: 1,
        showUploadList: { showRemoveIcon: true },
        onRemove: () => setFile(undefined),
        beforeUpload: (file) => {
            setFile(file);
            return false;
        },
        defaultFileList: []

    };

    const downloadFileTemplate = async () => {
        // console.log('download');
        const response = await getTarget2();
        if (response.code === Code._200) {
            const { base64: base64Data, extention, name } = response.data as any
            // Tạo một đối tượng Blob từ dữ liệu base64
            // const blob = new Blob(["data:application/octet-stream;base64," + base64Data], { type: 'application/octet-stream' });

            fetch("data:application/octet-stream;base64," + base64Data).then(e => e.blob()).then(blob => {
                // Tạo một URL tạm thời từ Blob
                const url = URL.createObjectURL(blob);

                // Tạo một liên kết tải
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = name + extention; // Đặt tên tệp tải về ở đây

                // Thêm liên kết vào DOM và kích hoạt sự kiện click
                document.body.appendChild(a);
                a.click();

                // Xóa liên kết sau khi tải xong
                document.body.removeChild(a);
            })
        }
        else {
            message.error(response.message || "Thất bại")
        }
    };

    const onHandleChangeDepartment = async () => {
        const fieldsValue = await searchForm.getFieldsValue();
        const filter = {
            ...fieldsValue,
            // page: current,
            // size: pageSize,
        }
        const response: ResponseData<UserModel[]> = await getUser(
            JSON.stringify(filter)
        ) as ResponseData<UserModel[]>;

        const items: SelectOptionModel[] = [];

        response.data?.forEach((item: UserModel) => {
            items.push({
                value: item.username as string,
                label: item.fullname as string,
                key: item.id as string,
            });
        });
        const stateDispatcher = {
            employees: [{
                key: 'Default',
                label: '-Chọn-',
                value: '',
            } as SelectOptionModel].concat(items)
        }
        dispatch(stateDispatcher)
    }
    const user = useRecoilValue(useUserState);
    const permissions = user.permissions
    return (
        <>
            <Modal title="Upload danh sách mục tiêu" open={open} cancelText="Bỏ qua" width={'800px'}
                           /* onOk={onSubmit}*/ okText={modalButtonOkText} style={{ top: 20 }} onCancel={handleCancel}
                confirmLoading={confirmLoading}
                okButtonProps={{ form: 'myFormCreate', htmlType: 'submit' }}
            >
                <Form
                    form={searchForm}
                    name='nest-messages' id="myFormCreate"
                    onFinish={handleOk}
                    validateMessages={validateMessages}
                    initialValues={{
                        ['Year']: dayjs(new Date()),
                        ['Type']: hasPermissionRoles(permissions, layoutCode.icomTarget as string, PermissionAction.ImportDepartment) ? '0' : '1',
                    }}
                >
                    <Row gutter={16} justify='start'>
                        <Col span={24}>
                            <Form.Item label={'Mẫu file upload'} labelAlign='left' labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} name='TemplateFile'>
                                <Space>
                                    <Text>Để tải về mẫu file upload vui lòng</Text>
                                    <Button type='link' onClick={downloadFileTemplate}>Bấm vào đây</Button>
                                </Space>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={'Loại mục tiêu'} labelAlign='left' labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}
                                rules={[{ required: true }]}
                                name='Type'>
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    disabled
                                    filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                                    // filterSort={(optionA, optionB) =>
                                    //     (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                    // }
                                    placeholder='-Chọn-' options={state.typeTargets} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={'Năm thực hiện'}
                                labelAlign='left' labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}
                                name='Year'
                                rules={[{ required: true }]}
                            >
                                <DatePicker picker='year' placeholder='Chọn năm'
                                // format={['YYYY']} 
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={'Phòng ban'} labelAlign='left' labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} name='DepartmentId' rules={[{ required: true, whitespace: true }]}>
                                <TreeSelect
                                    showSearch
                                    treeLine
                                    style={{ width: '100%' }}
                                    // value={value}
                                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                    placeholder="-Chọn phòng ban-"
                                    allowClear
                                    treeDefaultExpandAll
                                    showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                    treeData={iigdepartments}
                                    onChange={onHandleChangeDepartment}
                                />
                            </Form.Item>
                        </Col>
                        {
                            !hasPermissionRoles(permissions, layoutCode.icomTarget as string, PermissionAction.ImportDepartment) ?
                                <Col span={24}>
                                    <Form.Item label={'Nhân viên'} labelAlign='left' labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}
                                        rules={[{ required: true }]}
                                        name='Username'>
                                        <Select
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}

                                            placeholder='-Chọn-' options={state.employees} />
                                    </Form.Item>
                                </Col> : <></>
                        }

                        <Col span={24}>
                            <Form.Item label={'Chọn file upload'} labelAlign='left' labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} name='File'>
                                <Upload.Dragger {...props}>
                                    <p className="ant-upload-drag-icon">
                                        <InboxOutlined />
                                    </p>
                                    <p className="ant-upload-text">Nhấn hoặc thả file vào đây để upload</p>
                                    <p className="ant-upload-hint">
                                        Chỉ hộ trợ tải lên duy nhất 1 file
                                    </p>
                                </Upload.Dragger>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
}

export default ImportTarget;
