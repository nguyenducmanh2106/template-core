import React, { useState } from 'react';
import { CloseOutlined, StarOutlined, UploadOutlined } from '@ant-design/icons';
import { message, Modal, Typography } from 'antd';
import { Button, Upload } from 'antd';
import { request as __request, useRequest, UseRequestOption } from '@/apis/core/request';
import { postUpload } from '@/apis/services/UploadService';
import { Code } from '@/apis';
import type { UploadFile, UploadProps } from 'antd';
import { UploadChangeParam } from 'antd/es/upload';
interface InputFormProps {
  fileListInit: UploadFile
}

const FileComponent: React.FC<InputFormProps> = ({ fileListInit }: InputFormProps) => {
  const { Title, Paragraph, Text, Link } = Typography;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<UploadFile>();
  const handleCancel = () => {
    setPreviewOpen(false)
    setPreviewImage(undefined)
  };

  const [fileList, setFileList] = useState<UploadFile>(fileListInit);
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

  const previewFileTemplate = async (file: UploadFile) => {
    setPreviewImage(file)
    setPreviewOpen(true);
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
    // defaultFileList: fileList,
    multiple: true,
    listType: 'picture',
    onPreview: (file) => {
      const filePreview = file.response?.files?.length > 0 ? file.response.files[0] : null
      setPreviewImage(filePreview)
      setPreviewOpen(true);
    },
    onDownload: (file) => {
      const fileDownload = file.response?.files?.length > 0 ? file.response.files[0] : null
      downloadFileTemplate(fileDownload)
    },
  };

  return (
    <>
      <Text onClick={() => previewFileTemplate(fileList)}>
        {fileList?.fileName}
      </Text>
      {
        previewOpen &&
        <Modal open={previewOpen} title={previewImage?.name ?? "Preview file"} footer={null} onCancel={handleCancel}
          closeIcon={<CloseOutlined title="Đóng" style={{ fontSize: '24px' }} />}
          width={'95%'}
          style={{
            top: '20px',
            minHeight: '290px', height: '100%',
            maxHeight: 'calc(100% - 20px)',
          }}
          styles={{
            body: { height: '100%' },
            content: { height: '100%' },
          }}
        >
          <div style={{
            display: 'flex',
            flexGrow: '1',
            overflow: 'auto',
            // position: 'relative',
            background: '#444',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            alignItems: 'self-end',
            height: `calc(100% - 40px)`,
            width: '100%',
          }}>
            {/^(xls|xlsx|ppt|pps|doc|docx)$/.test(getIconFile(previewImage?.name ?? "")) ?
              <iframe className="viewer-iframe"
                width="100%"
                height="100%"
                allowFullScreen={true} scrolling="auto"
                src={previewImage?.url ? `https://view.officeapps.live.com/op/view.aspx?src=${import.meta.env.VITE_HOST}/${previewImage?.url}` : ''}></iframe>
              :
              <iframe className="viewer-iframe"
                width="100%"
                height="100%"
                allowFullScreen={true} scrolling="auto"
                src={previewImage?.url ? `${import.meta.env.VITE_HOST}/${previewImage?.url}` : ''}></iframe>
            }
          </div>
        </Modal >
      }

    </>
  );
};
export default FileComponent;
