import { useState } from 'react';
import { Button, Form, Upload, message } from 'antd';
import FormItem from "antd/es/form/FormItem";
import Modal from "antd/lib/modal/Modal";
import { UploadOutlined } from '@ant-design/icons';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import { importCheckTestScore } from '@/apis/services/TestScoreService';
import { Code } from '@/apis';
import CheckResult from './CheckResult';
import { ResponseData } from '@/apis/models/ResponseData';
import { FormCode } from '@/apis/models/data';

interface CheckTestCodeFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (value: FormData) => void;
}

const CheckTestCodeForm: React.FC<CheckTestCodeFormProps> = (props) => {

    const { visible, onCancel, onSubmit } = props;
    const [submitLoading, setsubmitLoading] = useState(false);
    const [openResult, setOpenResult] = useState(false);
    const [formCodes, setFormCodes] = useState<Array<FormCode> | []>([]);

    const [form] = Form.useForm();

    const [file, setFile] = useState<UploadFile | null>();
    let formData = new FormData();
    const submitCheckTestCode = async (value: FormData) => {
        setsubmitLoading(true);
        const res = await importCheckTestScore(value);
        if (res.code == Code._200) {
            setOpenResult(true);
            setFormCodes((res.data || []) as Array<FormCode>);
            console.log(res.data);
            message.success('Thành công !');
            setsubmitLoading(false);
        } else {
            message.error(res.message);
            setsubmitLoading(false);
        }
    }

    const onFinish = () => {
        formData.append('file', file as RcFile);
        submitCheckTestCode(formData);
    }

    return (
        <Modal
            destroyOnClose
            width={'40%'}
            maskClosable={false}
            title='Kiểm tra mã đề đã thi'
            open={visible}
            onCancel={() => onCancel()}
            footer={[
                <Button key='back' onClick={() => onCancel()}>
                    Hủy
                </Button>,
                <Button key='submit' type='primary' htmlType='submit' loading={submitLoading} onClick={() => onFinish()}>
                    Kiểm tra
                </Button>,
            ]}
        >
            <Form
                form={form}
            >
                <FormItem
                    label='File đính kèm'
                    name='file'
                    rules={[{ required: true, message: "Chọn file đính kèm trước khi upload" }]}
                >
                    <Upload
                        listType='picture'
                        showUploadList={{ showRemoveIcon: true }}
                        onRemove={() => setFile(null)}
                        beforeUpload={(file) => {
                            setFile(file);
                            return false;
                        }}
                        maxCount={1}
                    >
                        <Button icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                </FormItem>
            </Form>
            <Modal
                open={openResult}
                onCancel={() => setOpenResult(false)}
                width={500}
                footer={null}
            >
                <CheckResult
                    data={formCodes}
                />
            </Modal>
        </Modal>
    )
};


export default CheckTestCodeForm;