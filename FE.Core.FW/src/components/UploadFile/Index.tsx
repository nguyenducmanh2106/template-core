import React, { useState } from 'react';
import { StarOutlined, UploadOutlined } from '@ant-design/icons';
import { message, Modal } from 'antd';
import { Button, Upload } from 'antd';
import { request as __request, useRequest, UseRequestOption } from '@/apis/core/request';
import { postUpload } from '@/apis/services/UploadService';
import { Code } from '@/apis';
import type { UploadFile, UploadProps } from 'antd';
import { UploadChangeParam } from 'antd/es/upload';
interface InputFormProps {
  fileListInit: UploadFile[]
  onChangeFile?: (value: UploadFile[]) => void;
}

const UploadFileComponent: React.FC<InputFormProps> = ({ fileListInit, onChangeFile }: InputFormProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<UploadFile>();
  const handleCancel = () => {
    setPreviewOpen(false)
    setPreviewImage(undefined)
  };

  const [fileList, setFileList] = useState<UploadFile[]>(fileListInit);
  const downloadFileTemplate = async (file: UploadFile) => {
    console.log('downloading')
    // Tạo một liên kết tải
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = `${import.meta.env.VITE_HOST}/${file.url}`;
    a.target = "_blank";
    a.download = file.name; // Đặt tên tệp tải về ở đây

    // Thêm liên kết vào DOM và kích hoạt sự kiện click
    document.body.appendChild(a);
    a.click();

    // Xóa liên kết sau khi tải xong
    document.body.removeChild(a);
  };

  function getIconFile(filename: string) {
    var ext = /^.+\.([^.]+)$/.exec(filename);
    let extension = ext == null ? "" : ext[1];
    return extension;
  }
  const propUploads: UploadProps = {
    name: 'files',
    action: `${import.meta.env.VITE_HOST}/Upload/UploadFiles`,
    headers: {
      authorization: 'authorization-text',
    },
    accept: '.docx,.docx,.xlsx,.xls,image/*,.pdf',
    defaultFileList: fileList,
    multiple: true,
    listType: 'picture',
    onChange(info: UploadChangeParam<UploadFile<any>>) {
      // console.log(info)
      if (info.file.status !== 'uploading') {
        // console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        // message.success(`${info.file.name} file uploaded successfully`);
        // console.log(info.file.response.files[0])
        onChangeFile && onChangeFile(info.fileList)
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onPreview: (file) => {
      console.log(file)
      const filePreview = file.response?.files?.length > 0 ? file.response.files[0] : null
      setPreviewImage(filePreview)
      setPreviewOpen(true);
    },
    onDownload: (file) => {
      const fileDownload = file.response?.files?.length > 0 ? file.response.files[0] : null
      downloadFileTemplate(fileDownload)
    },
    onRemove: (file) => console.log(file),
    progress: {
      strokeColor: {
        '0%': '#108ee9',
        '100%': '#87d068',
      },
      size: 3,
      // format: (percent?: number) => `${parseFloat(percent.toFixed(2))}%`,
    },
    showUploadList: {
      showPreviewIcon: true,
      previewIcon: <StarOutlined onClick={(e) => console.log(e, 'custom removeIcon event')} />,
      showDownloadIcon: true,
      // downloadIcon: 'Download',
      showRemoveIcon: true,
      // removeIcon: <StarOutlined onClick={(e) => console.log(e, 'custom removeIcon event')} />,
    },
  };
  return (
    <>
      <Upload {...propUploads}>
        <Button icon={<UploadOutlined />}>Chọn</Button>
      </Upload>
      {
        previewOpen &&
        <Modal open={previewOpen} title={previewImage?.name ?? "Preview file"} footer={null} onCancel={handleCancel}
          width={'100vw'}
          style={{ top: 0, maxHeight: '100vh' }}
        >
          {/* <iframe
            src={previewImage?.url ? `${import.meta.env.VITE_HOST}/${previewImage?.url}` : ''}
            title={previewImage?.name}
            style={{ width: '100%', minHeight: '100vh', maxHeight: '100vh', border: '1px solid #fff;' }}
          ></iframe> */}
          <div style={{
            display: 'flex',
            flexGrow: '1',
            overflow: 'auto',
            position: 'relative',
            background: '#444',
            // flexDirection: 'row',
            flexWrap: 'nowrap',
            // alignItems: 'self-end',
            // height: `calc(100% - 40px)`
            height: `100vh`
          }}>
            {/^(xls|xlsx|ppt|pps|doc|docx)$/.test(getIconFile(previewImage?.name ?? "")) ?
              <iframe className="viewer-iframe"
                style={{
                  flexGrow: '1',
                  flexWrap: 'nowrap',
                  width: '100%'
                }}
                allowFullScreen={true} scrolling="auto"
                src={previewImage?.url ? `https://view.officeapps.live.com/op/view.aspx?src=${import.meta.env.VITE_HOST}/${previewImage?.url}` : ''}></iframe>
              :
              /^(pdf)$/.test(getIconFile(previewImage?.name ?? "")) ? <iframe className="viewer-iframe"
                style={{
                  flexGrow: '1',
                  flexWrap: 'nowrap',
                  width: '100%'
                }}
                allowFullScreen={true} scrolling="auto"
                src={previewImage?.url ? `${import.meta.env.VITE_HOST}/${previewImage?.url}` : ''}></iframe> :
                <img src={previewImage?.url ? `${import.meta.env.VITE_HOST}/${previewImage?.url}` : ''} style={{ width: '100%', height: '100%' }}></img>
            }
          </div>
        </Modal >
      }

    </>
  );
};
export default UploadFileComponent;
