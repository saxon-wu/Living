import Footer from "./Footer";
import Meta from "./Meta";
import Navbar from "./Navbar";
import { ToastContainer } from "react-toastify";

type Props = {
  setNavbarTransparent?: boolean;
};

const Layout: React.FunctionComponent<Props> = ({ children, setNavbarTransparent=true }) => {
  return (
    <>
      <Meta />
      <div className="min-h-screen">
        <Navbar transparent={setNavbarTransparent}/>
        <main>{children}</main>
      </div>
      <Footer />
      <ToastContainer />
    </>
  );
};
export default Layout;
