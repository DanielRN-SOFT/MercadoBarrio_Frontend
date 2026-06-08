import { Outlet } from "react-router-dom";
import BottonNavBarMobile from "../components/publica/BottonNavBarMobile";
import Footer from "../components/publica/Footer";
import TopNavBar from "../components/publica/TopNavBar";

const PublicLayout = () => {
  return (
    <>
      <div className="bg-background text-on-surface min-h-screen pb-20 md:pb-0">
        <TopNavBar />
        <main>
          <Outlet />
        </main>
        <BottonNavBarMobile />
        <Footer />
      </div>
    </>
  );
};

export default PublicLayout;
