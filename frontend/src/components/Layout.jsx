import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <div className="mt-16">{children}</div> {/* Render the routed components */}
    </>
  );
};

export default Layout