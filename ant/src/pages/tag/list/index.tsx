import React, { useRef, useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'umi';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { queryTagsService, createTagService } from '@/services/tag.service';
import { ITag, IUpdateTag, ICreateTag } from '../data.d';
import { IPagination } from '@/shared/pagination.interface';
import UpdateForm from '../components/UpdateForm';
import CreateForm from '../components/CreateForm';
import { Button, Dropdown, Menu, message, Divider } from 'antd';
import { PlusOutlined, DownOutlined } from '@ant-design/icons';
import { ITagModelState } from '@/models/tag.model';

export interface ITagListProps {
  updateTagFromModel: (id: number, data: IUpdateTag) => Promise<any>;
  createTagFromModel: (data: IUpdateTag) => Promise<any>;
  deleteTagFromModel: (id: number[]) => Promise<any>;
}

interface ITagConnectState {
  TagStateFromModel: ITagModelState;
}

const TagList: React.FC<ITagListProps> = ({
  updateTagFromModel,
  createTagFromModel,
  deleteTagFromModel,
}) => {
  const [updateModalVisibleState, setUpdateModalVisible] = useState<boolean>(false);
  const [createModalVisibleState, setCreateModalVisible] = useState<boolean>(false);
  const [formValuesState, setFormValuesState] = useState<Partial<ITag>>({});
  const actionRef = useRef<ActionType>();
  const columns: ProColumns<ITag>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      hideInForm: true,
    },
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '描述',
      dataIndex: 'describe',
    },
    {
      title: '创建者',
      dataIndex: 'creator',
      renderText: (val: { id: string; username: string }) => `${val?.username}`,
      hideInForm: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      sorter: true,
      hideInForm: true,
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
            编辑
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => {
              setCreateModalVisible(true);
              setFormValuesState(record);
            }}
          >
            新增
          </a>
        </>
      ),
    },
  ];

  return (
    <PageHeaderWrapper>
      <ProTable
        headerTitle="查询标签"
        actionRef={actionRef}
        rowKey="id"
        request={async (params = {}) => {
          const response = await queryTagsService(params as IPagination);
          return {
            data: response.result.items,
            page: params.current,
            success: true,
            total: response.result.meta.totalItems,
          };
        }}
        columns={columns}
        rowSelection={{}}
        search={false}
        toolBarRender={(action, { selectedRowKeys, selectedRows }) => {
          /**
           * 当树形table时，子选择后selectedRows依然为空，而selectedRowKeys则有值。
           * 所以这里用selectedRowKeys来处理数据
           */
          return [
            <Button type="primary" onClick={() => setCreateModalVisible(true)}>
              <PlusOutlined /> 新建
            </Button>,
            selectedRowKeys && selectedRowKeys.length > 0 && (
              <Dropdown
                overlay={
                  <Menu
                    onClick={async (e) => {
                      if (e.key === 'remove') {
                        const ids = selectedRowKeys as number[];
                        deleteTagFromModel(ids).then((response) => {
                          setCreateModalVisible(false);
                          // setFormValuesState({});
                          if (actionRef.current) {
                            actionRef.current.reload();
                          }
                        });
                      }
                    }}
                    selectedKeys={[]}
                  >
                    <Menu.Item key="remove">批量删除</Menu.Item>
                    <Menu.Item key="approval">批量审批</Menu.Item>
                  </Menu>
                }
              >
                <Button>
                  批量操作 <DownOutlined />
                </Button>
              </Dropdown>
            ),
          ];
        }}
        tableAlertRender={(selectedRowKeys, selectedRows) => (
          <div>
            已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
          </div>
        )}
      />
      <CreateForm
        onSubmit={async (value) => {
          createTagFromModel(value).then((response) => {
            setCreateModalVisible(false);
            setFormValuesState({});
            if (actionRef.current) {
              actionRef.current.reload();
            }
          });
        }}
        onCancel={() => {
          setCreateModalVisible(false);
          setFormValuesState({});
        }}
        modalVisible={createModalVisibleState}
        values={formValuesState}
      />
      {formValuesState && Object.keys(formValuesState).length ? (
        <UpdateForm
          onSubmit={(value) => {
            updateTagFromModel(formValuesState.id as number, {
              name: value.name as string,
              describe: value.describe as string,
              parentId: value.parentId as number,
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
          modalVisible={updateModalVisibleState}
          values={formValuesState}
        />
      ) : null}
    </PageHeaderWrapper>
  );
};

export default connect(
  ({ TagStateFromModel }: ITagConnectState) => ({ TagStateFromModel }),
  (dispatch) => ({
    fetchTagsFromModel: () =>
      dispatch({
        type: 'TagModel/fetchTagsModel',
      }),
    updateTagFromModel: (id: number, data: IUpdateTag) =>
      new Promise((resolve, reject) => {
        dispatch({
          type: 'TagModel/updateTagModel',
          payload: { id, data },
          callback: (response: any) => resolve(response),
        });
      }),
    createTagFromModel: (data: ICreateTag) =>
      new Promise((resolve, reject) => {
        dispatch({
          type: 'TagModel/createTagModel',
          payload: { data },
          callback: (response: any) => resolve(response),
        });
      }),
    deleteTagFromModel: (ids: number[]) =>
      new Promise((resolve, reject) => {
        dispatch({
          type: 'TagModel/deleteTagModel',
          payload: { ids },
          callback: (response: any) => resolve(response),
        });
      }),
  }),
)(TagList);
