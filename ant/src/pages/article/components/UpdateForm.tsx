import React, { useState } from 'react';
import { Form, Button, Modal, Radio } from 'antd';

import { IArticle, ArticleStatusEnum, ArticleStatusReference } from '../data.d';
import { enumToArray } from '@/utils/utils';

export interface UpdateFormProps {
  onSubmit: (formValues: Partial<IArticle>) => void;
  onCancel: (flag?: boolean, formValues?: Partial<IArticle>) => void;
  updateModalVisible: boolean;
  values: Partial<IArticle>;
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
  const [formValuesState, setFormValuesState] = useState<Partial<IArticle>>({
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
            {enumToArray(ArticleStatusEnum).map((v, i) => (
              <Radio key={i} value={v}>
                {ArticleStatusReference[v].text}
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
