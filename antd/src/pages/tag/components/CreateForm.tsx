import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { ITag, ICreateTag } from '../data.d';

interface CreateFormProps {
  onSubmit: (formValues: Partial<ITag>) => void;
  onCancel: (flag?: boolean, formValues?: Partial<ITag>) => void;
  modalVisible: boolean;
  values: Partial<ITag>;
}

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

// reset form fields when modal is form, closed
const useResetFormOnCloseModal = (form, visible) => {
  const prevVisibleRef = useRef();
  useEffect(() => {
    prevVisibleRef.current = visible;
  }, [visible]);

  const prevVisible = prevVisibleRef.current;

  useEffect(() => {
    if (!visible && prevVisible) {
      form.resetFields();
    }
  }, [visible]);
};

const CreateForm: React.FC<CreateFormProps> = ({
  onSubmit: onSubmitToParent,
  onCancel: onCancelToParent,
  modalVisible,
  values,
}) => {
  const [formValuesState, setFormValuesState] = useState<Partial<ICreateTag>>({});

  const [form] = Form.useForm();

  useResetFormOnCloseModal(form, modalVisible)

  const nextStep = async () => {
    const fieldsValue = await form.validateFields();
    const validValues = { ...formValuesState, ...fieldsValue };
    validValues.parentId = values.id;
    onSubmitToParent(validValues);
  };

  const renderContent = () => {
    return (
      <>
        <FormItem label="上级ID">
          <span className="ant-form-text">{values.id}</span>
        </FormItem>
        <FormItem label="上级名称">
          <span className="ant-form-text">{values.name}</span>
        </FormItem>
        <FormItem name="name" label="名称">
          <Input />
        </FormItem>
        <FormItem name="describe" label="描述">
          <Input />
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
      title="新建标签"
      visible={modalVisible}
      footer={renderFooter()}
      onCancel={() => onCancelToParent()}
    >
      <Form {...formLayout} form={form} initialValues={formValuesState}>
        {renderContent()}
      </Form>
    </Modal>
  );
};

export default CreateForm;
