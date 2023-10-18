import { useState } from 'react';
import { Button, Form, PageHeader, Table, Upload, message } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { FormCode } from '@/apis/models/data';

interface CheckResultProps {
    data: Array<FormCode> | [];
}

const CheckResult: React.FC<CheckResultProps> = (props) => {
    const { data } = props;

    const [form] = Form.useForm();

    const columns: ColumnsType<FormCode> = [
        {
            title: 'Mã đề thi',
            dataIndex: 'formCode',
            align: 'center'
        }
    ]

    return (
        <div>
            <PageHeader 
                title={"Danh sách"}
                extra={[
                    <Button type='primary' key={1}>Xuất Excel</Button>
                ]}
            />
            <Table
                rowKey={(record) => record.formCode}
                columns={columns}
                dataSource={data}
            >
            </Table>
        </div>
    )
};


export default CheckResult;