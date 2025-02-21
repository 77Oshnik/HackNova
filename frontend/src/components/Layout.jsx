import Header from "./Header";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Header />
      <div className="mt-16"> {/* Add margin to avoid navbar overlap */}
        <Outlet /> {/* This renders the matched route */}
      </div>
    </>
  );
};

export default Layout;
