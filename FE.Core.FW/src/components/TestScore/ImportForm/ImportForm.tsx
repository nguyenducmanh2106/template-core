import { useState } from 'react';
import { Button, Form, Upload, message } from 'antd';
import FormItem from "antd/es/form/FormItem";
import Modal from "antd/lib/modal/Modal";
import { UploadOutlined } from '@ant-design/icons';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';

interface ImportFormProps {
    visible: boolean;
    onSubmitLoading: boolean;
    onCancel: () => void;
    onSubmit: (value: FormData) => void;
}

const ImportForm: React.FC<ImportFormProps> = (props) => {

    const { visible, onCancel, onSubmitLoading, onSubmit } = props;

    const [form] = Form.useForm();
    const [file, setFile] = useState<UploadFile | null>();
    
    const onFinish = () => {
        const formData = new FormData();
        if(!file){
            message.warning("Chọn file đính kèm trước khi upload");
            return;
        }
        formData.append('file', file as RcFile);
        setFile(null);
        onSubmit(formData);
    }

    return (
        <Modal
            destroyOnClose
            width={'40%'}
            maskClosable={false}
            title='Import dữ liệu điểm thi'
            open={visible}
            onCancel={() => onCancel()}
            footer={[
                <Button key='back' onClick={() => onCancel()}>
                    Hủy
                </Button>,
                <Button key='submit' type='primary' htmlType='submit' loading={onSubmitLoading} onClick={() => onFinish()}>
                    Lưu
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
                        accept='.xls, .xlsx'
                        showUploadList={{ showRemoveIcon: false }}
                        onRemove={() => setFile(null)}
                        beforeUpload={(file) => {
                            setFile(file);
                            return false;
                        }}
                        defaultFileList={[]}
                        maxCount={1}
                    >
                        <Button icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                </FormItem>
            </Form>
        </Modal>
    )
};


export default ImportForm;