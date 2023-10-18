import React, { useState } from 'react';
import { Button, Divider, Input, Popconfirm, Table, message, Select } from 'antd';
import { SelectOptionModel, TableFormDataType } from '@/apis/models/data';

interface TableFormProps {
  value?: TableFormDataType[];
  examVersions?: SelectOptionModel[];
  onChange?: (value: TableFormDataType[]) => void;
}

const TableForm: React.FC<TableFormProps> = (props) => {
  const { value, examVersions, onChange } = props;
  const [cacheOriginData, setCacheOriginData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<TableFormDataType[] | undefined>(value);
  const [examVersionTemps, setExamVersionTemps] = useState<SelectOptionModel[]>(examVersions as SelectOptionModel[]);
  const [examVersionTempValue, setExamVersionTempValue] = useState<string>();

  const getRowByKey = (key: string, newData?: TableFormDataType[]) =>
    (newData || data)?.filter((item) => item.key === key)[0];

  const toggleEditable = (e: React.MouseEvent | React.KeyboardEvent, key: string) => {
    e.preventDefault();
    var isError = false;
    data?.forEach((item: TableFormDataType) => {
      if (item.edit)
        isError = true;
      return;
    })
    if (isError)
      message.error('Hãy lưu dòng đang sửa');
    else {
      const newData = data?.map((item) => ({ ...item }));
      const target = getRowByKey(key, newData);

      if (target) {
        // Save data
        var dataTemps: string[] = [];
        data?.forEach((item: TableFormDataType) => {
          if (item.examVersionId != target['examVersionId'])
            dataTemps.push(item.examVersionId as string);
        })
        const examVersionTeemm = examVersions?.filter((item: SelectOptionModel) => {
          return !dataTemps.includes(item.key)
        })
        setExamVersionTempValue(target['examVersionId'])
        setExamVersionTemps(examVersionTeemm as [])
        if (!target.edit) {
          cacheOriginData[key] = { ...target };
          setCacheOriginData(cacheOriginData);
        }
        target.edit = !target.edit;
        setData(newData);
      }
    }
  };


  const examVersionSelect = (value: string, fieldName: string, key: string) => {
    setExamVersionTempValue(value)
    const newData = [...(data as TableFormDataType[])];
    const target = getRowByKey(key, newData) || ({} as any);
    if (target) {
      target[fieldName] = value;
      target['place'] = '';
      setData(newData);
    }
  };

  const saveRow = (e: React.MouseEvent | React.KeyboardEvent, key: string) => {
    e.persist();
    setLoading(true);
    const target = getRowByKey(key) || ({} as any);
    delete target.isNew;
    target['edit'] = false;
    if (onChange) {
      onChange(data as TableFormDataType[]);
    }
    setLoading(false);
  };

  const cancel = (e: React.MouseEvent, key: string) => {
    setLoading(true);
    e.preventDefault();
    const newData = [...(data as TableFormDataType[])];
    // default data
    let cacheData = [];
    cacheData = newData.map((item) => {
      if (item.key === key) {
        if (cacheOriginData[key]) {
          const originItem = {
            ...item,
            ...cacheOriginData[key],
            edit: false,
          };
          delete cacheOriginData[key];
          setCacheOriginData(cacheOriginData);
          return originItem;
        }
      }
      return item;
    });
    setData(cacheData);
    setLoading(false);
  };

  const columns = [
    {
      title: 'Bài thi',
      dataIndex: 'examName',
      key: 'examName',
      width: '20%',
      render: (text: string) => {
        return text;
      },
    },
    {
      title: 'Phiên bản',
      dataIndex: 'examVersion',
      key: 'examVersion',
      width: '15%',
      render: (text: string[], record: TableFormDataType) => {
        if (record.edit) {
          return (
            <div>
              <Select value={examVersionTempValue} options={examVersionTemps} onChange={(e) => examVersionSelect(e, 'area', record.key)}></Select>
              <Input
                hidden={true}
                value={record.examVersionId}
              />
            </div>
          );
        }
        return record.examVersion;
      },
    },
    {
      title: 'Ngôn ngữ',
      dataIndex: 'language',
      key: 'language',
      width: '10%',
      render: (text: string) => {
        return text;
      },
    },
    {
      title: 'Thời gian thi',
      dataIndex: 'timeTest',
      key: 'timeTest',
      width: '20%',
      render: (text: string) => {
        return text;
      },
    },
    {
      title: 'Địa điểm thi',
      dataIndex: 'address',
      key: 'address',
      width: '20%',
      render: (text: boolean) => {
        return text;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '10%',
      render: (text: string, record: TableFormDataType) => {
        if (!!record.edit && loading) {
          return null;
        }
        if (record.edit) {
          if (record.isNew) {
            return (
              <span>
                <a onClick={(e) => saveRow(e, record.key)}>Lưu</a>
              </span>
            );
          }
          return (
            <span>
              <a onClick={(e) => saveRow(e, record.key)}>Lưu</a>
              <Divider type='vertical' />
              <a onClick={(e) => cancel(e, record.key)}>Hủy</a>
            </span>
          );
        }
        return (
          <span>
            <a onClick={(e) => toggleEditable(e, record.key)}>Sửa</a>
          </span>
        );
      },
    },
  ];

  return (
    <>
      <Table loading={loading} columns={columns} dataSource={data} pagination={false} />
    </>
  );
};

export default TableForm;
