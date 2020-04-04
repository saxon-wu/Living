import React, { useState } from 'react';
import { Form, Button, Modal, Radio } from 'antd';

import { IUser, UserStatusEnum, UserStatusReference } from '../data.d';
import { enumToArray } from '@/utils/utils';

export interface UpdateFormProps {
  onSubmit: (formValues: Partial<IUser>) => void;
  onCancel: (flag?: boolean, formValues?: Partial<IUser>) => void;
  updateModalVisible: boolean;
  values: Partial<IUser>;
}

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

const UpdateForm: React.FC<UpdateFormProps> = ({
  onSubmit: onSubmitToParent,
  onCancel: onCancelToParent,
  updateModalVisible,
  values,
}) => {
  const [formValuesState, setFormValuesState] = useState<Partial<IUser>>({
    status: values.status,
  });

  const [form] = Form.useForm();

  const nextStep = async () => {
    const fieldsValue = await form.validateFields();

    setFormValuesState({ ...formValuesState, ...fieldsValue });

    onSubmitToParent(formValuesState);
  };

  const renderContent = () => {
    return (
      <>
        <FormItem name="status" label="状态">
          <RadioGroup onChange={(e) => setFormValuesState({ status: e.target.value })}>
            {enumToArray(UserStatusEnum).map((v, i) => (
              <Radio key={i} value={v}>
                {UserStatusReference[v].text}
              </Radio>
            ))}
          </RadioGroup>
        </FormItem>
      </>
    );
  };

  const renderFooter = () => {
    return (
      <>
        <Button onClick={() => onCancelToParent(false, values)}>取消</Button>
        <Button type="primary" onClick={() => nextStep()}>
          确定
        </Button>
      </>
    );
  };

  return (
    <Modal
      width={640}
      bodyStyle={{ padding: '32px 40px 48px' }}
      destroyOnClose
      title="管理操作"
      visible={updateModalVisible}
      footer={renderFooter()}
      onCancel={() => onCancelToParent()}
    >
      <Form
        {...formLayout}
        form={form}
        initialValues={{
          status: formValuesState.status,
        }}
      >
        {renderContent()}
      </Form>
    </Modal>
  );
};

export default UpdateForm;
