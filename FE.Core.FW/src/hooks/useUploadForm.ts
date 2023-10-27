import { UploadFile } from "antd";
import axios from "axios";
import { useRef, useState } from "react";

const useUploadForm = (url: string) => {
    // const [isSuccess, setIsSuccess] = useState(false);
    const [progress, setProgress] = useState(0);
    // const progress = useRef(0);
    const isSuccess = useRef(false);

    const uploadForm = async (formData: FormData): Promise<any> => {
        // setIsSuccess(false);
       
        isSuccess.current = false
        const request = await axios.post(url, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent: any) => {
                const percent = (progressEvent.loaded / progressEvent.total) * 100;
                // console.log(progress)
                // progress.current = percent
                setProgress(percent);
            },
            onDownloadProgress: (progressEvent: any) => {
                const progress = 50 + (progressEvent.loaded / progressEvent.total) * 50;
                // console.log(progress);
                // setProgress(progress);
            },
        });
        // setIsSuccess(true)
        isSuccess.current = true
        return request
        // if (response.status === 200) {
        //     // File uploaded successfully
        //     // console.log('File uploaded successfully');
        //     setIsSuccess(true)
        //     return response.data.files
        // } else {
        //     // Handle the error if the request was not successful
        //     console.error('File upload failed');
        //     return []
        // }

    };

    return { uploadForm, isSuccess: isSuccess.current, progress };
};
export default useUploadForm;