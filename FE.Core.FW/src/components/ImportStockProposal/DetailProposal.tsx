import { SuppliesCategoryModel, SuppliesKindModel, SuppliesModel } from '@/apis';
import { getImportStockProposalDetail } from '@/apis/services/ImportStockProposalService';
import Table, { ColumnsType } from 'antd/lib/table';
import { useEffect, useState } from 'react';

interface DetailProposalProps {
  proposalId?: string;
  listSupplies: SuppliesModel[],
  listSuppliesKind: SuppliesKindModel[],
  listSuppliesCategory: SuppliesCategoryModel[]
}

interface DetailProposalModel {
  id: string;
  suppliesId: string;
  quantity: number;
  additionalInfo?: string,
  note?: string;
}

const DetailProposal: React.FC<DetailProposalProps> = props => {
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [detailProposal, setDetailProposal] = useState<DetailProposalModel[]>([]);

  useEffect(() => {
    setLoadingData(true);

    getImportStockProposalDetail(props.proposalId)
      .then(responseData => setDetailProposal(responseData.data as DetailProposalModel[]))
      .finally(() => setLoadingData(false));
  }, [props.proposalId]);

  const columns: ColumnsType<DetailProposalModel> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 80,
      ellipsis: true,
      render: (_, record, index) => <>{index + 1}</>
    },
    {
      title: 'Loại vật tư',
      dataIndex: 'suppliesKindId',
      render: (_, record) => {
        let supplies = props.listSupplies.find(item => item.id == record.suppliesId);
        return <>{props.listSuppliesKind.find(item => item.id == supplies?.suppliesKindId)?.name}</>
      }
    },
    {
      title: 'Mã vật tư',
      dataIndex: 'suppliesId',
      render: (_, record) => <>{props.listSupplies.find(item => item.id == record.suppliesId)?.code}</>
    },
    {
      title: 'Danh mục vật tư',
      dataIndex: 'suppliesCategoryId',
      render: (value, record) => {
        let supplies = props.listSupplies.find(item => item.id == record.suppliesId);
        let suppliesKind = props.listSuppliesKind.find(item => item.id == supplies?.suppliesKindId);
        return <>{props.listSuppliesCategory.find(item => item.id == suppliesKind?.suppliesCategoryId)?.name}</>;
      }
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      render: (value) => <>{value}</>
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note'
    },
  ];

  return (
    <Table
      rowKey='id'
      columns={columns}
      dataSource={detailProposal}
      loading={loadingData}
      pagination={false}
    />
  )
}

export default DetailProposal;
