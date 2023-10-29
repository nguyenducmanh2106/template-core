import { UploadFile } from "antd"

function useFileConvert() {
    const uuidv4 = (): string => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
            .replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
    }

    /**
     * Chuyển filePathString thành mảng file
     * @param filePath 
     * @param fileName 
     * @returns 
     */
    const filePathStringConvertToArrayFile = (filePath?: string | null | undefined, fileName?: string | null | undefined): UploadFile[] => {
        const filePathList = Boolean(filePath) ? filePath?.split(',') : []
        const fileNameList = Boolean(fileName) ? fileName?.split(',') as string[] : []
        const files: UploadFile[] = []
        filePathList?.forEach((filePath: string, idx: number) => {
            const fileObj: UploadFile = {
                name: fileNameList[idx],
                uid: uuidv4(),
                url: filePath,
                thumbUrl: import.meta.env.VITE_HOST + '/' + filePath,
                status: 'done',
                percent: 100,
                type: 'image/*',
                response: {
                    files: [
                        {
                            name: fileNameList[idx],
                            url: filePath,
                        }
                    ]
                }
            }
            files.push(fileObj);
        })
        return files
    }

    /**
     * Chuyển mảng file thành dạng filePathString
     * @param fileList 
     * @returns 
     */
    const arrayFileConvertToFilePathString = (fileList?: UploadFile[]) => {
        if (!fileList) {
            return {
                filePath: "",
                fileName: ""
            }
        }

        let filePath = "";
        let fileName = "";
        fileList?.forEach((file: UploadFile) => {
            if (file.response?.files?.length > 0) {
                filePath = filePath ? `${filePath},${file.response?.files[0]?.url}` : file.response?.files[0]?.url
                fileName = fileName ? `${fileName},${file.response?.files[0]?.name}` : file.response?.files[0]?.name
            }
        })
        return {
            filePath,
            fileName
        }
    }
    return { filePathStringConvertToArrayFile, arrayFileConvertToFilePathString }
}
export default useFileConvert;