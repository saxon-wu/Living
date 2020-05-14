import React, { useRef, useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect, IArticleModelState } from 'umi';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { queryArticlesService } from '@/services/article.service';
import {
  IArticle,
  ArticleStatusReference,
  ArticleStatusEnum,
  IUpdateArticle,
} from '../data.d';
import { IPagination } from '@/shared/pagination.interface';
import UpdateForm from '../components/UpdateForm';

export interface IArticleListProps {
  updateArticleFromModel: (id: number, data: IUpdateArticle) => Promise<any>;
}

interface IArticleConnectState {
  ArticleStateFromModel: IArticleModelState;
}

const ArticleList: React.FC<IArticleListProps> = ({ updateArticleFromModel }) => {
  // useEffect(() => {
  //   fetchArticlesFromModel();
  // }, [1]);
  const [updateModalVisibleState, setUpdateModalVisible] = useState<boolean>(false);
  const [formValuesState, setFormValuesState] = useState<Partial<IArticle>>({});
  const actionRef = useRef<ActionType>();
  const columns: ProColumns<IArticle>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '标题',
      dataIndex: 'title',
    },
    {
      title: '获赞数',
      dataIndex: 'likesCount',
    },
    {
      title: '获藏数',
      dataIndex: 'favoriteUsersCount',
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: ArticleStatusReference,
    },
    {
      title: '发布者',
      dataIndex: 'publisher',
      renderText: (val: { id: string; username: string }) => `${val?.username}`,
    },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      sorter: true,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              setUpdateModalVisible(true);
              setFormValuesState(record);
            }}
          >
            管理
          </a>
          {/* <Divider type="vertical" />
          <a href="">订阅警报</a> */}
        </>
      ),
    },
  ];
  return (
    <PageHeaderWrapper>
      <ProTable
        headerTitle="查询文章"
        actionRef={actionRef}
        rowKey="id"
        request={async (params = {}) => {
          const response = await queryArticlesService(params as IPagination);
          return {
            data: response.results.items,
            page: params.current,
            success: true,
            total: response.results.meta.totalItems,
          };
        }}
        columns={columns}
        rowSelection={false}
        search={false}
      />
      {formValuesState && Object.keys(formValuesState).length ? (
        <UpdateForm
          onSubmit={(value) => {
            updateArticleFromModel(formValuesState.id as number, {
              status: value.status as ArticleStatusEnum,
            }).then((response) => {
              setUpdateModalVisible(false);
              setFormValuesState({});
              if (actionRef.current) {
                actionRef.current.reload();
              }
            });
          }}
          onCancel={() => {
            setUpdateModalVisible(false);
            setFormValuesState({});
          }}
          updateModalVisible={updateModalVisibleState}
          values={formValuesState}
        />
      ) : null}
    </PageHeaderWrapper>
  );
};

export default connect(
  ({ ArticleStateFromModel }: IArticleConnectState) => ({ ArticleStateFromModel }),
  (dispatch) => ({
    fetchArticlesFromModel: () =>
      dispatch({
        type: 'ArticleModel/fetchArticlesModel',
      }),
    updateArticleFromModel: (id: number, data: IUpdateArticle) =>
      new Promise((resolve, reject) => {
        dispatch({
          type: 'ArticleModel/updateArticleModel',
          payload: { id, data },
          callback: (response: any) => resolve(response),
        });
      }),
  }),
)(ArticleList);
