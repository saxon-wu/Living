import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Modal, Radio, Input } from 'antd';
import { ITag } from '../data.d';

interface UpdateFormProps {
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

const UpdateForm: React.FC<UpdateFormProps> = ({
  onSubmit: onSubmitToParent,
  onCancel: onCancelToParent,
  modalVisible,
  values,
}) => {
  const [formValuesState, setFormValuesState] = useState<Partial<ITag>>(values);

  const [form] = Form.useForm();

  const nextStep = async () => {
    const fieldsValue = await form.validateFields();
    const validValues = { ...formValuesState, ...fieldsValue };
    onSubmitToParent(validValues);
  };

  const renderContent = () => {
    return (
      <>
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
      title="修改标签"
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

export default UpdateForm;
