type Props = {};

const PostTitle: React.FunctionComponent<Props> = ({ children }) => {
  return (
    <h1 className="text-2xl font-bold tracking-tighter leading-tight md:leading-none my-10 text-center md:text-left">
      {children}
    </h1>
  );
};
export default PostTitle;
