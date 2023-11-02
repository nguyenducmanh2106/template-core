import UploadFileComponent from '@/components/UploadFile/Index';
import { DeleteOutlined } from '@ant-design/icons';
import type { ProFormInstance } from '@ant-design/pro-components';
import {
    ProCard,
    ProForm,
    ProFormCheckbox,
    ProFormDatePicker,
    ProFormDateRangePicker,
    ProFormItem,
    ProFormSelect,
    ProFormText,
    ProFormTextArea,
    StepsForm,
} from '@ant-design/pro-components';
import { Button, Col, Input, Row, Tooltip, UploadFile, message } from 'antd';
import { useRef, useState } from 'react';

const waitTime = (time: number = 0) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
};
const validateMessages = {
    required: '${label} không được để trống',
    whitespace: '${label} không được để trống',
    types: {
        email: '${label} không đúng định dạng email',
        number: '${label} không đúng định dạng số',
    },
    number: {
        range: '${label} must be between ${min} and ${max}',
    },
};

function ContractCreate() {
    const formRef = useRef<ProFormInstance>();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const onHandleChangeFile = (value: UploadFile[]) => {
        // console.log(value)
        setFileList([...value])
    }
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
    // const [dataSource, setDataSource] = useState<readonly TargetMappingModel[]>([]);
    // const dataSource = useRef<readonly TargetMappingModel[]>([]);
    // const columns: ProColumns<TargetMappingModel>[] = [
    //     {
    //         title: 'Loại sản phẩm',
    //         dataIndex: 'productTypeId',
    //         key: 'productTypeId',
    //         width: '220px',
    //         valueType: 'select',
    //         fixed: 'left',
    //         // valueEnum: {
    //         //     all: { text: 'Tất cả', status: '4e7befd7-805a-4445-8c12-b7502e075986' },
    //         //     open: {
    //         //         text: 'Lỗi',
    //         //         status: 'Error',
    //         //     },
    //         //     closed: {
    //         //         text: 'Thành công',
    //         //         status: 'Success',
    //         //     },
    //         // },
    //         renderFormItem: (schema, config, form) => {
    //             return (
    //                 <Select
    //                     showSearch
    //                     optionFilterProp="children"
    //                     filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
    //                     filterSort={(optionA, optionB) =>
    //                         (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
    //                     }
    //                     placeholder='-Chọn bài thi-'
    //                     options={state.productTypes}
    //                 />
    //             )
    //         },
    //         formItemProps: {
    //             rules: [
    //                 {
    //                     required: true,
    //                     whitespace: true,
    //                     message: 'Không được để trống',
    //                 },
    //                 ({ getFieldValue, getFieldsValue }: any) => ({
    //                     validator(_: any, value: any) {
    //                         // console.log(_, value)
    //                         const id = value as string
    //                         const keyProductTypes = dataSource?.current?.map((item) => item.productTypeId)
    //                         // const checkExist = keyProductTypes?.some((item) => item === id)
    //                         const occurrences = keyProductTypes.reduce((count, item) => (item === id ? count + 1 : count), 0);
    //                         // console.log(occurrences)
    //                         if (occurrences < 2) {
    //                             return Promise.resolve();
    //                         }
    //                         return Promise.reject(new Error('Đã tồn tại'));
    //                     },
    //                 }),
    //                 // {
    //                 //     message: '必须包含数字',
    //                 //     pattern: /[0-9]/,
    //                 // },
    //                 // {
    //                 //     max: 16,
    //                 //     whitespace: true,
    //                 //     message: '最长为 16 位',
    //                 // },
    //                 // {
    //                 //     min: 6,
    //                 //     whitespace: true,
    //                 //     message: '最小为 6 位',
    //                 // },
    //             ],
    //         },
    //     },
    //     {
    //         title: 'Tháng 1',
    //         dataIndex: 'jan',
    //         key: 'jan',
    //         width: '360px',
    //         children: [
    //             {
    //                 title: 'Doanh thu',
    //                 dataIndex: 'jan',
    //                 key: 'jan',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 },
    //             },
    //             {
    //                 title: 'Số lượng',
    //                 dataIndex: 'quantityJan',
    //                 key: 'quantityJan',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 }
    //             }
    //         ]
    //     },
    //     {
    //         title: 'Tháng 2',
    //         dataIndex: 'feb',
    //         key: 'feb',
    //         width: '360px',
    //         children: [
    //             {
    //                 title: 'Doanh thu',
    //                 dataIndex: 'feb',
    //                 key: 'feb',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 },
    //             },
    //             {
    //                 title: 'Số lượng',
    //                 dataIndex: 'quantityFeb',
    //                 key: 'quantityFeb',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 }
    //             }
    //         ]
    //     },
    //     {
    //         title: 'Tháng 3',
    //         dataIndex: 'mar',
    //         key: 'mar',
    //         width: '360px',
    //         children: [
    //             {
    //                 title: 'Doanh thu',
    //                 dataIndex: 'mar',
    //                 key: 'mar',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 },
    //             },
    //             {
    //                 title: 'Số lượng',
    //                 dataIndex: 'quantityMar',
    //                 key: 'quantityMar',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 }
    //             }
    //         ]
    //     },
    //     {
    //         title: 'Tháng 4',
    //         dataIndex: 'apr',
    //         key: 'apr',
    //         width: '360px',
    //         children: [
    //             {
    //                 title: 'Doanh thu',
    //                 dataIndex: 'apr',
    //                 key: 'apr',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 },
    //             },
    //             {
    //                 title: 'Số lượng',
    //                 dataIndex: 'quantityApr',
    //                 key: 'quantityApr',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 }
    //             }
    //         ]
    //     },
    //     {
    //         title: 'Tháng 5',
    //         dataIndex: 'may',
    //         key: 'may',
    //         width: '360px',
    //         children: [
    //             {
    //                 title: 'Doanh thu',
    //                 dataIndex: 'may',
    //                 key: 'may',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 },
    //             },
    //             {
    //                 title: 'Số lượng',
    //                 dataIndex: 'quantityMay',
    //                 key: 'quantityMay',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 }
    //             }
    //         ]
    //     },
    //     {
    //         title: 'Tháng 6',
    //         dataIndex: 'jun',
    //         key: 'jun',
    //         width: '360px',
    //         children: [
    //             {
    //                 title: 'Doanh thu',
    //                 dataIndex: 'jun',
    //                 key: 'jun',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 },
    //             },
    //             {
    //                 title: 'Số lượng',
    //                 dataIndex: 'quantityJun',
    //                 key: 'quantityJun',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 }
    //             }
    //         ]
    //     },
    //     {
    //         title: 'Tháng 7',
    //         dataIndex: 'july',
    //         key: 'july',
    //         width: '360px',
    //         children: [
    //             {
    //                 title: 'Doanh thu',
    //                 dataIndex: 'july',
    //                 key: 'july',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 },
    //             },
    //             {
    //                 title: 'Số lượng',
    //                 dataIndex: 'quantityJuly',
    //                 key: 'quantityJuly',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 }
    //             }
    //         ]
    //     },
    //     {
    //         title: 'Tháng 8',
    //         dataIndex: 'aug',
    //         key: 'aug',
    //         width: '360px',
    //         children: [
    //             {
    //                 title: 'Doanh thu',
    //                 dataIndex: 'aug',
    //                 key: 'aug',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 },
    //             },
    //             {
    //                 title: 'Số lượng',
    //                 dataIndex: 'quantityAug',
    //                 key: 'quantityAug',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 }
    //             }
    //         ]
    //     },
    //     {
    //         title: 'Tháng 9',
    //         dataIndex: 'sep',
    //         key: 'sep',
    //         width: '360px',
    //         children: [
    //             {
    //                 title: 'Doanh thu',
    //                 dataIndex: 'sep',
    //                 key: 'sep',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 },
    //             },
    //             {
    //                 title: 'Số lượng',
    //                 dataIndex: 'quantitySep',
    //                 key: 'quantitySep',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 }
    //             }
    //         ]
    //     },
    //     {
    //         title: 'Tháng 10',
    //         dataIndex: 'oct',
    //         key: 'oct',
    //         width: '360px',
    //         children: [
    //             {
    //                 title: 'Doanh thu',
    //                 dataIndex: 'oct',
    //                 key: 'oct',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 },
    //             },
    //             {
    //                 title: 'Số lượng',
    //                 dataIndex: 'quantityOct',
    //                 key: 'quantityOct',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 }
    //             }
    //         ]
    //     },
    //     {
    //         title: 'Tháng 11',
    //         dataIndex: 'nov',
    //         key: 'nov',
    //         width: '360px',
    //         children: [
    //             {
    //                 title: 'Doanh thu',
    //                 dataIndex: 'nov',
    //                 key: 'nov',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 },
    //             },
    //             {
    //                 title: 'Số lượng',
    //                 dataIndex: 'quantityNov',
    //                 key: 'quantityNov',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 }
    //             }
    //         ]
    //     },
    //     {
    //         title: 'Tháng 12',
    //         dataIndex: 'nov',
    //         key: 'nov',
    //         width: '360px',
    //         children: [
    //             {
    //                 title: 'Doanh thu',
    //                 dataIndex: 'dec',
    //                 key: 'dec',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 },
    //             },
    //             {
    //                 title: 'Số lượng',
    //                 dataIndex: 'quantityDec',
    //                 key: 'quantityDec',
    //                 width: '180px',
    //                 valueType: 'digit',
    //                 fieldProps: {
    //                     formatter: (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    //                     parser: (value: any) => value!.replace(/(\.*)/g, '').replace('.', ','),
    //                     style: { width: '100%' },
    //                     controls: false
    //                 }
    //             }
    //         ]
    //     },
    //     {
    //         title: 'Hành động',
    //         key: 'Action',
    //         valueType: 'option',
    //         fixed: 'right',
    //         align: 'center',
    //         width: 100,
    //         render: () => {
    //             return (
    //                 <Tooltip title="Xóa">
    //                     <Button type="text" shape='circle'>
    //                         <DeleteOutlined />
    //                     </Button>
    //                 </Tooltip>
    //             )
    //         },
    //     },
    // ];
    return (
        <ProCard>
            <StepsForm<{
                name: string;
            }>
                formRef={formRef}
                onFinish={async () => {
                    await waitTime(100);
                    message.success('提交成功');
                }}
                formProps={{
                    validateMessages: {
                        required: '此项为必填项',
                    },
                }}
            >
                <StepsForm.StepForm<{
                    name: string;
                }>
                    name="step-1"
                    title="Thông tin hợp đồng"
                    stepProps={{
                        description: 'Nội dung cơ bản',
                    }}
                    onFinish={async () => {
                        console.log(formRef.current?.getFieldsValue());
                        await waitTime(100);
                        return true;
                    }}
                    validateMessages={validateMessages}

                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <ProFormText
                                name="ContractNumber"
                                label="Số hiệu hợp đồng"
                                width="lg"
                                tooltip="Số hiệu hợp đồng"
                                placeholder="Nhập số hiệu hợp đồng"
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormText
                                name="Description"
                                label="Diễn giải"
                                width="lg"
                                tooltip="Diễn giải"
                                placeholder="Nhập diễn giải"
                                rules={[{ required: true }]}
                            />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <ProFormSelect
                                label="Loại hợp đồng"
                                name="ContractTypeId"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                                initialValue="1"
                                options={[
                                    {
                                        value: '1',
                                        label: 'Nguyên tắc',
                                    },
                                    { value: '2', label: 'HĐ sử dụng thực tế' },
                                ]}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormSelect
                                label="Khách hàng"
                                name="CustomerId"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                                initialValue="1"
                                options={[
                                    {
                                        value: '1',
                                        label: 'Nguyên tắc',
                                    },
                                    { value: '2', label: 'HĐ sử dụng thực tế' },
                                ]}
                            />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <ProFormSelect
                                label="Tỉnh/TP"
                                name="ProvinceId"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                                initialValue="1"
                                options={[
                                    {
                                        value: '1',
                                        label: 'Nguyên tắc',
                                    },
                                    { value: '2', label: 'HĐ sử dụng thực tế' },
                                ]}
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormSelect
                                label="Quận/Huyện"
                                name="DistrictId"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                                initialValue="1"
                                options={[
                                    {
                                        value: '1',
                                        label: 'Nguyên tắc',
                                    },
                                    { value: '2', label: 'HĐ sử dụng thực tế' },
                                ]}
                            />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <ProFormText
                                name="ContractValue"
                                label="Giá trị hợp đồng"
                                width="lg"
                            />
                        </Col>
                        <Col span={12}>
                            <ProFormDateRangePicker name="ContractDate" label="Thời hạn hợp đồng" />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <ProFormItem name="FileUpload">
                                <UploadFileComponent fileListInit={fileList} onChangeFile={onHandleChangeFile} />
                            </ProFormItem>
                        </Col>
                        <Col span={12}>

                        </Col>
                    </Row>
                </StepsForm.StepForm>
                <StepsForm.StepForm<{
                    checkbox: string;
                }>
                    name="step-2"
                    title="Sản phẩm"
                    stepProps={{
                        description: 'Sản phẩm trong hợp đồng',
                    }}
                    onFinish={async () => {
                        console.log(formRef.current?.getFieldsValue());
                        return true;
                    }}
                >
                    <ProFormItem>
                        {/* <EditableProTable<TargetMappingModel>
                            // headerTitle="可编辑表格"
                            columns={columns}
                            name="Targets"
                            rowKey="id"
                            scroll={{ x: '100vw', y: '400px' }}
                            // value={dataSource.current}
                            onChange={onHandleChangeSource}
                            recordCreatorProps={{
                                newRecordType: 'dataSource',
                                record: () => ({
                                    id: uuidv4(),
                                }),
                            }}
                            editable={{
                                type: 'multiple',
                                deleteText: <Tooltip title="Xóa">
                                    <Button type="text" shape='circle'>
                                        <DeleteOutlined />
                                    </Button>
                                </Tooltip>,
                                deletePopconfirmMessage: <>Đồng ý xóa?</>,
                                editableKeys,
                                actionRender: (row, config, defaultDoms) => {
                                    return [defaultDoms.delete];
                                },
                                onValuesChange: (record, recordList) => {
                                    // setDataSource(recordList)
                                    dataSource.current = recordList
                                },
                                onChange: setEditableRowKeys,
                                onDelete: (key: any, row: any) => {
                                    return new Promise((resolve) => {
                                        console.log(key, row)
                                        setTimeout(() => {
                                            resolve(true);
                                        }, 0);
                                    });
                                }
                            }}
                        /> */}
                    </ProFormItem>
                </StepsForm.StepForm>
                <StepsForm.StepForm<{
                    checkbox: string;
                }>
                    name="step-3"
                    title="Kế hoạch bán hàng"
                    stepProps={{
                        description: 'Thông tin kế hoạch bán hàng',
                    }}
                    onFinish={async () => {
                        console.log(formRef.current?.getFieldsValue());
                        return true;
                    }}
                >
                    <ProFormCheckbox.Group
                        name="checkbox"
                        label="迁移类型"
                        width="lg"
                        options={['结构迁移', '全量迁移', '增量迁移', '全量校验']}
                    />
                    <ProForm.Group>
                        <ProFormText name="dbname" label="业务 DB 用户名" />
                        <ProFormDatePicker
                            name="datetime"
                            label="记录保存时间"
                            width="sm"
                        />
                        <ProFormCheckbox.Group
                            name="checkbox"
                            label="迁移类型"
                            options={['完整 LOB', '不同步 LOB', '受限制 LOB']}
                        />
                    </ProForm.Group>
                </StepsForm.StepForm>
                <StepsForm.StepForm
                    name="step-4"
                    title="Chọn luồng ký"
                    stepProps={{
                        description: 'Chọn luồng trình ký',
                    }}
                >
                    <ProFormCheckbox.Group
                        name="checkbox"
                        label="部署单元"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                        options={['部署单元1', '部署单元2', '部署单元3']}
                    />
                    <ProFormSelect
                        label="部署分组策略"
                        name="remark"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                        initialValue="1"
                        options={[
                            {
                                value: '1',
                                label: '策略一',
                            },
                            { value: '2', label: '策略二' },
                        ]}
                    />
                    <ProFormSelect
                        label="Pod 调度策略"
                        name="remark2"
                        initialValue="2"
                        options={[
                            {
                                value: '1',
                                label: '策略一',
                            },
                            { value: '2', label: '策略二' },
                        ]}
                    />
                </StepsForm.StepForm>
            </StepsForm>
        </ProCard>
    );
};

export default ContractCreate