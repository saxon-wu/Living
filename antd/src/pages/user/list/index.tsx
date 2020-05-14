import { Divider } from 'antd';
import React, { useRef, useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { IUser, IUpdateUser, UserStatusReference, UserStatusEnum } from '../data.d';
import { queryUsersService } from '@/services/user.service';
import { IPagination } from '@/shared/pagination.interface';
import UpdateForm from '../components/UpdateForm';
import { connect, IUserModelState } from 'umi';

export interface IUserListProps {
  updateUserFromModel: (id: number, data: IUpdateUser) => Promise<any>;
}

interface IUserConnectState {
  UserStateFromModel: IUserModelState;
}

const UserList: React.FC<IUserListProps> = ({ updateUserFromModel }) => {
  const [updateModalVisibleState, setUpdateModalVisible] = useState<boolean>(false);
  const [formValuesState, setFormValuesState] = useState<Partial<IUser>>({});
  const actionRef = useRef<ActionType>();
  const columns: ProColumns<IUser>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      render: (_, record) => (
        <>
          <img src={record.avatar} />
        </>
      ),
    },
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      title: '文章数',
      dataIndex: 'articlesCount',
      sorter: true,
    },
    {
      title: '点赞数',
      dataIndex: 'likeArticlesCount',
      sorter: true,
    },
    {
      title: '收藏数',
      dataIndex: 'favoritesCount',
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: UserStatusReference,
    },
    {
      title: '注册时间',
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
      <ProTable<IUser>
        headerTitle="查询用户"
        actionRef={actionRef}
        rowKey="id"
        request={async (params = {}) => {
          const response = await queryUsersService(params as IPagination);
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
            updateUserFromModel(formValuesState.id as number, {
              status: value.status as UserStatusEnum,
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
  ({ UserStateFromModel }: IUserConnectState) => ({ UserStateFromModel }),
  (dispatch) => ({
    fetchUsersFromModel: () => {
      dispatch({
        type: 'UserModel/fetchUsersModel',
      });
    },
    updateUserFromModel: (id: number, data: IUpdateUser) =>
      new Promise((resolve, reject) => {
        dispatch({
          type: 'UserModel/updateUserModel',
          payload: { id, data },
          callback: (response: any) => resolve(response),
        });
      }),
  }),
)(UserList);
